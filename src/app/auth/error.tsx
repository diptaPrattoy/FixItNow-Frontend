"use client";

import { RouteErrorState } from "@/components/shared/route-error-state";

export default function AuthError({
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
      title="Authentication is temporarily unavailable"
      description="Retry the page before submitting your credentials again. No password was saved by this error page."
    />
  );
}
