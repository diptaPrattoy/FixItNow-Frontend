import type { AuthResponse, AuthUser, UserRole } from "@/types/api";

const TOKEN_KEY = "fixitnow_token";
const USER_KEY = "fixitnow_user";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SNAPSHOT_SEPARATOR = "::FIXITNOW_SESSION::";

export type AuthSession = {
  token: string;
  user: AuthUser;
};

export function refreshAuthCookies(role: UserRole) {
  document.cookie = "fixitnow_token=; path=/; max-age=0; samesite=lax";
  document.cookie = `fixitnow_session=1; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
  document.cookie = `fixitnow_role=${role}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
}

export function saveAuthSession(data: AuthResponse) {
  localStorage.setItem(TOKEN_KEY, data.accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  refreshAuthCookies(data.user.role);
  window.dispatchEvent(new Event("fixitnow:auth-change"));
}

export function getAuthSessionStorageSnapshot() {
  const token = localStorage.getItem(TOKEN_KEY) ?? "";
  const user = localStorage.getItem(USER_KEY) ?? "";

  return `${token}${SNAPSHOT_SEPARATOR}${user}`;
}

export function getAuthSessionFromSnapshot(
  snapshot: string,
): AuthSession | null {
  const separatorIndex = snapshot.indexOf(SNAPSHOT_SEPARATOR);

  if (separatorIndex < 0) {
    return null;
  }

  const token = snapshot.slice(0, separatorIndex);
  const userJson = snapshot.slice(
    separatorIndex + SNAPSHOT_SEPARATOR.length,
  );

  if (!token || !userJson) {
    return null;
  }

  try {
    return {
      token,
      user: JSON.parse(userJson) as AuthUser,
    };
  } catch {
    return null;
  }
}

export function getAuthSession(): AuthSession | null {
  return getAuthSessionFromSnapshot(getAuthSessionStorageSnapshot());
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  document.cookie = "fixitnow_token=; path=/; max-age=0; samesite=lax";
  document.cookie = "fixitnow_session=; path=/; max-age=0; samesite=lax";
  document.cookie = "fixitnow_role=; path=/; max-age=0; samesite=lax";
  window.dispatchEvent(new Event("fixitnow:auth-change"));
}

export function getDashboardPath(role: UserRole) {
  return `/dashboard/${role.toLowerCase()}`;
}
