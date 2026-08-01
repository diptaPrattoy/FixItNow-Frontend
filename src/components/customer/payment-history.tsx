"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useToast } from "@/components/providers/toast-provider";
import { useAuthSession } from "@/hooks/use-auth-session";
import { apiRequest } from "@/lib/api/client";
import { getApiErrorMessage } from "@/lib/api/errors";
import type { PaginationMeta, PaymentRecord, PaymentStatus } from "@/types/api";

const defaultMeta: PaginationMeta = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

const statusClass: Record<PaymentStatus, string> = {
  PENDING: "bg-amber-50 text-amber-800 ring-amber-200",
  COMPLETED: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  FAILED: "bg-rose-50 text-rose-800 ring-rose-200",
  CANCELLED: "bg-slate-100 text-slate-700 ring-slate-200",
};

function formatMoney(value: string) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function PaymentSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white"
        />
      ))}
    </div>
  );
}

export function PaymentHistory() {
  const { session, isReady } = useAuthSession();
  const { toast } = useToast();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [meta, setMeta] = useState(defaultMeta);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!isReady || !session || session.user.role !== "CUSTOMER") {
      return;
    }

    const token = session.token;
    let cancelled = false;

    async function loadPayments() {
      try {
        const response = await apiRequest<PaymentRecord[]>(
          `/api/payments?page=${page}&limit=10`,
          { token },
        );

        if (!cancelled) {
          setPayments(response.data);
          setMeta(response.meta ?? defaultMeta);
        }
      } catch (error) {
        if (!cancelled) {
          setPayments([]);
          setMeta(defaultMeta);
          toast(getApiErrorMessage(error), "error");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadPayments();

    return () => {
      cancelled = true;
    };
  }, [isReady, page, refreshKey, session, toast]);

  const summary = useMemo(() => {
    const completed = payments.filter(
      (payment) => payment.status === "COMPLETED",
    );
    const paidTotal = completed.reduce(
      (total, payment) => total + Number(payment.amount),
      0,
    );

    return {
      completed: completed.length,
      pending: payments.filter((payment) => payment.status === "PENDING").length,
      paidTotal,
    };
  }, [payments]);

  function changePage(nextPage: number) {
    setLoading(true);
    setPage(nextPage);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
              Customer payments
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Payment history
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Review SSLCommerz attempts, completed transactions and their
              related service bookings.
            </p>
          </div>
          <Link
            href="/dashboard/customer"
            className="inline-flex shrink-0 items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
          >
            View bookings
          </Link>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Completed", value: loading ? "—" : summary.completed },
          { label: "Pending", value: loading ? "—" : summary.pending },
          {
            label: "Paid in this view",
            value: loading ? "—" : formatMoney(String(summary.paidTotal)),
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
              {item.value}
            </p>
          </div>
        ))}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-950">Transactions</h2>
            <p className="mt-1 text-sm text-slate-500">
              {loading
                ? "Loading payments…"
                : `${meta.total} payment${meta.total === 1 ? "" : "s"}`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setRefreshKey((current) => current + 1);
            }}
            className="rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
          >
            Refresh
          </button>
        </div>

        {loading ? <PaymentSkeleton /> : null}

        {!loading && payments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <h3 className="font-semibold text-slate-950">No payment history</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
              A payment will appear here after an accepted booking is sent to
              SSLCommerz.
            </p>
            <Link
              href="/dashboard/customer"
              className="mt-5 inline-flex rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Check accepted bookings
            </Link>
          </div>
        ) : null}

        {!loading && payments.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="hidden grid-cols-[1.2fr_1fr_0.8fr_0.8fr] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 md:grid">
              <span>Booking</span>
              <span>Transaction</span>
              <span>Status</span>
              <span className="text-right">Amount</span>
            </div>

            {payments.map((payment) => (
              <article
                key={payment.id}
                className="border-b border-slate-100 p-5 last:border-b-0 md:grid md:grid-cols-[1.2fr_1fr_0.8fr_0.8fr] md:items-center md:gap-4"
              >
                <div>
                  <p className="font-semibold text-slate-950">
                    {payment.booking?.service?.name ?? "Service payment"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatDateTime(payment.createdAt)}
                  </p>
                </div>

                <div className="mt-4 md:mt-0">
                  <p className="text-xs text-slate-500 md:hidden">Transaction</p>
                  <p className="mt-1 break-all font-mono text-xs text-slate-700 md:mt-0">
                    {payment.transactionId}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {payment.provider}
                  </p>
                </div>

                <div className="mt-4 md:mt-0">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClass[payment.status]}`}
                  >
                    {payment.status.replaceAll("_", " ")}
                  </span>
                </div>

                <div className="mt-4 md:mt-0 md:text-right">
                  <p className="text-xs text-slate-500 md:hidden">Amount</p>
                  <p className="mt-1 font-bold text-slate-950 md:mt-0">
                    {formatMoney(payment.amount)}
                  </p>
                  {payment.paidAt ? (
                    <p className="mt-1 text-xs text-slate-400">
                      Paid {formatDateTime(payment.paidAt)}
                    </p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : null}

        {!loading && meta.totalPages > 1 ? (
          <div className="mt-5 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <button
              type="button"
              onClick={() => changePage(page - 1)}
              disabled={!meta.hasPreviousPage}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <p className="text-sm text-slate-500">
              Page {meta.page} of {meta.totalPages}
            </p>
            <button
              type="button"
              onClick={() => changePage(page + 1)}
              disabled={!meta.hasNextPage}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
