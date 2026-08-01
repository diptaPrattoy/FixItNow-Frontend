"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";

export function ServiceSearch() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (location.trim()) params.set("location", location.trim());

    const query = params.toString();
    router.push(query ? `/services?${query}` : "/services");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-900/8 sm:grid-cols-[1fr_0.72fr_auto] sm:items-center"
    >
      <label className="flex min-w-0 items-center gap-3 rounded-xl px-3 py-2.5 focus-within:bg-slate-50">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Service</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Plumbing, AC repair..."
            className="mt-1 w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400"
          />
        </span>
      </label>

      <label className="flex min-w-0 items-center gap-3 rounded-xl border-t border-slate-100 px-3 py-2.5 focus-within:bg-slate-50 sm:border-l sm:border-t-0">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
            <circle cx="12" cy="10" r="2.5" />
          </svg>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Location</span>
          <input
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="Dhaka"
            className="mt-1 w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400"
          />
        </span>
      </label>

      <button
        type="submit"
        className="rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200"
      >
        Find help
      </button>
    </form>
  );
}
