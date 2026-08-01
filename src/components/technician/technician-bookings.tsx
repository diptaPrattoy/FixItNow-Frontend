"use client";

import { useEffect, useMemo, useState } from "react";

import { BookingStatusBadge } from "@/components/customer/booking-status-badge";
import { useToast } from "@/components/providers/toast-provider";
import { useAuthSession } from "@/hooks/use-auth-session";
import { apiRequest } from "@/lib/api/client";
import { getApiErrorMessage } from "@/lib/api/errors";
import type {
  BookingStatus,
  PaginationMeta,
  TechnicianBooking,
} from "@/types/api";

const defaultMeta: PaginationMeta = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

const statusOptions: Array<{ value: "ALL" | BookingStatus; label: string }> = [
  { value: "ALL", label: "All bookings" },
  { value: "REQUESTED", label: "Requested" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "PAID", label: "Paid" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "DECLINED", label: "Declined" },
  { value: "CANCELLED", label: "Cancelled" },
];

const actionCopy = {
  ACCEPTED: {
    title: "Accept this request?",
    description:
      "The customer will be able to complete payment after you accept the booking.",
    button: "Accept booking",
  },
  IN_PROGRESS: {
    title: "Start this job?",
    description:
      "Starting the job changes its status to in progress. The customer will no longer be able to cancel it.",
    button: "Start job",
  },
  COMPLETED: {
    title: "Mark this job completed?",
    description:
      "Only complete the booking after the requested service has been delivered.",
    button: "Mark completed",
  },
} satisfies Record<
  "ACCEPTED" | "IN_PROGRESS" | "COMPLETED",
  { title: string; description: string; button: string }
>;

type ConfirmAction = {
  booking: TechnicianBooking;
  status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED";
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

function getActionDetails(status: ConfirmAction["status"]) {
  return actionCopy[status];
}

function BookingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white"
        />
      ))}
    </div>
  );
}

function EmptyBookings({ filtered }: { filtered: boolean }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <p className="text-lg font-semibold text-slate-950">
        {filtered ? "No bookings match this status" : "No booking requests yet"}
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {filtered
          ? "Choose another status to view the rest of your work."
          : "New customer requests will appear here as soon as someone books one of your available time slots."}
      </p>
    </div>
  );
}

function BookingActions({
  booking,
  busy,
  onConfirm,
  onDecline,
}: {
  booking: TechnicianBooking;
  busy: boolean;
  onConfirm: (status: ConfirmAction["status"]) => void;
  onDecline: () => void;
}) {
  if (booking.status === "REQUESTED") {
    return (
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => onConfirm("ACCEPTED")}
          className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Accept
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onDecline}
          className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Decline
        </button>
      </div>
    );
  }

  if (booking.status === "PAID") {
    return (
      <button
        type="button"
        disabled={busy}
        onClick={() => onConfirm("IN_PROGRESS")}
        className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Start job
      </button>
    );
  }

  if (booking.status === "IN_PROGRESS") {
    return (
      <button
        type="button"
        disabled={busy}
        onClick={() => onConfirm("COMPLETED")}
        className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Mark completed
      </button>
    );
  }

  if (booking.status === "ACCEPTED") {
    return <p className="text-xs font-medium text-sky-700">Waiting for payment</p>;
  }

  return <p className="text-xs text-slate-400">No action needed</p>;
}

export function TechnicianBookings() {
  const { toast } = useToast();
  const { session, isReady } = useAuthSession();
  const [bookings, setBookings] = useState<TechnicianBooking[]>([]);
  const [meta, setMeta] = useState(defaultMeta);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<"ALL" | BookingStatus>("ALL");
  const [refreshKey, setRefreshKey] = useState(0);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [declineTarget, setDeclineTarget] = useState<TechnicianBooking | null>(null);
  const [declineReason, setDeclineReason] = useState("");

  useEffect(() => {
    if (!isReady || !session || session.user.role !== "TECHNICIAN") {
      return;
    }

    let cancelled = false;
    const token = session.token;
    const statusQuery = status === "ALL" ? "" : `&status=${status}`;

    async function loadBookings() {
      try {
        const response = await apiRequest<TechnicianBooking[]>(
          `/api/technician/bookings?page=${page}&limit=10${statusQuery}`,
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
  }, [isReady, page, refreshKey, session, status, toast]);

  const summary = useMemo(() => {
    return {
      pending: bookings.filter((booking) => booking.status === "REQUESTED").length,
      upcoming: bookings.filter((booking) =>
        ["ACCEPTED", "PAID", "IN_PROGRESS"].includes(booking.status),
      ).length,
      completed: bookings.filter((booking) => booking.status === "COMPLETED").length,
    };
  }, [bookings]);

  function refreshBookings() {
    setLoading(true);
    setRefreshKey((current) => current + 1);
  }

  function changeStatusFilter(nextStatus: "ALL" | BookingStatus) {
    setLoading(true);
    setPage(1);
    setStatus(nextStatus);
  }

  function changePage(nextPage: number) {
    setLoading(true);
    setPage(nextPage);
  }

  function closeConfirmDialog() {
    if (updatingId) return;
    setConfirmAction(null);
  }

  function closeDeclineDialog() {
    if (updatingId) return;
    setDeclineTarget(null);
    setDeclineReason("");
  }

  function updateBookingInList(updated: TechnicianBooking) {
    setBookings((current) =>
      current.map((booking) =>
        booking.id === updated.id ? { ...booking, ...updated } : booking,
      ),
    );
  }

  async function updateBookingStatus(
    booking: TechnicianBooking,
    nextStatus: ConfirmAction["status"] | "DECLINED",
    reason?: string,
  ) {
    if (!session) return;

    setUpdatingId(booking.id);

    try {
      const response = await apiRequest<TechnicianBooking>(
        `/api/technician/bookings/${booking.id}`,
        {
          method: "PATCH",
          token: session.token,
          body: {
            status: nextStatus,
            ...(nextStatus === "DECLINED" ? { declineReason: reason } : {}),
          },
        },
      );

      updateBookingInList(response.data);
      toast(
        nextStatus === "ACCEPTED"
          ? "Booking accepted. Waiting for customer payment."
          : nextStatus === "DECLINED"
            ? "Booking request declined."
            : nextStatus === "IN_PROGRESS"
              ? "Job marked as in progress."
              : "Job marked as completed.",
        "success",
      );
      setConfirmAction(null);
      setDeclineTarget(null);
      setDeclineReason("");
    } catch (error) {
      toast(getApiErrorMessage(error), "error");
    } finally {
      setUpdatingId(null);
    }
  }

  async function confirmStatusUpdate() {
    if (!confirmAction) return;
    await updateBookingStatus(confirmAction.booking, confirmAction.status);
  }

  async function confirmDecline() {
    if (!declineTarget) return;

    const reason = declineReason.trim();
    if (reason.length < 3) {
      toast("Please provide a short reason for declining the request.", "error");
      return;
    }

    await updateBookingStatus(declineTarget, "DECLINED", reason);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
              Job workflow
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Booking requests
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Review customer requests, accept suitable jobs and move paid bookings
              through the service workflow.
            </p>
          </div>
          <button
            type="button"
            onClick={refreshBookings}
            disabled={loading}
            className="w-fit rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Refresh bookings
          </button>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Pending requests</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{summary.pending}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Upcoming work</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{summary.upcoming}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Completed here</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{summary.completed}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-950">Your bookings</h2>
            <p className="mt-1 text-sm text-slate-500">
              {meta.total} booking{meta.total === 1 ? "" : "s"} found
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <span className="font-medium">Status</span>
            <select
              value={status}
              onChange={(event) =>
                changeStatusFilter(event.target.value as "ALL" | BookingStatus)
              }
              className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5">
          {loading ? (
            <BookingSkeleton />
          ) : bookings.length === 0 ? (
            <EmptyBookings filtered={status !== "ALL"} />
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {bookings.map((booking) => (
                  <article
                    key={booking.id}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-950">
                          {booking.service.name}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {booking.customer.name}
                        </p>
                      </div>
                      <BookingStatusBadge status={booking.status} />
                    </div>

                    <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <dt className="text-xs text-slate-400">Schedule</dt>
                        <dd className="mt-1 font-medium text-slate-700">
                          {formatDateTime(booking.availabilitySlot.startTime)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate-400">Amount</dt>
                        <dd className="mt-1 font-medium text-slate-700">
                          {formatMoney(booking.amount)}
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                      <p>{booking.address}</p>
                      {booking.notes ? <p className="mt-1">{booking.notes}</p> : null}
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                      <a
                        href={`mailto:${booking.customer.email}`}
                        className="text-xs font-semibold text-slate-500 transition hover:text-emerald-700"
                      >
                        Contact customer
                      </a>
                      <BookingActions
                        booking={booking}
                        busy={updatingId === booking.id}
                        onConfirm={(nextStatus) =>
                          setConfirmAction({ booking, status: nextStatus })
                        }
                        onDecline={() => {
                          setDeclineTarget(booking);
                          setDeclineReason("");
                        }}
                      />
                    </div>
                  </article>
                ))}
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                      <th className="px-3 py-3 font-semibold">Customer</th>
                      <th className="px-3 py-3 font-semibold">Service</th>
                      <th className="px-3 py-3 font-semibold">Schedule</th>
                      <th className="px-3 py-3 font-semibold">Amount</th>
                      <th className="px-3 py-3 font-semibold">Status</th>
                      <th className="px-3 py-3 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="border-b border-slate-100 last:border-0">
                        <td className="px-3 py-4 align-top">
                          <p className="font-semibold text-slate-900">
                            {booking.customer.name}
                          </p>
                          <a
                            href={`mailto:${booking.customer.email}`}
                            className="mt-1 block text-xs text-slate-500 hover:text-emerald-700"
                          >
                            {booking.customer.email}
                          </a>
                          {booking.customer.phone ? (
                            <a
                              href={`tel:${booking.customer.phone}`}
                              className="mt-1 block text-xs text-slate-500 hover:text-emerald-700"
                            >
                              {booking.customer.phone}
                            </a>
                          ) : null}
                        </td>
                        <td className="px-3 py-4 align-top">
                          <p className="font-medium text-slate-900">{booking.service.name}</p>
                          <p className="mt-1 max-w-[220px] text-xs leading-5 text-slate-500">
                            {booking.address}
                          </p>
                        </td>
                        <td className="px-3 py-4 align-top text-slate-600">
                          {formatDateTime(booking.availabilitySlot.startTime)}
                        </td>
                        <td className="px-3 py-4 align-top font-medium text-slate-700">
                          {formatMoney(booking.amount)}
                        </td>
                        <td className="px-3 py-4 align-top">
                          <BookingStatusBadge status={booking.status} />
                        </td>
                        <td className="px-3 py-4 align-top">
                          <BookingActions
                            booking={booking}
                            busy={updatingId === booking.id}
                            onConfirm={(nextStatus) =>
                              setConfirmAction({ booking, status: nextStatus })
                            }
                            onDecline={() => {
                              setDeclineTarget(booking);
                              setDeclineReason("");
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {meta.totalPages > 1 ? (
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-5">
                  <p className="text-sm text-slate-500">
                    Page {meta.page} of {meta.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={!meta.hasPreviousPage || loading}
                      onClick={() => changePage(Math.max(1, page - 1))}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={!meta.hasNextPage || loading}
                      onClick={() => changePage(page + 1)}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </section>

      {confirmAction ? (
        <div
          className="fixed inset-0 z-[110] flex items-end justify-center bg-slate-950/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="booking-action-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 id="booking-action-title" className="text-xl font-bold text-slate-950">
              {getActionDetails(confirmAction.status).title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {getActionDetails(confirmAction.status).description}
            </p>
            <div className="mt-5 rounded-xl bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">
                {confirmAction.booking.service.name}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {confirmAction.booking.customer.name} · {formatDateTime(confirmAction.booking.availabilitySlot.startTime)}
              </p>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                disabled={Boolean(updatingId)}
                onClick={closeConfirmDialog}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-60"
              >
                Keep unchanged
              </button>
              <button
                type="button"
                disabled={Boolean(updatingId)}
                onClick={() => void confirmStatusUpdate()}
                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updatingId ? "Updating..." : getActionDetails(confirmAction.status).button}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {declineTarget ? (
        <div
          className="fixed inset-0 z-[110] flex items-end justify-center bg-slate-950/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="decline-booking-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 id="decline-booking-title" className="text-xl font-bold text-slate-950">
              Decline this request?
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Give the customer a brief reason so they understand why the booking cannot be accepted.
            </p>
            <label className="mt-5 block">
              <span className="text-sm font-semibold text-slate-700">Reason</span>
              <textarea
                value={declineReason}
                onChange={(event) => setDeclineReason(event.target.value)}
                rows={4}
                maxLength={500}
                placeholder="I am unavailable during the selected time."
                className="mt-2 w-full resize-none rounded-xl border border-slate-300 px-3 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </label>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                disabled={Boolean(updatingId)}
                onClick={closeDeclineDialog}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-60"
              >
                Keep request
              </button>
              <button
                type="button"
                disabled={Boolean(updatingId)}
                onClick={() => void confirmDecline()}
                className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updatingId ? "Declining..." : "Decline request"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
