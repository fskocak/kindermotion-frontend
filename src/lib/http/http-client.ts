import axios, { type InternalAxiosRequestConfig } from "axios";

import { env } from "@/lib/config/env";
import { getAccessToken } from "@/lib/http/token-storage";

function attachAccessToken(config: InternalAxiosRequestConfig) {
  const accessToken = getAccessToken();

  if (accessToken) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  } else {
    config.headers.delete("Authorization");
  }

  return config;
}

export const httpClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 10_000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

httpClient.interceptors.request.use(attachAccessToken);
