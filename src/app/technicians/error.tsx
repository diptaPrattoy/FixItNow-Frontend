"use client";

export default function TechniciansError({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
      <p className="text-sm font-bold uppercase tracking-[0.16em] text-rose-600">Unable to load</p>
      <h1 className="mt-3 text-3xl font-bold text-slate-950">The technician list is unavailable.</h1>
      <p className="mt-4 text-slate-600">Please try again or check the backend health endpoint.</p>
      <button type="button" onClick={reset} className="mt-7 rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white hover:bg-emerald-700">
        Try again
      </button>
    </div>
  );
}
