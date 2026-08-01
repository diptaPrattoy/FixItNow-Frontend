"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { BrandLogo } from "@/components/shared/brand-logo";
import { useToast } from "@/components/providers/toast-provider";
import {
  clearAuthSession,
  getAuthSession,
  getDashboardPath,
  type AuthSession,
} from "@/lib/auth/session";

const links = [
  { href: "/services", label: "Services" },
  { href: "/technicians", label: "Technicians" },
  { href: "/#how-it-works", label: "How it works" },
];

export function SiteHeader() {
  const { toast } = useToast();
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    const syncSession = () => setSession(getAuthSession());
    syncSession();
    window.addEventListener("fixitnow:auth-change", syncSession);
    window.addEventListener("storage", syncSession);

    return () => {
      window.removeEventListener("fixitnow:auth-change", syncSession);
      window.removeEventListener("storage", syncSession);
    };
  }, []);

  function handleLogout() {
    clearAuthSession();
    setSession(null);
    toast("You have been logged out.", "success");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex min-h-18 max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <BrandLogo />

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 transition hover:text-emerald-700"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {session ? (
            <>
              <Link
                href={getDashboardPath(session.user.role)}
                className="rounded-xl bg-emerald-600 px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 sm:px-5"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:px-4"
              >
                Log in
              </Link>
              <Link
                href="/auth/register"
                className="rounded-xl bg-emerald-600 px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 sm:px-5"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
