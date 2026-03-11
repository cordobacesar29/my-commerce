"use client";

import { useAuth } from "@/context/AuthContext";
import { LogoutButton } from "./LogoutButton";
import { useState } from "react";

export const UserHeaderSection = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const name = user?.displayName || user?.email || "";
  const firstLetter = name.charAt(0).toUpperCase();

  if (!user) {
    return <div className="text-white cursor-pointer">Iniciar sesión</div>;
  }
  return (
    <div className="flex items-center gap-3 relative">
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
