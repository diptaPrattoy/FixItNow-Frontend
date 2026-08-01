import Link from "next/link";

import { BrandLogo } from "@/components/shared/brand-logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div>
          <BrandLogo />
          <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">
            Reliable local professionals for the home services you need.
          </p>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-600">
          <Link href="/services" className="hover:text-emerald-700">
            Services
          </Link>
          <Link href="/technicians" className="hover:text-emerald-700">
            Technicians
          </Link>
          <Link href="/auth/login" className="hover:text-emerald-700">
            Log in
          </Link>
        </div>
      </div>
      <div className="border-t border-slate-100 py-5 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} FixItNow. Built by Dipta Prattoy Karmakar.
      </div>
    </footer>
  );
}
