const DEFAULT_API_BASE_URL = "http://localhost:3001";
const DEFAULT_TRAINING_API_BASE_URL = "http://localhost:8001";

function removeTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export const env = {
  apiBaseUrl: removeTrailingSlash(
    process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_BASE_URL,
  ),
  trainingApiBaseUrl: removeTrailingSlash(
    process.env.NEXT_PUBLIC_TRAINING_API_URL ??
      DEFAULT_TRAINING_API_BASE_URL,
  ),
} as const;
