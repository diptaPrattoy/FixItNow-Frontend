"use client";

import { useMemo, useSyncExternalStore } from "react";

import {
  getAuthSessionFromSnapshot,
  getAuthSessionStorageSnapshot,
  type AuthSession,
} from "@/lib/auth/session";

const SERVER_SNAPSHOT = "__FIXITNOW_SERVER__";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("fixitnow:auth-change", onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("fixitnow:auth-change", onStoreChange);
  };
}

export function useAuthSession(): {
  session: AuthSession | null;
  isReady: boolean;
} {
  const snapshot = useSyncExternalStore(
    subscribe,
    getAuthSessionStorageSnapshot,
    () => SERVER_SNAPSHOT,
  );

  return useMemo(() => {
    if (snapshot === SERVER_SNAPSHOT) {
      return { session: null, isReady: false };
    }

    return {
      session: getAuthSessionFromSnapshot(snapshot),
      isReady: true,
    };
  }, [snapshot]);
}
