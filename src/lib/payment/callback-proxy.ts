import { NextResponse } from "next/server";

const BACKEND_API_URL =
  process.env.BACKEND_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "https://fixitnow-qemf.onrender.com";

type PaymentCallbackName = "success" | "fail" | "cancel" | "ipn";

type CallbackPayload = {
  success?: boolean;
  message?: string;
  [key: string]: unknown;
};

function getTransactionId(rawBody: string, contentType: string) {
  if (!rawBody) {
    return null;
  }

  try {
    if (contentType.includes("application/json")) {
      const body = JSON.parse(rawBody) as Record<string, unknown>;
      const value = body.tran_id;
      return typeof value === "string" ? value : null;
    }

    const form = new URLSearchParams(rawBody);
    return form.get("tran_id");
  } catch {
    return null;
  }
}

async function forwardToBackend(
  request: Request,
  callbackName: PaymentCallbackName,
) {
  const contentType =
    request.headers.get("content-type") ??
    "application/x-www-form-urlencoded";
  const rawBody = await request.text();

  const response = await fetch(
    `${BACKEND_API_URL}/api/payments/${callbackName}`,
    {
      method: "POST",
      headers: {
        "Content-Type": contentType,
        Accept: "application/json",
      },
      body: rawBody,
      cache: "no-store",
    },
  );

  const payload = (await response.json().catch(() => null)) as
    | CallbackPayload
    | null;

  return {
    response,
    payload,
    transactionId: getTransactionId(rawBody, contentType),
  };
}

function addOptionalParam(url: URL, key: string, value: string | null) {
  if (value) {
    url.searchParams.set(key, value);
  }
}

export async function handleSuccessCallback(request: Request) {
  try {
    const result = await forwardToBackend(request, "success");

    if (result.response.ok && result.payload?.success !== false) {
      const successUrl = new URL("/payment/success", request.url);
      addOptionalParam(successUrl, "tran_id", result.transactionId);
      return NextResponse.redirect(successUrl, 303);
    }

    const failureUrl = new URL("/payment/cancel", request.url);
    failureUrl.searchParams.set("status", "verification-failed");
    addOptionalParam(failureUrl, "tran_id", result.transactionId);
    addOptionalParam(
      failureUrl,
      "message",
      result.payload?.message ?? "Payment verification failed.",
    );
    return NextResponse.redirect(failureUrl, 303);
  } catch {
    const failureUrl = new URL("/payment/cancel", request.url);
    failureUrl.searchParams.set("status", "verification-unavailable");
    failureUrl.searchParams.set(
      "message",
      "The payment response could not be verified. Check payment history before trying again.",
    );
    return NextResponse.redirect(failureUrl, 303);
  }
}

export async function handleFailureCallback(
  request: Request,
  callbackName: "fail" | "cancel",
) {
  try {
    const result = await forwardToBackend(request, callbackName);
    const cancelUrl = new URL("/payment/cancel", request.url);
    cancelUrl.searchParams.set(
      "status",
      callbackName === "fail" ? "failed" : "cancelled",
    );
    addOptionalParam(cancelUrl, "tran_id", result.transactionId);
    addOptionalParam(cancelUrl, "message", result.payload?.message ?? null);
    return NextResponse.redirect(cancelUrl, 303);
  } catch {
    const cancelUrl = new URL("/payment/cancel", request.url);
    cancelUrl.searchParams.set(
      "status",
      callbackName === "fail" ? "failed" : "cancelled",
    );
    return NextResponse.redirect(cancelUrl, 303);
  }
}

export async function handleIpnCallback(request: Request) {
  try {
    const result = await forwardToBackend(request, "ipn");

    return NextResponse.json(
      result.payload ?? {
        success: result.response.ok,
        message: result.response.ok
          ? "IPN forwarded successfully."
          : "IPN forwarding failed.",
      },
      { status: result.response.status },
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Unable to forward the SSLCommerz IPN notification.",
      },
      { status: 502 },
    );
  }
}
