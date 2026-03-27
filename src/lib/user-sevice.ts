import { db } from "./firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { User } from "firebase/auth";

export const syncUserRecord = async (user: User | null) => {
  if (!user?.uid) return;
  console.log("Intentando guardar en Firestore para UID:", user.uid);
  const userRef = doc(db, "users", user.uid);

  try {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || "Usuario TeeForge",
      photoURL: user.photoURL || "",
      lastLogin: serverTimestamp(),
      // Aquí podrías agregar 'role': 'customer' si planeas un panel admin
    }, { merge: true });
    
    console.log("✅ ¡GUARDADO EXITOSO EN FIRESTORE!");
  } catch (error) {
    console.error("Error sincronizando usuario:", error);
  }
};