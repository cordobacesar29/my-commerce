import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { USER_ROLES, type UserRole } from "@/types/roles";

const encoder = new TextEncoder();

function redirectToHome(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/";
  url.search = "";

  return NextResponse.redirect(url);
}

async function signRolePayload(payload: string) {
  const secret = process.env.AUTH_COOKIE_SECRET;

  if (!secret) {
    return null;
  }

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function middleware(request: NextRequest) {
  const session = request.cookies.get("token")?.value;
  const userRole = request.cookies.get("user-role")?.value as UserRole | undefined;
  const roleSignature = request.cookies.get("user-role-sig")?.value;
  const uid = request.cookies.get("uid")?.value;
  const { pathname } = request.nextUrl;

  const isCustomerRoute =
    pathname.startsWith("/design-studio") || pathname.startsWith("/cart");
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isAdminRoute = pathname.startsWith("/admin");
  const hasRoleCookieBundle = Boolean(userRole && roleSignature && uid);

  let isValidRoleCookie = false;
  if (hasRoleCookieBundle) {
    const payload = `${uid}:${userRole}`;
    const expectedSignature = await signRolePayload(payload);
    isValidRoleCookie = Boolean(expectedSignature && expectedSignature === roleSignature);
  }

  if (isCustomerRoute && !session) {
    return redirectToHome(request);
  }

  if (isDashboardRoute) {
    const hasDashboardAccess = isValidRoleCookie && (
      userRole === USER_ROLES.STORE_OWNER ||
      userRole === USER_ROLES.SUPER_ADMIN
    );

    if (!session || !hasDashboardAccess) {
      return redirectToHome(request);
    }
  }

  if (isAdminRoute) {
    const isSuperAdmin = isValidRoleCookie && userRole === USER_ROLES.SUPER_ADMIN;

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
