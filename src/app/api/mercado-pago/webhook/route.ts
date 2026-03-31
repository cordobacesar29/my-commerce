import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

interface MPPaymentDetail {
  id: string;
  status: string;
  external_reference: string;
}

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

    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    return null;
  }
}

function mapMPStatusToOrderStatus(mpStatus: string) {
  const mapping: Record<string, "paid" | "pending_payment" | "processing" | "failed"> = {
    approved: "paid",
    pending: "pending_payment",
    in_process: "pending_payment",
    authorized: "processing",
    rejected: "failed",
    cancelled: "failed",
    charged_back: "failed",
  };
  return mapping[mpStatus] || "pending_payment";
}

export async function POST(request: NextRequest) {
  try {
    // 1. Parsear el body de forma segura
    const body = await request.json().catch(() => ({}));
    const searchParams = request.nextUrl.searchParams;

    const paymentId = body.data?.id || searchParams.get("data.id") || searchParams.get("id");
    const action = body.action || searchParams.get("action") || searchParams.get("topic");

    console.log("🔔 Webhook:", { action, paymentId });

    // 2. Si no hay ID, no podemos hacer nada
    if (!paymentId) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    // 3. Consultar a MP
    const paymentDetail = await getPaymentDetail(paymentId.toString());
    
    // SI ES UNA SIMULACIÓN CON ID "123456", paymentDetail será null.
    // Respondemos 200 para que MP no siga reintentando, pero avisamos en el log.
    if (!paymentDetail) {
      console.log(`⚠️ Pago ${paymentId} no encontrado en MP (Probablemente una simulación)`);
      return NextResponse.json({ status: "ok", message: "Simulated or not found" }, { status: 200 });
    }

    const { external_reference, status } = paymentDetail;

    if (!external_reference) {
      return NextResponse.json({ status: "ignored", reason: "No external_ref" }, { status: 200 });
    }

    // 4. Actualizar Firestore
    const orderStatus = mapMPStatusToOrderStatus(status);
    const orderRef = adminDb.collection("orders").doc(external_reference);

    // Usamos update para no sobreescribir otros datos de la orden
    await orderRef.update({
      mpPaymentId: paymentId.toString(),
      mpPaymentStatus: status,
      status: orderStatus,
      updatedAt: new Date(),
    });

    // 5. Lógica de usuario (Incrementar contador)
    if (status === "approved") {
      const orderDoc = await orderRef.get();
      if (orderDoc.exists) {
        const userId = orderDoc.data()?.userId;
        if (userId) {
          const { FieldValue } = await import("firebase-admin/firestore");
          await adminDb.collection("users").doc(userId).update({
            totalOrders: FieldValue.increment(1),
            lastOrderAt: new Date(),
          });
        }
      }
    }

    return NextResponse.json({ status: "success" }, { status: 200 });

  } catch (error: any) {
    // Aquí capturamos cualquier error para que no devuelva 500 pelado
    console.error("❌ Error Webhook Detail:", error.message);
    return NextResponse.json({ error: "Processed with error", msg: error.message }, { status: 200 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "ok" });
}