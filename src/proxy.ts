import { NextResponse, type NextRequest } from "next/server";

import {
  authStorageKeys,
  AUTH_SESSION_COOKIE_VALUE,
  normalizeUserRole,
} from "@/lib/auth/session";
import {
  getDashboardRouteForRole,
  getLoginRouteForRole,
} from "@/lib/auth/access";
import type { UserRole } from "@/types/auth";

const protectedRouteRequirements: ReadonlyArray<{
  prefix: string;
  requiredRole: UserRole;
}> = [
  { prefix: "/admin", requiredRole: "ADMIN" },
  { prefix: "/teacher", requiredRole: "TEACHER" },
];

const guestRoutes = new Set(["/admin-login", "/teacher-login"]);

function matchesRoutePrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function getRequiredRoleForPath(pathname: string) {
  const match = protectedRouteRequirements.find(({ prefix }) =>
    matchesRoutePrefix(pathname, prefix),
  );

  return match?.requiredRole ?? null;
}

function getSessionState(request: NextRequest) {
  const hasSession =
    request.cookies.get(authStorageKeys.sessionCookie)?.value ===
    AUTH_SESSION_COOKIE_VALUE;
  const role = normalizeUserRole(
    request.cookies.get(authStorageKeys.roleCookie)?.value,
  );

  return {
    hasSession,
    role,
  };
}

function redirectTo(request: NextRequest, destination: string) {
  return NextResponse.redirect(new URL(destination, request.url));
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const { hasSession, role } = getSessionState(request);
  const requiredRole = getRequiredRoleForPath(pathname);

  if (requiredRole) {
    if (!hasSession || !role) {
      return redirectTo(request, getLoginRouteForRole(requiredRole));
    }

    if (role !== requiredRole) {
      return redirectTo(request, getDashboardRouteForRole(role));
    }

    return NextResponse.next();
  }

  if (guestRoutes.has(pathname) && hasSession && role) {
    return redirectTo(request, getDashboardRouteForRole(role));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/teacher/:path*", "/admin-login", "/teacher-login"],
};
