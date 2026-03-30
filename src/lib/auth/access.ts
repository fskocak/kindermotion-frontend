import { APP_ROUTES } from "@/lib/constants/routes";
import type { UserRole } from "@/types/auth";

export function getDashboardRouteForRole(role: UserRole) {
  return role === "ADMIN" ? APP_ROUTES.admin : APP_ROUTES.teacher;
}

export function getLoginRouteForRole(role: UserRole) {
  return role === "ADMIN" ? APP_ROUTES.adminLogin : APP_ROUTES.teacherLogin;
}

export function hasRequiredRole(
  currentRole: UserRole,
  requiredRole: UserRole,
) {
  return currentRole === requiredRole;
}
