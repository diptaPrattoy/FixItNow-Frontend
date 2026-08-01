"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

import { useToast } from "@/components/providers/toast-provider";

function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);

  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getSnapshot() {
  return navigator.onLine;
}

function getServerSnapshot() {
  return true;
}

export function NetworkStatus() {
  const isOnline = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const previousStatus = useRef(isOnline);
  const { toast } = useToast();

  useEffect(() => {
    if (previousStatus.current === isOnline) {
      return;
    }

    previousStatus.current = isOnline;
    const timeoutId = window.setTimeout(() => {
      toast(
        isOnline
          ? "You are back online. Requests can continue."
          : "You are offline. Check your internet connection.",
        isOnline ? "success" : "error",
      );
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [isOnline, toast]);

  if (isOnline) {
    return null;
  }

  return (
    <div
      className="fixed inset-x-3 bottom-3 z-[90] mx-auto flex max-w-xl items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-lg shadow-amber-950/10 sm:bottom-5"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <span className="relative flex size-2.5 shrink-0">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-500 opacity-50" />
          <span className="relative inline-flex size-2.5 rounded-full bg-amber-600" />
        </span>
        <p>
          <span className="font-semibold">No internet connection.</span>{" "}
          Saved pages remain visible, but new requests may fail.
        </p>
      </div>
    </div>
  );
}
