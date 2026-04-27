"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { AuthLoadingScreen } from "@/components/auth/auth-loading-screen";
import {
  getDashboardRouteForRole,
  getLoginRouteForRole,
  hasRequiredRole,
} from "@/lib/auth/access";
import { useAuthStore } from "@/store";
import type { UserRole } from "@/types/auth";

type AuthGuardProps = {
  children: ReactNode;
  mode: "guest" | "protected";
  requiredRole?: UserRole;
};

function getRedirectTarget({
  mode,
  requiredRole,
  isAuthenticated,
  userRole,
}: {
  mode: AuthGuardProps["mode"];
  requiredRole?: UserRole;
  isAuthenticated: boolean;
  userRole?: UserRole;
}) {
  if (mode === "guest") {
    return userRole ? getDashboardRouteForRole(userRole) : null;
  }

  if (!requiredRole) {
    return null;
  }

  if (!isAuthenticated || !userRole) {
    return getLoginRouteForRole(requiredRole);
  }

  if (!hasRequiredRole(userRole, requiredRole)) {
    return getDashboardRouteForRole(userRole);
  }

  return null;
}

export function AuthGuard({
  children,
  mode,
  requiredRole,
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isBootstrapping = useAuthStore((state) => state.isBootstrapping);
  const userRole = useAuthStore((state) => state.user?.role);

  const redirectTarget = getRedirectTarget({
    mode,
    requiredRole,
    isAuthenticated,
    userRole,
  });

  useEffect(() => {
    if (!redirectTarget || redirectTarget === pathname) {
      return;
    }

    router.replace(redirectTarget);
  }, [pathname, redirectTarget, router]);

  if (isBootstrapping) {
    return <AuthLoadingScreen />;
  }

  if (redirectTarget && redirectTarget !== pathname) {
    return <AuthLoadingScreen />;
  }

  return children;
}
