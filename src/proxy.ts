import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const dashboardByRole = {
  CUSTOMER: "/dashboard/customer",
  TECHNICIAN: "/dashboard/technician",
  ADMIN: "/dashboard/admin",
} as const;

type StoredRole = keyof typeof dashboardByRole;

function isStoredRole(value: string | undefined): value is StoredRole {
  return Boolean(value && value in dashboardByRole);
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = request.cookies.get("fixitnow_session")?.value === "1";
  const storedRole = request.cookies.get("fixitnow_role")?.value;
  const role = isStoredRole(storedRole) ? storedRole : null;
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isAuthRoute = pathname === "/auth/login" || pathname === "/auth/register";

  if (isDashboardRoute && (!hasSession || !role)) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (isDashboardRoute && role) {
    const allowedRoot = dashboardByRole[role];

    if (!pathname.startsWith(allowedRoot)) {
      return NextResponse.redirect(new URL(allowedRoot, request.url));
    }
  }

  if (isAuthRoute && hasSession && role) {
    return NextResponse.redirect(
      new URL(dashboardByRole[role], request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/login", "/auth/register"],
};
