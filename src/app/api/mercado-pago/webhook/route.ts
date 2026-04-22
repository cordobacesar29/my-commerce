import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

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
  } catch {
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
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return NextResponse.json({ status: "ignored", reason: "Order not found" }, { status: 200 });
    }

    const orderData = orderDoc.data();
    const previousOrderStatus = orderData?.status as string | undefined;
    const userId = orderData?.userId as string | undefined;

    // Usamos update para no sobreescribir otros datos de la orden
    await orderRef.update({
      mpPaymentId: paymentId.toString(),
      mpPaymentStatus: status,
      status: orderStatus,
      updatedAt: new Date(),
    });

    const transitionedToPaid = previousOrderStatus !== "paid" && orderStatus === "paid";

    // 5. Lógica de usuario (idempotente): archivar compra y limpiar carrito
    if (transitionedToPaid && userId) {
      const userRef = adminDb.collection("users").doc(userId);
      const purchaseRef = userRef.collection("purchases").doc(external_reference);
      const cartRef = userRef.collection("cart").doc("current");
      const items = Array.isArray(orderData?.items) ? orderData.items : [];
      const itemsCount = items.reduce((acc: number, item: { quantity?: number }) => {
        return acc + (item.quantity ?? 0);
      }, 0);

      await adminDb.runTransaction(async (transaction) => {
        transaction.set(
          purchaseRef,
          {
            orderId: external_reference,
            storeId: orderData?.storeId ?? null,
            userId,
            status: "paid",
            total: orderData?.total ?? 0,
            itemsCount,
            updatedAt: FieldValue.serverTimestamp(),
            paidAt: FieldValue.serverTimestamp(),
          },
          { merge: true },
        );

        transaction.set(
          cartRef,
          {
            items: [],
            updatedAt: new Date().toISOString(),
            archivedOrderId: external_reference,
          },
          { merge: true },
        );

        transaction.set(
          userRef,
          {
            totalOrders: FieldValue.increment(1),
            lastOrderAt: FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
      });
    }

    return NextResponse.json({ status: "success" }, { status: 200 });

  } catch (error: unknown) {
    // Aquí capturamos cualquier error para que no devuelva 500 pelado
    const message = error instanceof Error ? error.message : "Unknown webhook error";
    console.error("❌ Error Webhook Detail:", message);
    return NextResponse.json({ error: "Processed with error", msg: message }, { status: 200 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "ok" });
}
