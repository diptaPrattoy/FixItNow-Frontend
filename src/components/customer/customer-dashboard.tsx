"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { BookingStatusBadge } from "@/components/customer/booking-status-badge";
import { useToast } from "@/components/providers/toast-provider";
import { useAuthSession } from "@/hooks/use-auth-session";
import { apiRequest } from "@/lib/api/client";
import { getApiErrorMessage } from "@/lib/api/errors";
import type { CustomerBooking, PaginationMeta } from "@/types/api";

const defaultMeta: PaginationMeta = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
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

function isCancellable(status: CustomerBooking["status"]) {
  return status === "REQUESTED" || status === "ACCEPTED";
}

function BookingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="h-44 animate-pulse rounded-2xl border border-slate-200 bg-white"
        />
      ))}
    </div>
  );
}

export function CustomerDashboard() {
  const { toast } = useToast();
  const { session, isReady } = useAuthSession();
  const [bookings, setBookings] = useState<CustomerBooking[]>([]);
  const [meta, setMeta] = useState(defaultMeta);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<CustomerBooking | null>(null);
  const [cancelReason, setCancelReason] = useState(
    "My schedule has changed.",
  );

  useEffect(() => {
    if (!isReady || !session || session.user.role !== "CUSTOMER") {
      return;
    }

    let cancelled = false;
    const token = session.token;

    async function loadBookings() {
      try {
        const response = await apiRequest<CustomerBooking[]>(
          `/api/bookings?page=${page}&limit=10`,
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
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadBookings();

    return () => {
      cancelled = true;
    };
  }, [isReady, page, refreshKey, session, toast]);

  const summary = useMemo(() => {
    const active = bookings.filter((booking) =>
      ["REQUESTED", "ACCEPTED", "PAID", "IN_PROGRESS"].includes(
        booking.status,
      ),
    ).length;
    const completed = bookings.filter(
      (booking) => booking.status === "COMPLETED",
    ).length;
    const awaitingPayment = bookings.filter(
      (booking) => booking.status === "ACCEPTED",
    ).length;

    return { active, completed, awaitingPayment };
  }, [bookings]);

  function openCancelDialog(booking: CustomerBooking) {
    setCancelTarget(booking);
    setCancelReason("My schedule has changed.");
  }

  function closeCancelDialog() {
    if (cancellingId) {
      return;
    }

    setCancelTarget(null);
    setCancelReason("My schedule has changed.");
  }

  async function confirmCancellation() {
    if (!session || !cancelTarget || !isCancellable(cancelTarget.status)) {
      return;
    }

    if (cancelReason.trim().length < 3) {
      toast("Please provide a short cancellation reason.", "error");
      return;
    }

    setCancellingId(cancelTarget.id);

    try {
      const response = await apiRequest<CustomerBooking>(
        `/api/bookings/${cancelTarget.id}/cancel`,
        {
          method: "PATCH",
          token: session.token,
          body: { reason: cancelReason.trim() },
        },
      );

      setBookings((current) =>
        current.map((item) =>
          item.id === cancelTarget.id
            ? {
                ...item,
                ...response.data,
                status: response.data.status ?? "CANCELLED",
                cancellationReason:
                  response.data.cancellationReason ?? cancelReason.trim(),
              }
            : item,
        ),
      );
      toast("Booking cancelled successfully.", "success");
      setCancelTarget(null);
      setCancelReason("My schedule has changed.");
    } catch (error) {
      toast(getApiErrorMessage(error), "error");
    } finally {
      setCancellingId(null);
    }
  }

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
              Customer dashboard
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Your service bookings
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Follow technician responses, cancel eligible requests and continue
              accepted bookings to payment.
            </p>
          </div>
          <Link
            href="/services"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Book a service
          </Link>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Active bookings", value: summary.active },
          { label: "Awaiting payment", value: summary.awaitingPayment },
          { label: "Completed", value: summary.completed },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              {loading ? "—" : item.value}
            </p>
          </div>
        ))}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-950">Booking history</h2>
            <p className="mt-1 text-sm text-slate-500">
              {loading
                ? "Loading your bookings…"
                : `${meta.total} booking${meta.total === 1 ? "" : "s"}`}
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

        {loading ? <BookingSkeleton /> : null}

        {!loading && bookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <h3 className="font-semibold text-slate-950">No bookings yet</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
              Open a technician profile, select an available time and send your
              first booking request.
            </p>
            <Link
              href="/technicians"
              className="mt-5 inline-flex rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Browse technicians
            </Link>
          </div>
        ) : null}

        {!loading && bookings.length > 0 ? (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <article
                key={booking.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <BookingStatusBadge status={booking.status} />
                      <span className="text-xs text-slate-400">
                        Requested {formatDateTime(booking.createdAt)}
                      </span>
                    </div>
                    <h3 className="mt-3 text-lg font-bold text-slate-950">
                      {booking.service.name}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Technician: {booking.technician.user.name}
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-lg font-bold text-slate-950">
                      {formatMoney(booking.amount || booking.service.price)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {booking.service.durationMinutes} minutes
                    </p>
                  </div>
                </div>

                <dl className="mt-5 grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-slate-500">Scheduled time</dt>
                    <dd className="mt-1 font-medium text-slate-800">
                      {formatDateTime(booking.availabilitySlot.startTime)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Service address</dt>
                    <dd className="mt-1 font-medium text-slate-800">
                      {booking.address}
                    </dd>
                  </div>
                </dl>

                {booking.declineReason ? (
                  <p className="mt-4 rounded-xl border border-rose-100 bg-rose-50 px-3.5 py-3 text-sm text-rose-800">
                    Decline reason: {booking.declineReason}
                  </p>
                ) : null}

                {booking.cancellationReason ? (
                  <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-700">
                    Cancellation reason: {booking.cancellationReason}
                  </p>
                ) : null}

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  {booking.status === "ACCEPTED" ? (
                    <span className="rounded-xl bg-violet-50 px-3.5 py-2 text-sm font-semibold text-violet-800">
                      Ready for payment
                    </span>
                  ) : null}

                  {isCancellable(booking.status) ? (
                    <button
                      type="button"
                      onClick={() => openCancelDialog(booking)}
                      disabled={cancellingId === booking.id}
                      className="rounded-xl border border-rose-200 px-3.5 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {cancellingId === booking.id
                        ? "Cancelling…"
                        : "Cancel booking"}
                    </button>
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

      {cancelTarget ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-booking-title"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) {
              closeCancelDialog();
            }
          }}
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl sm:p-6">
            <h2
              id="cancel-booking-title"
              className="text-xl font-bold text-slate-950"
            >
              Cancel booking
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              This will release the selected time slot for another customer.
            </p>

            <label className="mt-5 block">
              <span className="text-sm font-semibold text-slate-700">
                Cancellation reason
              </span>
              <textarea
                value={cancelReason}
                onChange={(event) => setCancelReason(event.target.value)}
                rows={3}
                maxLength={500}
                disabled={Boolean(cancellingId)}
                className="mt-2 w-full resize-none rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
            </label>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeCancelDialog}
                disabled={Boolean(cancellingId)}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Keep booking
              </button>
              <button
                type="button"
                onClick={() => void confirmCancellation()}
                disabled={Boolean(cancellingId)}
                className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {cancellingId ? "Cancelling…" : "Confirm cancellation"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
