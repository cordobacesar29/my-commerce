"use server";

import { cookies } from "next/headers";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase"; // Ajusta según tu ruta
import { UserRoleSchema } from "@/types/roles";

export async function createAuthSession(uid: string) {
  // 1. Buscamos el rol en Firestore
  const userDoc = await getDoc(doc(db, "users", uid));
  const userData = userDoc.data();
  
  // 2. Validamos el rol con el esquema que creamos (Type Safety)
  const roleResult = UserRoleSchema.safeParse(userData?.role);
  const role = roleResult.success ? roleResult.data : "CUSTOMER";

  // 3. Seteamos las cookies
  const cookieStore = await cookies();
  
  cookieStore.set("user-role", role, {
    path: "/",
    httpOnly: false, // Para que el middleware lo lea
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  });

  return { success: true };
}

export async function removeAuthSession() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  cookieStore.delete("user-role");
}