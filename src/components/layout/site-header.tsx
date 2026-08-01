"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useToast } from "@/components/providers/toast-provider";
import { BrandLogo } from "@/components/shared/brand-logo";
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
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

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
    setMenuOpen(false);
    toast("You have been logged out.", "success");
    router.push("/");
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

        <div className="hidden items-center gap-2 md:flex">
          {session ? (
            <>
              <Link
                href={getDashboardPath(session.user.role)}
                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
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
              <Link href="/auth/login" className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                Log in
              </Link>
              <Link href="/auth/register" className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700">
                Get started
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="grid size-10 place-items-center rounded-xl border border-slate-200 text-slate-700 md:hidden"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          <span className="text-xl leading-none" aria-hidden="true">{menuOpen ? "×" : "☰"}</span>
        </button>
      </div>

      {menuOpen ? (
        <div className="border-t border-slate-100 bg-white px-4 py-4 md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1" aria-label="Mobile navigation">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-emerald-700"
              >
                {link.label}
              </Link>
            ))}
            <div className="my-2 border-t border-slate-100" />
            {session ? (
              <>
                <Link
                  href={getDashboardPath(session.user.role)}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl bg-emerald-600 px-3 py-2.5 text-center text-sm font-semibold text-white"
                >
                  Open dashboard
                </Link>
                <button type="button" onClick={handleLogout} className="rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  Log out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/auth/login"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl border border-slate-300 px-3 py-2.5 text-center text-sm font-semibold text-slate-700"
                >
                  Log in
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl bg-emerald-600 px-3 py-2.5 text-center text-sm font-semibold text-white"
                >
                  Get started
                </Link>
              </div>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
