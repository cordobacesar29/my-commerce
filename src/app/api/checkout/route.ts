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

    // --- CÁLCULOS DE SEGURIDAD EN EL SERVIDOR ---
    // Recalculamos para asegurar que no se pisen o manipulen las cantidades/precios
    const calculatedSubtotal = orderData.items.reduce(
      (acc, item) => acc + (item.priceUnit * item.quantity), 
      0
    );

    // Regla de negocio: Envío gratis > $8000, caso contrario $500
    const calculatedShipping = calculatedSubtotal > 8000 ? 0 : 500;
    const finalTotal = calculatedSubtotal + calculatedShipping;

    // 2. Transacción en Firestore (Crear orden + Actualizar Usuario de forma atómica)
    const orderId = await adminDb.runTransaction(async (transaction) => {
      const userRef = adminDb.collection("users").doc(orderData.userId);
      const userDoc = await transaction.get(userRef);
      
      if (!userDoc.exists) {
        throw new Error("El usuario no existe en la base de datos");
      }

      const orderRef = adminDb.collection("orders").doc(); // ID automático para la orden

      transaction.set(orderRef, {
        ...orderData,
        total: finalTotal,
        subtotal: calculatedSubtotal,
        shippingFee: calculatedShipping,
        status: "pending_payment", // Estado inicial
        createdAt: FieldValue.serverTimestamp(),
      });

      // Incremento atómico para evitar errores de concurrencia
      transaction.update(userRef, {
        totalOrders: FieldValue.increment(1),
        lastOrderAt: FieldValue.serverTimestamp(),
      });

      return orderRef.id;
    });

    // 3. Configuración de URLs y limpieza de datos para Mercado Pago
    const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const cleanBaseUrl = appBaseUrl.replace(/\/$/, "");

    // Formateo de teléfono (Mercado Pago espera area_code y number por separado)
    const rawPhone = String(orderData.shipping.phone || "");
    const normalizedPhone = rawPhone.replaceAll(/\D/g, "");
    const phone = normalizedPhone.length >= 3 
      ? { area_code: normalizedPhone.slice(0, 2), number: normalizedPhone.slice(2) }
      : undefined;

    // Extracción de número de calle (fallback a 1 si no se encuentra)
    const streetNumberMatch = /\d+/.exec(orderData.shipping.address);
    const streetNumber = streetNumberMatch ? Number(streetNumberMatch[0]) : 1;

    // 4. Crear Preferencia en Mercado Pago
    const preference = new Preference(mercadoPagoClient);
    
    // Mapeo de items del carrito al formato de MP
    const mpItems = orderData.items.map((item) => ({
      id: item.id,
      title: `Remera Ramon Store - Talle ${item.size}`,
      unit_price: item.priceUnit,
      quantity: item.quantity,
      currency_id: "ARS",
      description: `Color: ${item.colorName}, Posición: ${item.position}`,
      picture_url: (item as any).designUrl || ""
    }));

    // Si hay costo de envío, se agrega como un item adicional
    if (calculatedShipping > 0) {
      mpItems.push({
        id: "shipping-fee",
        title: "Costo de Envío",
        unit_price: calculatedShipping,
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
        // El external_reference es la clave para que el Webhook sepa qué orden actualizar
        external_reference: orderId, 
        notification_url: `${cleanBaseUrl}/api/mercado-pago/webhook`,
        statement_descriptor: "RAMON STORE",
      }
    });

    // 5. Respuesta final con la URL de redirección
    return NextResponse.json({
      success: true,
      orderId: orderId,
      checkoutUrl: createdPreference.init_point, 
      message: "Orden procesada exitosamente"
    });

  } catch (err: any) {
    console.error("Error en el proceso de checkout:", err);
    return NextResponse.json(
      { error: "No se pudo procesar la compra", details: err.message }, 
      { status: 500 }
    );
  }
}