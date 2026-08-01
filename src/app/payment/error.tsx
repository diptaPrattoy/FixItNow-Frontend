"use client";

import { RouteErrorState } from "@/components/shared/route-error-state";

export default function PaymentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorState
      error={error}
      reset={reset}
      title="The payment result could not be displayed"
      description="Do not start another payment immediately. Retry this page, then check your payment history to confirm the transaction status."
    />
  );
}
