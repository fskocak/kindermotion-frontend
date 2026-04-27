import type { AuthUser, LoginPayload } from "@/types/auth";

export type AuthStoreState = {
  accessToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
};

export type AuthStoreActions = {
  setToken: (token: string | null) => void;
  setUser: (user: AuthUser | null) => void;
  clearAuth: () => void;
  bootstrapAuth: () => Promise<AuthUser | null>;
  loginAdmin: (payload: LoginPayload) => Promise<AuthUser | null>;
  loginTeacher: (payload: LoginPayload) => Promise<AuthUser | null>;
  logout: () => void;
};

export type AuthStore = AuthStoreState & AuthStoreActions;
