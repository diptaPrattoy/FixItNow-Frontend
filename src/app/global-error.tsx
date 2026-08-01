"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body className="m-0 bg-slate-50 font-sans text-slate-950">
        <div
          className="fixed right-4 top-4 z-50 max-w-sm rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm text-rose-800 shadow-lg"
          role="alert"
        >
          FixItNow encountered a critical page error.
        </div>
        <main className="grid min-h-screen place-items-center px-4 py-16">
          <section className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
            <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-rose-50 text-2xl font-bold text-rose-700">
              !
            </div>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
              Application error
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight">
              FixItNow needs to reload this page
            </h1>
            <p className="mt-4 leading-7 text-slate-600">
              Your account and payment information have not been changed by this screen. Retry the application before repeating any action.
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-7 min-h-11 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Reload application
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
