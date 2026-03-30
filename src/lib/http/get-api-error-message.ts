import axios from "axios";

import type { ApiErrorResponse } from "@/types/api";

function formatMessage(message?: ApiErrorResponse["message"]) {
  if (Array.isArray(message)) {
    return message.join(", ");
  }

  return message;
}

export function getApiErrorMessage(error: unknown) {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return "An unexpected error occurred.";
  }

  return (
    formatMessage(error.response?.data?.message) ??
    error.response?.data?.error ??
    error.message ??
    "The request could not be completed."
  );
}
