import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto grid min-h-[65vh] max-w-3xl place-items-center px-4 py-16 text-center sm:px-6">
      <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-emerald-50 text-2xl font-bold text-emerald-700">
          404
        </div>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Page not found
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
          This route does not exist
        </h1>
        <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-600">
          The link may be outdated, or the page may have moved. Continue from the home page or browse available services.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Return home
          </Link>
          <Link
            href="/services"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          >
            Browse services
          </Link>
        </div>
      </div>
    </section>
  );
}
