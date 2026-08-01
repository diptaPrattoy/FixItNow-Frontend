"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { useToast } from "@/components/providers/toast-provider";
import { UserAvatar } from "@/components/shared/user-avatar";
import { useAuthSession } from "@/hooks/use-auth-session";
import {
  clearAuthSession,
  getDashboardPath,
  refreshAuthCookies,
} from "@/lib/auth/session";
import type { UserRole } from "@/types/api";

type DashboardShellProps = {
  children: ReactNode;
};

type DashboardIconName =
  | "overview"
  | "bookings"
  | "payments"
  | "profile"
  | "availability"
  | "users"
  | "categories";

type DashboardNavItem = {
  href: string;
  label: string;
  icon: DashboardIconName;
};

type DashboardContext = {
  role: UserRole;
  label: string;
  home: string;
  description: string;
  navigation: DashboardNavItem[];
};

const dashboards: Record<string, DashboardContext> = {
  customer: {
    role: "CUSTOMER",
    label: "Customer",
    home: "/dashboard/customer",
    description: "Book services and follow every job from one place.",
    navigation: [
      { href: "/dashboard/customer", label: "Bookings", icon: "bookings" },
      { href: "/dashboard/customer/payments", label: "Payments", icon: "payments" },
    ],
  },
  technician: {
    role: "TECHNICIAN",
    label: "Technician",
    home: "/dashboard/technician",
    description: "Manage your services, availability and incoming work.",
    navigation: [
      { href: "/dashboard/technician", label: "Services", icon: "profile" },
      { href: "/dashboard/technician/availability", label: "Availability", icon: "availability" },
      { href: "/dashboard/technician/bookings", label: "Bookings", icon: "bookings" },
    ],
  },
  admin: {
    role: "ADMIN",
    label: "Admin",
    home: "/dashboard/admin",
    description: "Review users, bookings and service categories.",
    navigation: [
      { href: "/dashboard/admin", label: "Overview", icon: "overview" },
      { href: "/dashboard/admin/users", label: "Users", icon: "users" },
      { href: "/dashboard/admin/bookings", label: "Bookings", icon: "bookings" },
      { href: "/dashboard/admin/categories", label: "Categories", icon: "categories" },
    ],
  },
};

function getDashboardContext(pathname: string) {
  const segment = pathname.split("/")[2];
  return dashboards[segment] ?? null;
}

function isActivePath(pathname: string, item: DashboardNavItem) {
  if (
    item.href === "/dashboard/customer" ||
    item.href === "/dashboard/technician" ||
    item.href === "/dashboard/admin"
  ) {
    return pathname === item.href;
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function DashboardIcon({ name }: { name: DashboardIconName }) {
  const props = {
    className: "size-5",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "overview") {
    return (
      <svg {...props}>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    );
  }

  if (name === "bookings") {
    return (
      <svg {...props}>
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M8 3v4M16 3v4M4 10h16M8 14h3M8 17h6" />
      </svg>
    );
  }

  if (name === "payments") {
    return (
      <svg {...props}>
        <rect x="3" y="6" width="18" height="13" rx="2" />
        <path d="M3 10h18M7 15h3" />
      </svg>
    );
  }

  if (name === "profile") {
    return (
      <svg {...props}>
        <circle cx="12" cy="8" r="3" />
        <path d="M5 21a7 7 0 0 1 14 0M18 4l1 1 2-2" />
      </svg>
    );
  }

  if (name === "availability") {
    return (
      <svg {...props}>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M8 3v4M16 3v4M3 10h18M8 15l2 2 5-5" />
      </svg>
    );
  }

  if (name === "users") {
    return (
      <svg {...props}>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20a6 6 0 0 1 12 0M16 7a3 3 0 0 1 0 6M17 15a5 5 0 0 1 4 5" />
      </svg>
    );
  }

  return (
    <svg {...props}>
      <path d="M4 7h16M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
      <path d="M8 11h8M8 15h5" />
    </svg>
  );
}

export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { session, isReady } = useAuthSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const context = getDashboardContext(pathname);

  useEffect(() => {
    if (!isReady) return;

    if (!session) {
      clearAuthSession();
      router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!context || session.user.role !== context.role) {
      refreshAuthCookies(session.user.role);
      router.replace(getDashboardPath(session.user.role));
    }
  }, [context, isReady, pathname, router, session]);

  if (!isReady || !session || !context || session.user.role !== context.role) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
        <div className="mt-6 h-64 animate-pulse rounded-2xl border border-slate-200 bg-white" />
      </div>
    );
  }

  function handleLogout() {
    clearAuthSession();
    setMenuOpen(false);
    toast("You have been logged out.", "success");
    router.replace("/");
    router.refresh();
  }

  return (
    <section className="relative isolate mx-auto w-full max-w-7xl overflow-hidden px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-56 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),_transparent_38%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.10),_transparent_28%)]" />
      <div className="mb-5 flex items-center justify-between gap-4 lg:hidden">
        <div className="flex min-w-0 items-center gap-3">
          <UserAvatar
            name={session.user.name}
            src={session.user.avatarUrl}
            size={44}
            className="rounded-xl"
          />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
              {context.label} workspace
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-slate-800">{session.user.name}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-2 text-sm font-semibold text-emerald-900 shadow-sm"
          aria-expanded={menuOpen}
          aria-controls="dashboard-navigation"
        >
          {menuOpen ? "Close" : "More"}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside
          id="dashboard-navigation"
          className={`${menuOpen ? "block" : "hidden"} dashboard-surface h-fit rounded-[24px] border border-emerald-100 bg-gradient-to-b from-white via-emerald-50/70 to-white p-4 shadow-sm lg:sticky lg:top-24 lg:block`}
        >
          <div className="hidden border-b border-emerald-100 px-2 pb-4 lg:block">
            <div className="flex items-center gap-3">
              <UserAvatar
                name={session.user.name}
                src={session.user.avatarUrl}
                size={44}
                className="rounded-xl"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                  {context.label} workspace
                </p>
                <p className="mt-1 truncate font-semibold text-slate-950">{session.user.name}</p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{context.description}</p>
          </div>

          <nav className="space-y-1 lg:pt-4" aria-label={`${context.label} dashboard`}>
            {context.navigation.map((item) => {
              const active = isActivePath(pathname, item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                    active
                      ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
                      : "text-slate-700 hover:bg-white hover:text-emerald-900 hover:shadow-sm"
                  }`}
                >
                  <DashboardIcon name={item.icon} />
                  {item.label}
                </Link>
              );
            })}
            <div className="my-2 border-t border-emerald-100" />
            <Link
              href="/services"
              onClick={() => setMenuOpen(false)}
              className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-white hover:text-emerald-900 hover:shadow-sm"
            >
              Browse services
            </Link>
            <Link
              href="/technicians"
              onClick={() => setMenuOpen(false)}
              className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-white hover:text-emerald-900 hover:shadow-sm"
            >
              View technicians
            </Link>
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 w-full rounded-xl border border-slate-200/80 bg-white/90 px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            Log out
          </button>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>

      <nav
        className="fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-lg items-stretch justify-around gap-1 rounded-2xl border border-emerald-100 bg-white/92 px-2 pt-2 shadow-2xl shadow-emerald-950/10 backdrop-blur-xl lg:hidden"
        style={{ paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))" }}
        aria-label={`${context.label} mobile dashboard`}
      >
        {context.navigation.map((item) => {
          const active = isActivePath(pathname, item);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1.5 py-2 text-[0.68rem] font-semibold transition ${
                active
                  ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
                  : "text-slate-600 hover:bg-white hover:text-emerald-900"
              }`}
            >
              <DashboardIcon name={item.icon} />
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </section>
  );
}
