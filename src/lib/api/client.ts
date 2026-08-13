// import type { ApiErrorPayload, ApiSuccess } from "@/types/api";

// const API_URL =
//   process.env.NEXT_PUBLIC_API_URL ?? "https://fixitnow-qemf.onrender.com";

// export class ApiError extends Error {
//   status: number;
//   details: ApiErrorPayload["errorDetails"];

//   constructor(
//     message: string,
//     status: number,
//     details?: ApiErrorPayload["errorDetails"],
//   ) {
//     super(message);
//     this.name = "ApiError";
//     this.status = status;
//     this.details = details;
//   }
// }

// type ApiRequestOptions = Omit<RequestInit, "body"> & {
//   body?: unknown;
//   token?: string | null;
//   timeout?: number;
// };

// export async function apiRequest<T>(
//   path: string,
//   options: ApiRequestOptions = {},
// ): Promise<ApiSuccess<T>> {
//   const controller = new AbortController();
//   const timeoutId = window.setTimeout(
//     () => controller.abort(),
//     options.timeout ?? 15000,
//   );

//   const headers = new Headers(options.headers);
//   headers.set("Accept", "application/json");

//   if (options.body !== undefined) {
//     headers.set("Content-Type", "application/json");
//   }

//   if (options.token) {
//     headers.set("Authorization", `Bearer ${options.token}`);
//   }

//   try {
//     const response = await fetch(`${API_URL}${path}`, {
//       ...options,
//       body: options.body === undefined ? undefined : JSON.stringify(options.body),
//       headers,
//       signal: controller.signal,
//     });

//     const payload = (await response.json().catch(() => null)) as
//       | ApiSuccess<T>
//       | ApiErrorPayload
//       | null;

//     if (!response.ok) {
//       throw new ApiError(
//         payload?.message ?? "Something went wrong. Please try again.",
//         response.status,
//         payload && "errorDetails" in payload ? payload.errorDetails : null,
//       );
//     }

//     if (!payload || payload.success !== true) {
//       throw new ApiError("The server returned an unexpected response.", 500);
//     }

//     return payload;
//   } catch (error) {
//     if (error instanceof ApiError) {
//       throw error;
//     }

//     if (error instanceof DOMException && error.name === "AbortError") {
//       throw new ApiError("The request took too long. Please try again.", 408);
//     }

//     throw new ApiError(
//       "Unable to connect to the server. Check your connection and try again.",
//       0,
//     );
//   } finally {
//     window.clearTimeout(timeoutId);
//   }
// }

import type { ApiErrorPayload, ApiSuccess } from "@/types/api";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://fixitnow-qemf.onrender.com";

const TOKEN_KEY = "fixitnow_token";

export class ApiError extends Error {
  status: number;
  details: ApiErrorPayload["errorDetails"];

  constructor(
    message: string,
    status: number,
    details?: ApiErrorPayload["errorDetails"],
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  token?: string | null;
  timeout?: number;
};

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<ApiSuccess<T>> {
  const controller = new AbortController();

  const timeoutId = window.setTimeout(
    () => controller.abort(),
    options.timeout ?? 15000,
  );

  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");

  /*
   * Get JWT from localStorage automatically.
   *
   * If a token is explicitly passed through options.token,
   * that token takes priority.
   */
  const storedToken =
    typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;

  const token = options.token ?? storedToken;

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  /*
   * FormData must NOT have Content-Type set manually.
   *
   * The browser automatically creates:
   *
   * multipart/form-data; boundary=...
   *
   * For normal JavaScript objects, we use JSON.
   */
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  if (options.body !== undefined && !isFormData) {
    headers.set("Content-Type", "application/json");
  }

  let requestBody: BodyInit | undefined;

  if (options.body !== undefined) {
    if (isFormData) {
      requestBody = options.body as FormData;
    } else {
      requestBody = JSON.stringify(options.body);
    }
  }

  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      body: requestBody,
      headers,
      signal: controller.signal,
    });

    const payload = (await response.json().catch(() => null)) as
      | ApiSuccess<T>
      | ApiErrorPayload
      | null;

    if (!response.ok) {
      throw new ApiError(
        payload?.message ?? "Something went wrong. Please try again.",
        response.status,
        payload && "errorDetails" in payload ? payload.errorDetails : null,
      );
    }

    if (!payload || payload.success !== true) {
      throw new ApiError("The server returned an unexpected response.", 500);
    }

    return payload;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("The request took too long. Please try again.", 408);
    }

    throw new ApiError(
      "Unable to connect to the server. Check your connection and try again.",
      0,
    );
  } finally {
    window.clearTimeout(timeoutId);
  }
}
