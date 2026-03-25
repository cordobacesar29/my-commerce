"use client";
import { useAuthActions } from "@/hooks/useAuthActions";

export const LogoutButton = () => {
  // Extraemos las funciones y estados correctos del hook
  const { logout, loading } = useAuthActions();

  return (
    <button
      onClick={logout}
      disabled={loading}
      className="px-4 py-2 bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:border-red-500 text-red-500 hover:text-white text-[10px] font-bold uppercase tracking-widest rounded-md transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "Cerrando sesión..." : "Cerrar Sesión"}
    </button>
  );
};