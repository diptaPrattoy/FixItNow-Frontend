"use client";

import { useEffect, useMemo, useState } from "react";

import { BookingStatusBadge } from "@/components/customer/booking-status-badge";
import { useToast } from "@/components/providers/toast-provider";
import { Pagination } from "@/components/public/pagination";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { apiRequest } from "@/lib/api/client";
import { getApiErrorMessage } from "@/lib/api/errors";
import type { AdminBooking, BookingStatus, PaginationMeta } from "@/types/api";

const defaultMeta: PaginationMeta = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

const statuses: Array<{ value: "ALL" | BookingStatus; label: string }> = [
  { value: "ALL", label: "All statuses" },
  { value: "REQUESTED", label: "Requested" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "PAID", label: "Paid" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "DECLINED", label: "Declined" },
  { value: "CANCELLED", label: "Cancelled" },
];

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatMoney(value: string) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function BookingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white" />
      ))}
    </div>
  );
}

export function AdminBookings() {
  const { toast } = useToast();
  const { session, isReady } = useAuthSession();
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [meta, setMeta] = useState(defaultMeta);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | BookingStatus>("ALL");
  const [refreshKey, setRefreshKey] = useState(0);
  const debouncedSearch = useDebouncedValue(search.trim(), 350);

  useEffect(() => {
    if (!isReady || !session || session.user.role !== "ADMIN") return;

    const token = session.token;
    let cancelled = false;
    const query = new URLSearchParams({ page: String(page), limit: "10" });
    if (debouncedSearch) query.set("search", debouncedSearch);
    if (status !== "ALL") query.set("status", status);

    async function loadBookings() {
      try {
        const response = await apiRequest<AdminBooking[]>(
          `/api/admin/bookings?${query.toString()}`,
          { token },
        );
        if (!cancelled) {
          setBookings(response.data);
          setMeta(response.meta ?? defaultMeta);
        }
      } catch (error) {
        if (!cancelled) {
          setBookings([]);
          setMeta(defaultMeta);
          toast(getApiErrorMessage(error), "error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadBookings();
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, isReady, page, refreshKey, session, status, toast]);

  const pageSummary = useMemo(() => ({
    active: bookings.filter((booking) => ["REQUESTED", "ACCEPTED", "PAID", "IN_PROGRESS"].includes(booking.status)).length,
    completed: bookings.filter((booking) => booking.status === "COMPLETED").length,
    paidValue: bookings
      .filter((booking) => booking.payments.some((payment) => payment.status === "COMPLETED"))
      .reduce((total, booking) => total + Number(booking.amount), 0),
  }), [bookings]);

  function updateSearch(value: string) {
    setLoading(true);
    setPage(1);
    setSearch(value);
  }

  function updateStatus(value: "ALL" | BookingStatus) {
    setLoading(true);
    setPage(1);
    setStatus(value);
  }

  function updatePage(nextPage: number) {
    setLoading(true);
    setPage(nextPage);
  }

  function refresh() {
    setLoading(true);
    setRefreshKey((current) => current + 1);
  }

  function clearFilters() {
    setLoading(true);
    setSearch("");
    setStatus("ALL");
    setPage(1);
  }

  const hasFilters = Boolean(search.trim()) || status !== "ALL";

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Booking oversight</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Monitor every service request</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Search bookings across the platform, review payment state, and follow each job from request to completion.
            </p>
          </div>
          <button type="button" onClick={refresh} disabled={loading} className="w-fit rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-50">
            Refresh
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Active on this page</p><p className="mt-2 text-2xl font-bold text-slate-950">{pageSummary.active}</p></div>
          <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Completed on this page</p><p className="mt-2 text-2xl font-bold text-slate-950">{pageSummary.completed}</p></div>
          <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Paid value on this page</p><p className="mt-2 text-2xl font-bold text-slate-950">{formatMoney(String(pageSummary.paidValue))}</p></div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_190px_auto]">
          <input value={search} onChange={(event) => updateSearch(event.target.value)} placeholder="Search customer, technician, service or address" className="rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
          <select value={status} onChange={(event) => updateStatus(event.target.value as "ALL" | BookingStatus)} className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100">
            {statuses.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <button type="button" onClick={clearFilters} disabled={!hasFilters} className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600 disabled:opacity-40">Clear</button>
        </div>
      </section>

      {loading ? <BookingSkeleton /> : bookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <p className="text-lg font-semibold text-slate-950">No bookings found</p>
          <p className="mt-2 text-sm text-slate-500">Try another search term or booking status.</p>
        </div>
      ) : (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
          <div className="space-y-3 lg:hidden">
            {bookings.map((booking) => (
              <article key={booking.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div><p className="font-semibold text-slate-950">{booking.service.name}</p><p className="mt-1 text-sm text-slate-500">{booking.customer.name} with {booking.technician.user.name}</p></div>
                  <BookingStatusBadge status={booking.status} />
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div><dt className="text-xs text-slate-400">Schedule</dt><dd className="mt-1 font-medium text-slate-700">{formatDateTime(booking.availabilitySlot.startTime)}</dd></div>
                  <div><dt className="text-xs text-slate-400">Amount</dt><dd className="mt-1 font-medium text-slate-700">{formatMoney(booking.amount)}</dd></div>
                </dl>
                <p className="mt-3 text-sm text-slate-500">{booking.address}</p>
                <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
                  <span>{booking.service.category.name}</span><span>•</span><span>{booking.payments[0]?.status ?? "No payment"}</span>
                </div>
              </article>
            ))}
          </div>

          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead><tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400"><th className="px-3 py-3">Booking</th><th className="px-3 py-3">Customer</th><th className="px-3 py-3">Technician</th><th className="px-3 py-3">Schedule</th><th className="px-3 py-3">Amount</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Payment</th></tr></thead>
              <tbody>{bookings.map((booking) => (
                <tr key={booking.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-3 py-4 align-top"><p className="font-semibold text-slate-900">{booking.service.name}</p><p className="mt-1 text-xs text-slate-500">{booking.service.category.name}</p><p className="mt-1 max-w-[220px] truncate text-xs text-slate-400">{booking.address}</p></td>
                  <td className="px-3 py-4 align-top"><p className="font-medium text-slate-700">{booking.customer.name}</p><a href={`mailto:${booking.customer.email}`} className="mt-1 block text-xs text-slate-500 hover:text-emerald-700">{booking.customer.email}</a></td>
                  <td className="px-3 py-4 align-top"><p className="font-medium text-slate-700">{booking.technician.user.name}</p><a href={`mailto:${booking.technician.user.email}`} className="mt-1 block text-xs text-slate-500 hover:text-emerald-700">{booking.technician.user.email}</a></td>
                  <td className="px-3 py-4 align-top text-slate-600">{formatDateTime(booking.availabilitySlot.startTime)}</td>
                  <td className="px-3 py-4 align-top font-semibold text-slate-800">{formatMoney(booking.amount)}</td>
                  <td className="px-3 py-4 align-top"><BookingStatusBadge status={booking.status} /></td>
                  <td className="px-3 py-4 align-top text-xs text-slate-500">{booking.payments[0]?.status ?? "Not started"}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <Pagination meta={meta} onPageChange={updatePage} />
        </section>
      )}
    </div>
  );
}
