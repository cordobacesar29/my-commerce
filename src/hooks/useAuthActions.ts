"use client";

import { useCallback, useState, useRef } from "react";
import {
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";
import { auth } from "@/lib/firebase";

const provider = new GoogleAuthProvider();

export const useAuthActions = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isCapturing = useRef(false);

const loginWithGoogle = useCallback(async () => {
  if (isCapturing.current) return;
  isCapturing.current = true;
  setLoading(true);

  try {
    const result = await signInWithPopup(auth, provider);
    
    if (result) {
      // Importante: No borrar el router.refresh() ya que es el que 
      // actualiza los Server Components/Middleware
      router.refresh(); 
      // RETORNAMOS EL RESULTADO (o result.user)
      return result; 
    }
  } catch (err) {
    if (err instanceof FirebaseError) {
      if (err.code === "auth/popup-closed-by-user") {
        setError("El proceso fue cancelado.");
      } else {
        setError("Error al iniciar sesión con Google.");
      }
    } else {
      setError("Ocurrió un error inesperado.");
    }
    return null; 
  } finally {
    setLoading(false);
    isCapturing.current = false;
  }
}, [router]);

 const logout = useCallback(async () => {
  try {
    await signOut(auth); 
    router.push("/");
  } catch (error) {
    console.error(error);
  }
}, [router]);

  return { loginWithGoogle, logout, loading, error };
};