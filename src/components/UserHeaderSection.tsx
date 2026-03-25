"use client";

import { useAuth } from "@/context/AuthContext";
import { LogoutButton } from "./LogoutButton";
import { useEffect, useState } from "react";
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
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      if (error instanceof FirebaseError) {
        console.error("Código de error:", error.code);
      } else {
        console.error("Error desconocido:", error);
      }
    }
  };
  useEffect(() => {
    setOpen(false);
  }, [user]);

  if (!user) {
    return (
      <button
        className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white border border-white/10 hover:bg-white/5 rounded-md transition-all cursor-pointer"
        onClick={handleLogin}
      >
        Iniciar sesión
      </button>
    );
  }

  return (
    <div className="relative flex items-center">
      {/* Botón del Perfil */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 p-1 pr-3 rounded-full hover:bg-white/5 transition-colors cursor-pointer focus:outline-none group"
      >
        {user?.photoURL ? (
          <img
            src={user.photoURL}
            alt="Avatar"
            className="h-8 w-8 rounded-full object-cover border border-white/10 group-hover:border-[#C8A96E] transition-colors"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C8A96E] text-black font-bold text-xs">
            {firstLetter}
          </div>
        )}

        <div className="text-[11px] font-bold tracking-wider text-gray-200 group-hover:text-white transition-colors">
          {user?.displayName?.split(" ")[0] || "Cuenta"}
        </div>

        {/* Flecha indicadora */}
        <svg
          className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Menú Desplegable (Dropdown) */}
      {open && (
        <>
          {/* Overlay invisible para cerrar al hacer click afuera */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />

          <div className="absolute top-full right-0 mt-2 w-48 z-20 overflow-hidden rounded-md bg-[#1A1A1A] border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-3 border-b border-white/5">
              <p className="text-[10px] text-gray-500 uppercase tracking-tighter mb-1">
                Conectado como
              </p>
              <p className="text-xs font-medium text-white truncate">
                {user?.email}
              </p>
            </div>
            <div className="p-2">
              <LogoutButton />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
