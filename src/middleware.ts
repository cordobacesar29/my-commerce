import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const session = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const isCustomizePage = pathname.startsWith("/design-studio");

  if (isCustomizePage && !session) {
    // Si no hay sesión, al login
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/design-studio/:path*"],
};