import type { AuthResponse, AuthUser, UserRole } from "@/types/api";

const TOKEN_KEY = "fixitnow_token";
const USER_KEY = "fixitnow_user";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export type AuthSession = {
  token: string;
  user: AuthUser;
};

export function saveAuthSession(data: AuthResponse) {
  localStorage.setItem(TOKEN_KEY, data.accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));

  document.cookie = `fixitnow_token=${encodeURIComponent(data.accessToken)}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
  document.cookie = `fixitnow_role=${data.user.role}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
  window.dispatchEvent(new Event("fixitnow:auth-change"));
}

export function getAuthSession(): AuthSession | null {
  const token = localStorage.getItem(TOKEN_KEY);
  const userJson = localStorage.getItem(USER_KEY);

  if (!token || !userJson) {
    return null;
  }

  try {
    return {
      token,
      user: JSON.parse(userJson) as AuthUser,
    };
  } catch {
    clearAuthSession();
    return null;
  }
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  document.cookie = "fixitnow_token=; path=/; max-age=0; samesite=lax";
  document.cookie = "fixitnow_role=; path=/; max-age=0; samesite=lax";
  window.dispatchEvent(new Event("fixitnow:auth-change"));
}

export function getDashboardPath(role: UserRole) {
  return `/dashboard/${role.toLowerCase()}`;
}
