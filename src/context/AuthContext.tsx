"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import { auth } from "../lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { syncUserRecord } from "@/lib/user-sevice";
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCartStore } from "@/store/useCartStore";

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { clearCart, setItems } = useCartStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        try {
          await syncUserRecord(currentUser);
          const cartDoc = await getDoc(doc(db, "users", currentUser.uid, "cart", "current"));
          if (cartDoc.exists()) {
            const remoteItems = cartDoc.data().items;
            setItems(remoteItems); // Actualiza Zustand con lo que había en la nube
          }

          const idToken = await currentUser.getIdToken();
          await fetch("/api/auth/session", {
            method: "POST",
            body: JSON.stringify({ idToken }),
            headers: {
              "Content-Type": "application/json",
            },
          });
        } catch (error) {
          console.error("Error en la sincronización de sesión:", error);
        }
      } else {
        clearCart(); // Limpia el carrito local al cerrar sesión
        await fetch("/api/auth/session", {
          method: "DELETE",
        });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [clearCart, setItems]);

  const value = useMemo(() => ({ user, loading }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
