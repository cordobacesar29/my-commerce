"use client";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);

      router.push("/login");
      router.refresh(); // Forzamos actualización para que el Middleware actúe
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors cursor-pointer"
    >
      Cerrar Sesión
    </button>
  );
};
