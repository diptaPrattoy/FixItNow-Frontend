"use client";

import { RouteErrorState } from "@/components/shared/route-error-state";

export default function TechnicianDetailsError({
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
      title="This technician profile could not be loaded"
      description="The profile may be temporarily unavailable. Retry the request or browse other technicians."
    />
  );
}
