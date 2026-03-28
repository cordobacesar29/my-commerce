import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const session = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // 1. Definimos todas las rutas que requieren login
  const protectedRoutes = ["/design-studio", "/cart"];

  // 2. Verificamos si la ruta actual empieza con alguna de las protegidas
  const isProtectedRoute = protectedRoutes.some((route) => 
    pathname.startsWith(route)
  );

  // 3. Si es protegida y no hay sesión, redirigimos
  if (isProtectedRoute && !session) {
    // Es buena práctica guardar la URL a la que intentaba ir para volver después del login
    const loginUrl = new URL("/", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// 4. Actualizamos el matcher para que el middleware se ejecute en estas rutas
export const config = {
  matcher: [
    "/design-studio/:path*",
    "/cart/:path*"
  ],
};