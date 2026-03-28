import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin"; // Tu archivo con JSON.parse
import { FieldValue } from "firebase-admin/firestore";
import { CreateOrderSchema } from "@/schema/IOrderSchema";

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

    // 2. Usamos una Transacción para asegurar que ambas operaciones ocurran
    // Si falla el update del usuario, no se crea la orden.
    const orderId = await adminDb.runTransaction(async (transaction) => {
      const orderRef = adminDb.collection("orders").doc(); // Genera ID automático
      const userRef = adminDb.collection("users").doc(orderData.userId);

      // A. Crear la orden en la colección 'orders'
      transaction.set(orderRef, {
        ...orderData,
        status: "pending_payment",
        createdAt: FieldValue.serverTimestamp(),
      });

      // B. Actualizar el contador en el perfil del usuario
      transaction.update(userRef, {
        totalOrders: FieldValue.increment(1),
        lastOrderAt: FieldValue.serverTimestamp(),
      });

      return orderRef.id;
    });

    // 3. Respuesta de éxito
    return NextResponse.json({
      success: true,
      orderId: orderId,
      message: "Orden creada exitosamente con Admin SDK"
    });

  } catch (err: any) {
    console.error("Error al procesar el checkout (Admin):", err);
    
    // Si el error es "5 NOT_FOUND", es porque el userId no existe en la colección 'users'
    return NextResponse.json(
      { error: "No se pudo procesar la compra", details: err.message }, 
      { status: 500 }
    );
  }
}