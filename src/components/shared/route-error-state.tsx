"use client";

import Link from "next/link";
import { useEffect } from "react";

import { useToast } from "@/components/providers/toast-provider";

type RouteErrorStateProps = {
  error?: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: string;
};

export function RouteErrorState({
  error,
  reset,
  title = "We could not load this page",
  description = "The request did not finish correctly. Try again, or return home if the problem continues.",
}: RouteErrorStateProps) {
  const { toast } = useToast();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      toast(
        error?.message || "Something went wrong while loading this page.",
        "error",
      );
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [error, toast]);

  return (
    <section className="mx-auto grid min-h-[58vh] max-w-3xl place-items-center px-4 py-16 text-center sm:px-6">
      <div className="w-full rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-rose-50 text-rose-700">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
            <path d="M10.3 2.9 1.8 17.2A2 2 0 0 0 3.5 20h17a2 2 0 0 0 1.7-2.8L13.7 2.9a2 2 0 0 0-3.4 0Z" />
          </svg>
        </div>

        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">
          Request interrupted
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-600">
          {description}
        </p>

        {error?.digest ? (
          <p className="mt-4 text-xs text-slate-400">Reference: {error.digest}</p>
        ) : null}

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              toast("Retrying the page…", "info");
              reset();
            }}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
          >
            Return home
          </Link>
        </div>
      </div>
    </section>
  );
}
