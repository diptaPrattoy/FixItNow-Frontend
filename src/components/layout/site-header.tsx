"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { useToast } from "@/components/providers/toast-provider";
import { BrandLogo } from "@/components/shared/brand-logo";
import { UserAvatar } from "@/components/shared/user-avatar";
import { useAuthSession } from "@/hooks/use-auth-session";
import { clearAuthSession, getDashboardPath } from "@/lib/auth/session";

const links = [
  { href: "/services", label: "Services" },
  { href: "/technicians", label: "Technicians" },
  { href: "/#how-it-works", label: "How it works" },
];

function isActive(pathname: string, href: string) {
  if (href.includes("#")) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function MenuIcon({ open }: { open: boolean }) {
  return open ? (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const { toast } = useToast();
  const router = useRouter();
  const { session } = useAuthSession();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    clearAuthSession();
    setMenuOpen(false);
    toast("You have been logged out.", "success");
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex min-h-18 max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <BrandLogo />

        <nav className="hidden items-center gap-2 md:flex" aria-label="Main navigation">
          {links.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-emerald-50 text-emerald-800"
                    : "text-slate-600 hover:bg-slate-50 hover:text-emerald-700"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {session ? (
            <>
              <Link
                href={getDashboardPath(session.user.role)}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 py-2 pl-2 pr-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                <UserAvatar
                  name={session.user.name}
                  src={session.user.avatarUrl}
                  size={28}
                  className="rounded-lg bg-white/20 text-white ring-white/30"
                />
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
          className="grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 md:hidden"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          aria-controls="mobile-site-navigation"
        >
          <MenuIcon open={menuOpen} />
        </button>
      </div>

      {menuOpen ? (
        <div id="mobile-site-navigation" className="border-t border-slate-100 bg-white px-4 py-4 shadow-lg shadow-slate-950/5 md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1" aria-label="Mobile navigation">
            {links.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-xl px-3 py-2.5 text-sm font-semibold ${
                    active
                      ? "bg-emerald-50 text-emerald-800"
                      : "text-slate-700 hover:bg-slate-50 hover:text-emerald-700"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <div className="my-2 border-t border-slate-100" />
            {session ? (
              <>
                <div className="mb-2 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                  <UserAvatar
                    name={session.user.name}
                    src={session.user.avatarUrl}
                    size={40}
                    className="rounded-xl"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{session.user.name}</p>
                    <p className="text-xs capitalize text-slate-500">{session.user.role.toLowerCase()} account</p>
                  </div>
                </div>
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
