'use client'
import { useAuth } from "@/context/AuthContext";
import { useAuthActions } from "@/hooks/useAuthActions";
import { useRouter } from "next/navigation";

export const useProtectedNavigation = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { loginWithGoogle } = useAuthActions();

  const navigateTo = async (href: string) => {
    // Si ya hay usuario, vamos directo
    if (user) {
      router.push(href);
      return;
    }

    // Si no hay usuario, disparamos el login
    try {
      const result = await loginWithGoogle();
      if (result) {
        // Pequeño delay para que el estado de Firebase se asiente
        router.refresh();
        setTimeout(() => {
          router.push(href);
        }, 150);
      }
    } catch (error) {
      console.error("Error en navegación protegida:", error);
    }
  };

  return { navigateTo };
};