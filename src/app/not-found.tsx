import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto grid min-h-[65vh] max-w-3xl place-items-center px-4 py-16 text-center">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">404 error</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Page not found</h1>
        <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-600">
          The page you requested does not exist or may have been moved.
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
        >
          Return home
        </Link>
      </div>
    </section>
  );
}
