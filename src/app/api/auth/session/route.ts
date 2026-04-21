import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHmac } from "node:crypto";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { UserRoleSchema } from "@/types/roles";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 5; // 5 days
const DEFAULT_ROLE = "CUSTOMER";

function buildRoleSignature(uid: string, role: string) {
  const secret = process.env.AUTH_COOKIE_SECRET;

  if (!secret) {
    throw new Error("Missing AUTH_COOKIE_SECRET environment variable");
  }

  return createHmac("sha256", secret).update(`${uid}:${role}`).digest("hex");
}

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json({ error: "Token no proporcionado" }, { status: 400 });
    }

    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const userDoc = await adminDb.collection("users").doc(uid).get();
    const parsedRole = UserRoleSchema.safeParse(userDoc.data()?.role);
    const role = parsedRole.success ? parsedRole.data : DEFAULT_ROLE;
    const roleSig = buildRoleSignature(uid, role);
    const cookieStore = await cookies();
    
    cookieStore.set({
      maxAge: SESSION_MAX_AGE_SECONDS,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      name: "token",
      value: idToken,
    });

    cookieStore.set({
      maxAge: SESSION_MAX_AGE_SECONDS,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      name: "uid",
      value: uid,
    });

    cookieStore.set({
      maxAge: SESSION_MAX_AGE_SECONDS,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      name: "user-role",
      value: role,
    });

    cookieStore.set({
      maxAge: SESSION_MAX_AGE_SECONDS,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      name: "user-role-sig",
      value: roleSig,
    });

    return NextResponse.json({isLogged: true}, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 401 });
  }
    
  }

  export async function DELETE() {
    const cookieStore = await cookies();
    cookieStore.delete("token");
    cookieStore.delete("uid");
    cookieStore.delete("user-role");
    cookieStore.delete("user-role-sig");
    return NextResponse.json({isLogged: false}, { status: 200 });
  }
