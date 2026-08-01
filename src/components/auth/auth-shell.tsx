import Link from "next/link";
import type { ReactNode } from "react";

import { BrandLogo } from "@/components/shared/brand-logo";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
};

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: AuthShellProps) {
  return (
    <div className="min-h-[calc(100vh-9rem)] bg-white">
      <div className="mx-auto grid min-h-[calc(100vh-9rem)] max-w-7xl lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="hidden border-r border-emerald-100 bg-emerald-50/70 px-10 py-12 lg:flex lg:flex-col lg:justify-between">
          <BrandLogo />
          <div className="max-w-sm">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">
              Simple home services
            </p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-slate-950">
              Book trusted help without the usual hassle.
            </h2>
            <p className="mt-5 leading-7 text-slate-600">
              Browse services, choose an available time and follow every booking
              from request to completion.
            </p>
          </div>
          <Link href="/" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
            ← Back to home
          </Link>
        </aside>

        <section className="flex items-center justify-center px-4 py-10 sm:px-8 lg:px-14">
          <div className="w-full max-w-lg">
            <div className="mb-8 lg:hidden">
              <BrandLogo />
            </div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-700">
              {eyebrow}
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 leading-7 text-slate-600">{description}</p>
            <div className="mt-8">{children}</div>
            <div className="mt-6 text-sm text-slate-600">{footer}</div>
          </div>
        </section>
      </div>
    </div>
  );
}
