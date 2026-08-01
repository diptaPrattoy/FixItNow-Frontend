import { ApiError } from "@/lib/api/client";
import type { ApiFieldError } from "@/types/api";

export function getApiErrorMessage(error: unknown) {
  return error instanceof ApiError
    ? error.message
    : "Something went wrong. Please try again.";
}

export function getApiFieldErrors(error: unknown) {
  if (!(error instanceof ApiError) || !Array.isArray(error.details)) {
    return {};
  }

  return error.details.reduce<Record<string, string>>((result, item) => {
    const fieldError = item as ApiFieldError;
    const field = fieldError.field.split(".").at(-1);

    if (field) {
      result[field] = fieldError.message;
    }

    return result;
  }, {});
}
