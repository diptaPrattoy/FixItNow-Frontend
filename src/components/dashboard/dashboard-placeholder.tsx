import Link from "next/link";

export function DashboardPlaceholder({ role }: { role: string }) {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-700">
          {role} dashboard
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
          Your account is connected.
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-600">
          The dashboard modules will be added in the next commits. Your login
          session is already stored for protected API requests.
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          Return home
        </Link>
      </div>
    </section>
  );
}
