"use client";

import { useEffect, useState, type ReactNode } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { UserSchema, type IUserRecord } from "@/types/user";
import type { UserRole } from "@/types/roles";

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: ReactNode;
  loadingComponent?: ReactNode;
  accessDeniedComponent?: ReactNode;
}

function DefaultAccessDenied() {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      Acceso denegado.
    </div>
  );
}

export function RoleGuard({
  allowedRoles,
  children,
  loadingComponent = null,
  accessDeniedComponent = null,
}: RoleGuardProps) {
  const { user, loading } = useAuth();
  const [userRecord, setUserRecord] = useState<IUserRecord | null>(null);
  const [isResolvingRole, setIsResolvingRole] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const resolveRole = async () => {
      if (loading) {
        return;
      }

      if (!user?.uid) {
        if (isMounted) {
          setUserRecord(null);
          setIsResolvingRole(false);
        }
        return;
      }

      if (isMounted) {
        setIsResolvingRole(true);
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const snapshot = await getDoc(userRef);

        if (!snapshot.exists()) {
          if (isMounted) {
            setUserRecord(null);
          }
          return;
        }

        const parsedUser = UserSchema.safeParse(snapshot.data());

        if (!parsedUser.success) {
          console.error("Invalid user role payload in Firestore:", parsedUser.error);
          if (isMounted) {
            setUserRecord(null);
          }
          return;
        }

        if (isMounted) {
          setUserRecord(parsedUser.data);
        }
      } catch (error: unknown) {
        console.error("Error resolving user role:", error);
        if (isMounted) {
          setUserRecord(null);
        }
      } finally {
        if (isMounted) {
          setIsResolvingRole(false);
        }
      }
    };

    void resolveRole();

    return () => {
      isMounted = false;
    };
  }, [loading, user?.uid]);

  if (loading || isResolvingRole) {
    return <>{loadingComponent}</>;
  }

  if (!userRecord) {
    return accessDeniedComponent ? <>{accessDeniedComponent}</> : null;
  }

  const hasAccess = allowedRoles.includes(userRecord.role);

  if (!hasAccess) {
    return accessDeniedComponent ? <>{accessDeniedComponent}</> : null;
  }

  return <>{children}</>;
}

export { DefaultAccessDenied };
