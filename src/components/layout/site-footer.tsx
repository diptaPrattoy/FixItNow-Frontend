import Link from "next/link";
import { BrandLogo } from "@/components/shared/brand-logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          {/* Brand */}
          <div className="max-w-sm">
            <BrandLogo />

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Reliable local professionals for the home services you need.
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-600">
            <Link
              href="/services"
              className="transition-colors hover:text-emerald-700"
            >
              Services
            </Link>

            <Link
              href="/technicians"
              className="transition-colors hover:text-emerald-700"
            >
              Technicians
            </Link>

            <Link
              href="/contact"
              className="transition-colors hover:text-emerald-700"
            >
              Contact
            </Link>
            <Link href="/about" className="hover:text-emerald-700">
              About
            </Link>

            <Link href="/terms" className="hover:text-emerald-700">
              Terms
            </Link>

            <Link
              href="/auth/login"
              className="transition-colors hover:text-emerald-700"
            >
              Log in
            </Link>
          </nav>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {/* GitHub */}
            <a
              href="https://github.com/diptaPrattoy"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="text-slate-500 transition-colors hover:text-slate-900"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.49.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.604-3.369-1.34-3.369-1.34-.455-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.529 2.341 1.087 2.91.831.091-.646.349-1.087.635-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0 1 12 6.844a9.58 9.58 0 0 1 2.504.337c1.909-1.294 2.748-1.025 2.748-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.936.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.744 0 .267.18.578.688.48A10.001 10.001 0 0 0 22 12c0-5.523-4.477-10-10-10Z" />
              </svg>
            </a>

            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/dipta-prattoy-karmakar/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="text-slate-500 transition-colors hover:text-emerald-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V8.999h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.604 0 4.267 2.37 4.267 5.455v6.287ZM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124ZM3.56 20.452h3.554V8.999H3.56v11.453Z" />
              </svg>
            </a>

            {/* Email */}
            <a
              href="mailto:diptaprattoy@gmail.com"
              aria-label="Email"
              className="text-slate-500 transition-colors hover:text-emerald-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 6.75A2.25 2.25 0 0 1 5.25 4.5h13.5A2.25 2.25 0 0 1 21 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 17.25V6.75Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m3.5 6 8.5 6.25L20.5 6"
                />
              </svg>
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-slate-100 pt-5 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} FixItNow. Built by Dipta Prattoy
          Karmakar.
        </div>
      </div>
    </footer>
  );
}
