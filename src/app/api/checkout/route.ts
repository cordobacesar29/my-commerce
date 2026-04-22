import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { CreateOrderSchema } from "@/schema/IOrderSchema";
import { Preference } from "mercadopago";
import { mercadoPagoClient } from "@/lib/mercado-pago";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validation = CreateOrderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Datos de orden invalidos",
          details: validation.error.format(),
        },
        { status: 400 },
      );
    }

    const orderData = validation.data;

    const calculatedSubtotal = orderData.items.reduce(
      (acc, item) => acc + item.priceUnit * item.quantity,
      0,
    );

    const calculatedShipping = calculatedSubtotal > 8000 ? 0 : 500;
    const finalTotal = calculatedSubtotal + calculatedShipping;

    const orderId = await adminDb.runTransaction(async (transaction) => {
      const userRef = adminDb.collection("users").doc(orderData.userId);
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists) {
        throw new Error("El usuario no existe en la base de datos");
      }

      const orderRef = adminDb.collection("orders").doc();

      transaction.set(orderRef, {
        ...orderData,
        total: finalTotal,
        subtotal: calculatedSubtotal,
        shippingFee: calculatedShipping,
        status: "pending_payment",
        mpPaymentStatus: "pending",
        createdAt: FieldValue.serverTimestamp(),
      });

      return orderRef.id;
    });

    const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const cleanBaseUrl = appBaseUrl.replace(/\/$/, "");

    const rawPhone = String(orderData.shipping.phone || "");
    const normalizedPhone = rawPhone.replaceAll(/\D/g, "");
    const phone =
      normalizedPhone.length >= 3
        ? {
            area_code: normalizedPhone.slice(0, 2),
            number: normalizedPhone.slice(2),
          }
        : undefined;

    const streetNumberMatch = /\d+/.exec(orderData.shipping.address);
    const streetNumber = streetNumberMatch ? Number(streetNumberMatch[0]) : 1;

    const preference = new Preference(mercadoPagoClient);

    const mpItems = orderData.items.map((item) => ({
      id: item.id,
      title: `Remera Ramon Store - Talle ${item.size}`,
      unit_price: item.priceUnit,
      quantity: item.quantity,
      currency_id: "ARS",
      description: `Color: ${item.colorName}, Posicion: ${item.design.placement.preset}`,
      picture_url: item.design.imageUrl,
    }));

    if (calculatedShipping > 0) {
      mpItems.push({
        id: "shipping-fee",
        title: "Costo de Envio",
        unit_price: calculatedShipping,
        quantity: 1,
        currency_id: "ARS",
        description: "Envio a domicilio",
        picture_url: "",
      });
    }

    const createdPreference = await preference.create({
      body: {
        items: mpItems,
        payer: {
          name: orderData.shipping.fullName,
          email: orderData.shipping.email,
          ...(phone ? { phone } : {}),
          address: {
            street_name: orderData.shipping.address,
            street_number: String(streetNumber),
            zip_code: orderData.shipping.zipCode || "0000",
          },
        },
        back_urls: {
          success: `${cleanBaseUrl}/cart?status=success&orderId=${orderId}`,
          failure: `${cleanBaseUrl}/cart?status=failure&orderId=${orderId}`,
          pending: `${cleanBaseUrl}/cart?status=pending&orderId=${orderId}`,
        },
        auto_return: "approved",
        external_reference: orderId,
        notification_url: `${cleanBaseUrl}/api/mercado-pago/webhook`,
        statement_descriptor: "RAMON STORE",
      },
    });

    return NextResponse.json({
      success: true,
      orderId,
      checkoutUrl: createdPreference.init_point,
      message: "Orden procesada exitosamente",
    });
  } catch (error: unknown) {
    console.error("Error en el proceso de checkout:", error);

    const details =
      error instanceof Error ? error.message : "Error desconocido durante el checkout";

    return NextResponse.json(
      { error: "No se pudo procesar la compra", details },
      { status: 500 },
    );
  }
}
