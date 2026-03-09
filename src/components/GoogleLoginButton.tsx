"use client";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { FirebaseError } from "firebase/app";

export const GoogleLoginButton = () => {
  const handleLogin = async (): Promise<void> => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);

      const idToken = await result.user.getIdToken();
      await fetch("/api/auth/google-login", {
        method: "POST",
        body: JSON.stringify({ idToken }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      if (error instanceof FirebaseError) {
        console.error("Código de error:", error.code);
      } else {
        console.error("Error desconocido:", error);
      }
    }
  };

  return (
    <button onClick={handleLogin} className="px-4 py-2 bg-white/20 text-black rounded cursor-pointer hover:bg-white/30 transition">
      Iniciá con Google
    </button>
  );
};