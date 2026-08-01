"use client";

import { RouteErrorState } from "@/components/shared/route-error-state";

export default function TechniciansError({
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
      title="The technician list is unavailable"
      description="Retry the request or return to the services page while the backend reconnects."
    />
  );
}
