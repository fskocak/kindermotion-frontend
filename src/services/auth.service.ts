import { API_ROUTES } from "@/lib/constants/api-routes";
import { httpClient } from "@/lib/http/http-client";
import {
  clearAccessToken,
  setAccessToken,
  syncAuthSession,
} from "@/lib/http/token-storage";
import type { AuthUser, LoginPayload, LoginResponse } from "@/types/auth";

async function login(path: string, payload: LoginPayload) {
  const response = await httpClient.post<LoginResponse>(path, payload);
  setAccessToken(response.data.accessToken);
  syncAuthSession(response.data.user.role);

  return response.data;
}

export const authService = {
  loginAdmin(payload: LoginPayload) {
    return login(API_ROUTES.auth.adminLogin, payload);
  },
  loginTeacher(payload: LoginPayload) {
    return login(API_ROUTES.auth.teacherLogin, payload);
  },
  async getMe() {
    const response = await httpClient.get<AuthUser>(API_ROUTES.auth.me);
    syncAuthSession(response.data.role);

    return response.data;
  },
  logout() {
    clearAccessToken();
  },
};
