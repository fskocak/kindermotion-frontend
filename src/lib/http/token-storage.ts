import {
  authStorageKeys,
  AUTH_SESSION_COOKIE_VALUE,
  AUTH_SESSION_MAX_AGE_SECONDS,
} from "@/lib/auth/session";
import type { UserRole } from "@/types/auth";

function canUseStorage() {
  return typeof window !== "undefined";
}

function canUseCookies() {
  return typeof document !== "undefined";
}

function setCookie(name: string, value: string) {
  if (!canUseCookies()) {
    return;
  }

  document.cookie =
    `${name}=${encodeURIComponent(value)}; Path=/; SameSite=Lax; ` +
    `Max-Age=${AUTH_SESSION_MAX_AGE_SECONDS}`;
}

function clearCookie(name: string) {
  if (!canUseCookies()) {
    return;
  }

  document.cookie = `${name}=; Path=/; SameSite=Lax; Max-Age=0`;
}

export function getAccessToken() {
  if (!canUseStorage()) {
    return null;
  }

  return window.localStorage.getItem(authStorageKeys.accessToken);
}

export function setAccessToken(token: string) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(authStorageKeys.accessToken, token);
}

export function syncAuthSession(role: UserRole) {
  // Mirror the client auth state into cookies so Next.js proxy can redirect before hydration.
  setCookie(authStorageKeys.sessionCookie, AUTH_SESSION_COOKIE_VALUE);
  setCookie(authStorageKeys.roleCookie, role);
}

export function clearAuthSession() {
  clearCookie(authStorageKeys.sessionCookie);
  clearCookie(authStorageKeys.roleCookie);
}

export function clearAccessToken() {
  if (!canUseStorage()) {
    clearAuthSession();
    return;
  }

  window.localStorage.removeItem(authStorageKeys.accessToken);
  clearAuthSession();
}
