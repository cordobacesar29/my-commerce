import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const session = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const isCustomizePage = pathname.startsWith("/customize");

  if (isCustomizePage && !session) {
    // Si no hay sesión, al login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Ya no necesitas el "/" aquí si no vas a redirigir la raíz
  matcher: ["/customize/:path*"],
};