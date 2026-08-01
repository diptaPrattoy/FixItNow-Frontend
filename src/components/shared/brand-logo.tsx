import Link from "next/link";

export function BrandLogo() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600"
      aria-label="FixItNow home"
    >
      <span className="grid size-10 place-items-center rounded-xl bg-emerald-600 text-white shadow-sm shadow-emerald-900/20">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14.7 6.3a4 4 0 0 0-5-5L7.9 3.1l3 3-4.6 4.6-3-3-1.8 1.8a4 4 0 0 0 5 5l8.3 8.3a2.1 2.1 0 0 0 3-3l-8.3-8.3" />
          <path d="m16 8 4-4" />
        </svg>
      </span>
      <span className="text-xl font-bold tracking-tight text-slate-950">
        FixIt<span className="text-emerald-600">Now</span>
      </span>
    </Link>
  );
}
