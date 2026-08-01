"use client";

import { RouteErrorState } from "@/components/shared/route-error-state";

export default function DashboardError({
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
      title="The dashboard could not be loaded"
      description="Your account is safe. Retry the request, and check that the backend service is online if the issue continues."
    />
  );
}
