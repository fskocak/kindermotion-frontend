"use client";

import { create } from "zustand";

import { getAccessToken } from "@/lib/http/token-storage";
import { authService } from "@/services";
import type { AuthStore } from "@/types/auth-store";
import type { LoginPayload } from "@/types/auth";

function getUnauthenticatedState() {
  return {
    accessToken: null,
    user: null,
    isAuthenticated: false,
    isBootstrapping: false,
  } as const;
}

async function loginWithRole(
  login: (payload: LoginPayload) => Promise<{ accessToken: string }>,
  payload: LoginPayload,
  store: AuthStore,
) {
  store.setUser(null);
  await login(payload);

  const token = getAccessToken();
  store.setToken(token);

  return store.bootstrapAuth();
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  isBootstrapping: true,

  setToken(token) {
    if (!token) {
      authService.logout();
      set(getUnauthenticatedState());
      return;
    }

    set({
      accessToken: token,
      isAuthenticated: true,
    });
  },

  setUser(user) {
    set((state) => ({
      user,
      isAuthenticated: Boolean(state.accessToken && user),
    }));
  },

  clearAuth() {
    authService.logout();
    set(getUnauthenticatedState());
  },

  async bootstrapAuth() {
    const token = getAccessToken();

    if (!token) {
      authService.logout();
      set(getUnauthenticatedState());
      return null;
    }

    set({
      accessToken: token,
      isAuthenticated: true,
      isBootstrapping: true,
    });

    try {
      const user = await authService.getMe();

      set({
        accessToken: token,
        user,
        isAuthenticated: true,
        isBootstrapping: false,
      });

      return user;
    } catch {
      get().clearAuth();
      return null;
    }
  },

  async loginAdmin(payload) {
    set({ isBootstrapping: true });
    try {
      return await loginWithRole(authService.loginAdmin, payload, get());
    } catch (error) {
      set({ isBootstrapping: false });
      throw error;
    }
  },

  async loginTeacher(payload) {
    set({ isBootstrapping: true });
    try {
      return await loginWithRole(authService.loginTeacher, payload, get());
    } catch (error) {
      set({ isBootstrapping: false });
      throw error;
    }
  },

  logout() {
    get().clearAuth();
  },
}));
