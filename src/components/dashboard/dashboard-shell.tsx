"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { useToast } from "@/components/providers/toast-provider";
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

type DashboardNavItem = {
  href: string;
  label: string;
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
      { href: "/dashboard/customer", label: "Bookings" },
      { href: "/dashboard/customer/payments", label: "Payments" },
    ],
  },
  technician: {
    role: "TECHNICIAN",
    label: "Technician",
    home: "/dashboard/technician",
    description: "Manage your services, availability and incoming work.",
    navigation: [
      { href: "/dashboard/technician", label: "Profile & services" },
      { href: "/dashboard/technician/availability", label: "Availability" },
      { href: "/dashboard/technician/bookings", label: "Bookings" },
    ],
  },
  admin: {
    role: "ADMIN",
    label: "Admin",
    home: "/dashboard/admin",
    description: "Review users, bookings and service categories.",
    navigation: [
      { href: "/dashboard/admin", label: "Overview" },
      { href: "/dashboard/admin/users", label: "Users" },
      { href: "/dashboard/admin/bookings", label: "Bookings" },
    ],
  },
};

function getDashboardContext(pathname: string) {
  const segment = pathname.split("/")[2];
  return dashboards[segment] ?? null;
}

function isActivePath(pathname: string, item: DashboardNavItem) {
  if (item.href === "/dashboard/customer" || item.href === "/dashboard/technician" || item.href === "/dashboard/admin") {
    return pathname === item.href;
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
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
    <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-5 flex items-center justify-between gap-4 lg:hidden">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
            {context.label} workspace
          </p>
          <p className="mt-1 text-sm text-slate-600">{session.user.name}</p>
        </div>
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
          aria-expanded={menuOpen}
          aria-controls="dashboard-navigation"
        >
          {menuOpen ? "Close" : "Menu"}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside
          id="dashboard-navigation"
          className={`${menuOpen ? "block" : "hidden"} h-fit rounded-2xl border border-slate-200 bg-white p-4 lg:sticky lg:top-24 lg:block`}
        >
          <div className="hidden border-b border-slate-100 px-2 pb-4 lg:block">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
              {context.label} workspace
            </p>
            <p className="mt-2 font-semibold text-slate-950">{session.user.name}</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              {context.description}
            </p>
          </div>

          <nav className="space-y-1 lg:pt-4" aria-label={`${context.label} dashboard`}>
            {context.navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`block rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  isActivePath(pathname, item)
                    ? "bg-emerald-50 text-emerald-800"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/services"
              onClick={() => setMenuOpen(false)}
              className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
            >
              Browse services
            </Link>
            <Link
              href="/technicians"
              onClick={() => setMenuOpen(false)}
              className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
            >
              View technicians
            </Link>
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-left text-sm font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            Log out
          </button>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}
