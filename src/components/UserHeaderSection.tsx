"use client";

import { useAuth } from "@/context/AuthContext";
import { LogoutButton } from "./LogoutButton";
import { useState } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { FirebaseError } from "firebase/app";

export const UserHeaderSection = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const name = user?.displayName || user?.email || "";
  const firstLetter = name.charAt(0).toUpperCase();
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

  if (!user) {
    return (
      <button
      className="h-full flex items-center text-white cursor-pointer"
      onClick={handleLogin}
      >
        <p>Iniciar sesión</p>
      </button>
    );
  }
  return (
    <div className="h-full flex items-center gap-3 relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 cursor-pointer focus:outline-none"
      >
        {user?.photoURL ? (
          <img
            src={user.photoURL}
            alt="Avatar"
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500 text-white font-semibold">
            {firstLetter}
          </div>
        )}

        <div className="text-white">{user?.displayName || user?.email}</div>
      </button>
      {open && (
        <div className="rounded-md bg-slate-800 shadow-lg transition-all">
          <LogoutButton />
        </div>
      )}
    </div>
  );
};
