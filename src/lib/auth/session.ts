import type { UserRole } from "@/types/auth";

const ACCESS_TOKEN_STORAGE_KEY = "kindermotion.access-token";
const AUTH_SESSION_COOKIE_KEY = "kindermotion.session";
const AUTH_ROLE_COOKIE_KEY = "kindermotion.user-role";
const AUTHENTICATED_SESSION_COOKIE_VALUE = "1";

export const AUTH_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export const authStorageKeys = {
  accessToken: ACCESS_TOKEN_STORAGE_KEY,
  sessionCookie: AUTH_SESSION_COOKIE_KEY,
  roleCookie: AUTH_ROLE_COOKIE_KEY,
} as const;

export const AUTH_SESSION_COOKIE_VALUE = AUTHENTICATED_SESSION_COOKIE_VALUE;

export function isUserRole(value: string | null | undefined): value is UserRole {
  return value === "ADMIN" || value === "TEACHER";
}

export function normalizeUserRole(
  value: string | null | undefined,
): UserRole | null {
  return isUserRole(value) ? value : null;
}
