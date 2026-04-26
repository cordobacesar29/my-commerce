import { db } from "./firebase";
import { doc, setDoc, serverTimestamp, collection, writeBatch } from "firebase/firestore";
import { User } from "firebase/auth";
import { Order } from "@/schema/IOrderSchema";

export const syncUserRecord = async (user: User | null) => {
  if (!user?.uid) return;
  const userRef = doc(db, "users", user.uid);

  try {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || "Usuario sin nombre",
      photoURL: user.photoURL || "",
      lastLogin: serverTimestamp(),
      // Aquí podrías agregar 'role': 'customer' si planeas un panel admin
    }, { merge: true });
    
  } catch (error) {
    console.error("Error sincronizando usuario:", error);
  }
};

export const createOrderFromCart = async (userId: string, orderData: Omit<Order, 'id' | 'status' | 'createdAt'>) => {
  const orderRef = doc(collection(db, "orders")); // Genera un ID automático
  
  const newOrder: Order = {
    ...orderData,
    id: orderRef.id,
    status: "pending_payment",
    createdAt: new Date(),
    subtotal: orderData.total, // Ajustar según lógica de shipping
    shippingFee: 0, 
  };

  await setDoc(orderRef, newOrder);
  return orderRef.id;
};

export const addDesignsToUserVault = async (userId: string, items: any[]) => {
  const batch = writeBatch(db);
  
  items.forEach((item) => {
    // Usamos el ID del item o un hash del diseño para evitar duplicados en el vault
    const vaultRef = doc(db, "users", userId, "vault", item.id);
    batch.set(vaultRef, {
      ...item.design,
      purchasedAt: serverTimestamp(),
      orderId: item.id // Referencia por si quiere ver cuándo lo compró
    }, { merge: true });
  });

  await batch.commit();
};