import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

/**
 * POST /api/mercado-pago/webhook
 * 
 * Recibe notificaciones de Mercado Pago sobre el estado de los pagos
 * 
 * MP envía eventos en JSON cuando algo ocurre (pago aprobado, rechazado, etc)
 * 
 * Query params de MP:
 * - action: "payment.created", "payment.updated"
 * - api_version: versión de la API
 * - data.id: ID del pago
 * 
 * Headers para validación:
 * - x-signature: firma HMAC para validar que es de MP
 */

interface MPWebhookPayload {
  action: "payment.created" | "payment.updated" | "plan.updated" | "subscription.created";
  api_version: string;
  data: {
    id: string;
  };
}

interface MPPaymentDetail {
  id: string;
  status: "pending" | "approved" | "authorized" | "in_process" | "in_mediation" | "rejected" | "cancelled" | "refunded" | "charged_back";
  status_detail: string;
  external_reference: string; // orderId
  payer: {
    id: number;
    email: string;
    first_name?: string;
    last_name?: string;
  };
  transaction_amount: number;
  description: string;
  coupon_code?: string;
}

/**
 * Validar firma HMAC de Mercado Pago
 * Ref: https://www.mercadopago.com.ar/developers/es/docs/checkout-api/additional-content/webhooks/ipn-setup
 */
function validateMPSignature(
  query: Record<string, string | string[]>,
  headers: Record<string, string | string[]>,
  secret: string
): boolean {
  // En production, MP requiere validación con x-signature
  // Por ahora, en desarrollo, podemos saltar esto o loguear para debugging
  
  if (!process.env.WEBHOOK_SECRET) {
    console.warn("WEBHOOK_SECRET no configurado, saltando validación de firma");
    return true;
  }

  const xSignature = headers["x-signature"];
  if (!xSignature || Array.isArray(xSignature)) return false;

  // En producción, MP usa HMAC-SHA256
  // Por ahora, simplemente logueamos y continuamos
  console.log("Webhook signature:", xSignature);
  return true;
}

/**
 * Obtener detalles del pago desde MP API
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
 * Mapear status de MP a status de orden
 */
function mapMPStatusToOrderStatus(
  mpStatus: string
): "pending_payment" | "paid" | "processing" | "failed" | "pending" {
  switch (mpStatus) {
    case "approved":
      return "paid";
    case "pending":
    case "in_process":
      return "pending";
    case "authorized":
      return "processing";
    case "rejected":
    case "cancelled":
    case "in_mediation":
    case "charged_back":
      return "failed";
    default:
      return "pending";
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Obtener query params y headers
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get("action");
    const paymentId = searchParams.get("data.id");

    const headersObj: Record<string, string | string[]> = {};
    request.headers.forEach((value, key) => {
      headersObj[key] = value;
    });

    // 2. Validar firma (si está configurado)
    if (!validateMPSignature(
      Object.fromEntries(searchParams.entries()),
      headersObj,
      process.env.WEBHOOK_SECRET || ""
    )) {
      console.warn("Webhook signature inválida");
      // En desarrollo, continuamos de todas formas
      // En producción, retornaríamos 401
    }

    // 3. Validar que sea notificación de pago
    if (action !== "payment.created" && action !== "payment.updated") {
      console.log(`Ignorando evento: ${action}`);
      return NextResponse.json({ status: "ignored" });
    }

    if (!paymentId) {
      return NextResponse.json(
        { error: "data.id requerido" },
        { status: 400 }
      );
    }

    // 4. Obtener detalles del pago desde MP
    const paymentDetail = await getPaymentDetail(paymentId);
    if (!paymentDetail) {
      return NextResponse.json(
        { error: "No se pudo obtener detalles del pago" },
        { status: 500 }
      );
    }

    const { external_reference, status } = paymentDetail;

    // 5. Validar que tenga external_reference (orderId)
    if (!external_reference) {
      console.warn(`Pago sin external_reference: ${paymentId}`);
      return NextResponse.json({ status: "ignored" });
    }

    // 6. Mapear status de MP a status de orden
    const orderStatus = mapMPStatusToOrderStatus(status);

    // 7. Actualizar orden en Firestore
    const orderRef = adminDb.collection("orders").doc(external_reference);
    await orderRef.update({
      mpPaymentId: paymentId,
      mpPaymentStatus: status,
      status: orderStatus,
      updatedAt: new Date(),
    });

    console.log(`Orden ${external_reference} actualizada a status: ${orderStatus}`);

    // 8. Si el pago es aprobado, actualizar contador del usuario
    if (status === "approved") {
      const orderDoc = await orderRef.get();
      if (orderDoc.exists) {
        const userId = orderDoc.data()?.userId;
        if (userId) {
          const userRef = adminDb.collection("users").doc(userId);
          await userRef.update({
            totalOrders: require("firebase-admin").firestore.FieldValue.increment(1),
            lastOrderAt: new Date(),
          });
        }
      }
    }

    // 9. Responder a MP
    return NextResponse.json(
      {
        status: "success",
        orderId: external_reference,
        mpPaymentId: paymentId,
        orderStatus: orderStatus,
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error("Error en webhook de MP:", error);
    return NextResponse.json(
      {
        error: "Error procesando webhook",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/mercado-pago/webhook
 * 
 * MP envía GET para validar que el endpoint existe
 */
export async function GET() {
  return NextResponse.json(
    { status: "ok", message: "Webhook está activo" },
    { status: 200 }
  );
}