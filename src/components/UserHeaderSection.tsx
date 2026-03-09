"use client";

import { useAuth } from "@/context/AuthContext";

export const UserHeaderSection = () => {
  const { user, loading } = useAuth();
  console.log(user, "user")
  if (!user) {
    return <div className="text-white">Iniciar sesión</div>;
  }
  return (
    <div className="text-white">
      Bienvenido, {user?.displayName || user?.email}
    </div>
  );
}