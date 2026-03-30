import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { CreateOrderSchema } from "@/schema/IOrderSchema";
import { Preference } from "mercadopago";
import { mercadoPagoClient } from "@/lib/mercado-pago";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Validación con Zod
    const validation = CreateOrderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        error: "Datos de orden inválidos",
        details: validation.error.format() 
      }, { status: 400 });
    }

    const orderData = validation.data;

    // 2. Transacción en Firestore (Crear orden + Actualizar Usuario)
    const orderId = await adminDb.runTransaction(async (transaction) => {
      const userRef = adminDb.collection("users").doc(orderData.userId);
      const orderRef = adminDb.collection("orders").doc(); // Genera ID automático
      
      transaction.set(orderRef, {
        ...orderData,
        status: "pending_payment",
        createdAt: FieldValue.serverTimestamp(),
      });

      transaction.update(userRef, {
        totalOrders: FieldValue.increment(1),
        lastOrderAt: FieldValue.serverTimestamp(),
      });

      return orderRef.id;
    });

    // 3. Preparar datos para Mercado Pago
    const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const cleanBaseUrl = appBaseUrl.replace(/\/$/, "");

    // Limpieza de teléfono y dirección (lo que tenías en la otra ruta)
    const rawPhone = String(orderData.shipping.phone || "");
    const normalizedPhone = rawPhone.replaceAll(/\D/g, "");
    const phone = normalizedPhone.length >= 3 
      ? { area_code: normalizedPhone.slice(0, 2), number: normalizedPhone.slice(2) }
      : undefined;

    const streetNumberMatch = /\d+/.exec(orderData.shipping.address);
    const streetNumber = streetNumberMatch ? Number(streetNumberMatch[0]) : 1;

    // 4. Crear Preferencia en Mercado Pago
    const preference = new Preference(mercadoPagoClient);
    
    const mpItems = orderData.items.map((item) => ({
      id: item.id,
      title: `Remera Ramon Store - Talle ${item.size}`,
      unit_price: item.priceUnit,
      quantity: item.quantity,
      currency_id: "ARS",
      description: `Color: ${item.colorName}`,
      picture_url: (item as any).designUrl || ""
    }));

    const subtotalProductos = orderData.items.reduce(
  (acc: number, item: any) => acc + (item.priceUnit * item.quantity), 
  0
);

const costoEnvio = orderData.total - subtotalProductos;

// 3. Si hay costo de envío, lo agregamos como un ítem más
if (costoEnvio > 0) {
  mpItems.push({
    id: "shipping-fee",
    title: "Costo de Envío",
    unit_price: costoEnvio, // Los otros $5
    quantity: 1,
    currency_id: "ARS",
    description: "Envío a domicilio",
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
          }
        },
        back_urls: {
          success: `${cleanBaseUrl}/cart?status=success`,
          failure: `${cleanBaseUrl}/cart?status=failure`,
          pending: `${cleanBaseUrl}/cart?status=pending`,
        },
        auto_return: "approved",
        external_reference: orderId, // Vinculo fundamental para el Webhook
        notification_url: `${cleanBaseUrl}/api/mercado-pago/webhook`,
        statement_descriptor: "RAMON STORE",
      }
    });

    // 5. Respuesta de éxito con la URL de MP
    return NextResponse.json({
      success: true,
      orderId: orderId,
      checkoutUrl: createdPreference.init_point, // Redirigir a esto en el front
      message: "Orden creada y preferencia de pago generada"
    });

  } catch (err: any) {
    console.error("Error en checkout unificado:", err);
    return NextResponse.json(
      { error: "No se pudo procesar la compra", details: err.message }, 
      { status: 500 }
    );
  }
}