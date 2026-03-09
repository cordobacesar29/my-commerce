"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { auth } from "../lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  // login: (email: string, password: string) => Promise<void>;
  // logout: () => void;
  // register: (email: string, password: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  // login: async () => {},
  // logout: () => {},
  // register: async () => {},
  loading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  console.log(user)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async(currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if(currentUser) {
        const idToken = await currentUser.getIdToken();

        await fetch("api/auth/session", {
          method: "POST",
          body: JSON.stringify({ idToken }),
          headers: {
            "Content-Type": "application/json",
          },
        });
      } else {
        await fetch("api/auth/session", {
          method: "DELETE",
        });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const value = useMemo(() => ({ user, loading }), [user, loading]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);