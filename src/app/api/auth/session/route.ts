import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json({ error: "Token no proporcionado" }, { status: 400 });
    }

    const expiresIn = 60* 60 * 24 *5 * 1000; // 5 días en milisegundos
    const cookieStore = await cookies();
    cookieStore.set({
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      name: "token",
      value: idToken,
    });

    return NextResponse.json({isLogged: true}, { status: 200 });
  } catch (error) {
    return NextResponse.json({error: "Internal Server Error"}, { status: 500 });
  }
    
  }

  export async function DELETE() {
    const cookieStore = await cookies();
    cookieStore.delete("token");
    return NextResponse.json({isLogged: false}, { status: 200 });
  }