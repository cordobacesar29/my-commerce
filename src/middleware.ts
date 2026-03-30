import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // 1. Obtener el token de las cookies
  const session = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // 2. Definir rutas protegidas
  const protectedRoutes = ["/design-studio", "/cart"];
  
  const isProtectedRoute = protectedRoutes.some((route) => 
    pathname.startsWith(route)
  );

  // 3. Lógica de redirección
  if (isProtectedRoute && !session) {
    // Clonamos la URL base y cambiamos el path al Home
    const url = request.nextUrl.clone();
    url.pathname = "/";
    // Limpiamos los parámetros para evitar loops infinitos
    url.search = ""; 
    
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// 4. Matcher optimizado
export const config = {
  matcher: [
    "/design-studio/:path*",
    "/cart/:path*",
  ],
};