import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

/**
 * POST /api/mercado-pago/webhook
 */

interface MPPaymentDetail {
  id: string;
  status: "pending" | "approved" | "authorized" | "in_process" | "in_mediation" | "rejected" | "cancelled" | "refunded" | "charged_back";
  status_detail: string;
  external_reference: string; // Este es nuestro orderId
  transaction_amount: number;
}

/**
 * Obtener detalles del pago desde MP API para mayor seguridad
 */
async function getPaymentDetail(paymentId: string): Promise<MPPaymentDetail | null> {
  try {
    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      console.error(`MP API error: ${response.status}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error obteniendo detalles del pago:", error);
    return null;
  }
}

/**
 * Mapear status de MP a nuestro status de orden en Firestore
 */
function mapMPStatusToOrderStatus(
  mpStatus: string
): "pending_payment" | "paid" | "processing" | "failed" | "pending" {
  switch (mpStatus) {
    case "approved":
      return "paid";
    case "pending":
    case "in_process":
      return "pending_payment";
    case "authorized":
      return "processing";
    case "rejected":
    case "cancelled":
    case "charged_back":
      return "failed";
    default:
      return "pending_payment";
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Extraer datos del Body y de los Query Params
    // MP envía los datos en el JSON body en Webhooks v2
    const body = await request.json().catch(() => ({}));
    const searchParams = request.nextUrl.searchParams;

    // Buscamos el ID del pago en todas las ubicaciones posibles
    const paymentId = 
      body.data?.id || 
      searchParams.get("data.id") || 
      searchParams.get("id");

    // Buscamos la acción (payment.created, payment.updated, etc)
    const action = body.action || searchParams.get("action") || searchParams.get("topic");

    console.log("🔔 Webhook recibido:", { action, paymentId });

    // 2. Validar que sea un evento de pago y tengamos un ID
    // Si el action es 'pago' (IPN antiguo) o contiene 'payment'
    const isPaymentEvent = action?.includes("payment") || action === "pay";
    
    if (!isPaymentEvent || !paymentId) {
      console.log(`Evento ignorado o sin ID: ${action}`);
      return NextResponse.json({ status: "ignored" });
    }

    // 3. Obtener la verdad desde la API de Mercado Pago
    const paymentDetail = await getPaymentDetail(paymentId.toString());
    
    if (!paymentDetail) {
      return NextResponse.json(
        { error: "No se pudo validar el pago con MP" },
        { status: 500 }
      );
    }

    const { external_reference, status } = paymentDetail;

    // 4. Validar que el pago pertenezca a una orden de nuestra tienda
    if (!external_reference) {
      console.warn(`Pago ${paymentId} no tiene external_reference (ID de orden)`);
      return NextResponse.json({ status: "ignored" });
    }

    // 5. Mapear estado y actualizar Firestore
    const orderStatus = mapMPStatusToOrderStatus(status);
    const orderRef = adminDb.collection("orders").doc(external_reference);

    await orderRef.update({
      mpPaymentId: paymentId.toString(),
      mpPaymentStatus: status,
      status: orderStatus,
      updatedAt: new Date(),
    });

    console.log(`✅ Orden ${external_reference} actualizada a: ${orderStatus}`);

    // 6. Si el pago es aprobado, actualizar estadísticas del usuario
    if (status === "approved") {
      const orderDoc = await orderRef.get();
      
      if (orderDoc.exists) {
        const userId = orderDoc.data()?.userId;
        if (userId) {
          const { FieldValue } = await import("firebase-admin/firestore");
          const userRef = adminDb.collection("users").doc(userId);
          
          await userRef.update({
            totalOrders: FieldValue.increment(1),
            lastOrderAt: new Date(),
          });
          console.log(`📈 Contador actualizado para usuario: ${userId}`);
        }
      }
    }

    return NextResponse.json({ status: "success", orderId: external_reference }, { status: 200 });

  } catch (error: any) {
    console.error("❌ Error en webhook:", error.message);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: "ok", message: "Webhook activo" });
}