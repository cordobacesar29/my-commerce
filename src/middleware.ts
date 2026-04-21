import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { USER_ROLES, type UserRole } from "@/types/roles";

function redirectToHome(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/";
  url.search = "";

  return NextResponse.redirect(url);
}

export function middleware(request: NextRequest) {
  const session = request.cookies.get("token")?.value;
  const userRole = request.cookies.get("user-role")?.value as UserRole | undefined;
  const { pathname } = request.nextUrl;

  const isCustomerRoute =
    pathname.startsWith("/design-studio") || pathname.startsWith("/cart");
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isAdminRoute = pathname.startsWith("/admin");

  if (isCustomerRoute && !session) {
    return redirectToHome(request);
  }

  if (isDashboardRoute) {
    const hasDashboardAccess =
      userRole === USER_ROLES.STORE_OWNER ||
      userRole === USER_ROLES.SUPER_ADMIN;

    if (!session || !hasDashboardAccess) {
      return redirectToHome(request);
    }
  }

  if (isAdminRoute) {
    const isSuperAdmin = userRole === USER_ROLES.SUPER_ADMIN;

    if (!session || !isSuperAdmin) {
      return redirectToHome(request);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/design-studio/:path*",
    "/cart/:path*",
  ],
};
