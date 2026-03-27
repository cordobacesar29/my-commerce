import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase"; // Asegurate que el path sea correcto
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  doc, 
  updateDoc, 
  increment 
} from "firebase/firestore";

// Importamos el Schema y la Interface que creamos
import { CreateOrderSchema } from "@/schema/IOrderSchema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Validación estricta con Zod
    const validation = CreateOrderSchema.safeParse(body);

    if (!validation.success) {
      // Usamos format() para que el frontend reciba un objeto legible de errores
      return NextResponse.json({
        error: "Datos de orden inválidos",
        details: validation.error.format() 
      }, { status: 400 });
    }

    // 2. Extraemos los datos validados
    const orderData = validation.data;

    // 3. Guardamos la orden en la colección raíz 'orders'
    const orderRef = await addDoc(collection(db, "orders"), {
      ...orderData,
      status: "pending_payment",
      createdAt: serverTimestamp()
    });

    // 4. Actualizamos el perfil del usuario (Contador de compras)
    const userRef = doc(db, "users", orderData.userId);
    
    // Usamos updateDoc para no pisar el resto de los datos del usuario
    await updateDoc(userRef, {
      totalOrders: increment(1),
      lastOrderAt: serverTimestamp()
    });

    // 5. Respuesta de éxito
    return NextResponse.json({
      success: true,
      orderId: orderRef.id,
      message: "Orden creada exitosamente"
    });

  } catch (err: any) {
    console.error("Error al procesar el checkout:", err);
    return NextResponse.json(
      { error: "No se pudo procesar la compra", details: err.message }, 
      { status: 500 }
    );
  }
}