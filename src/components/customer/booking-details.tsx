"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { BookingStatusBadge } from "@/components/customer/booking-status-badge";
import { ReviewDialog } from "@/components/customer/review-dialog";
import { useToast } from "@/components/providers/toast-provider";
import { UserAvatar } from "@/components/shared/user-avatar";
import { useAuthSession } from "@/hooks/use-auth-session";
import { apiRequest } from "@/lib/api/client";
import { getApiErrorMessage } from "@/lib/api/errors";
import type { CustomerBooking, CustomerReview } from "@/types/api";

type BookingDetailsProps = {
  bookingId: string;
};

type TimelineStep = {
  key: string;
  label: string;
  description: string;
  date: string | null;
  state: "complete" | "current" | "pending" | "terminal";
};

const standardFlow = [
  "REQUESTED",
  "ACCEPTED",
  "PAID",
  "IN_PROGRESS",
  "COMPLETED",
] as const;

function formatMoney(value: string) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return null;

  return new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getPayment(booking: CustomerBooking) {
  return [...(booking.payments ?? [])].sort(
    (a, b) =>
      new Date(b.paidAt ?? 0).getTime() - new Date(a.paidAt ?? 0).getTime(),
  )[0];
}

function getTimeline(booking: CustomerBooking): TimelineStep[] {
  if (booking.status === "DECLINED") {
    return [
      {
        key: "REQUESTED",
        label: "Request sent",
        description: "Your booking request was sent to the technician.",
        date: booking.createdAt,
        state: "complete",
      },
      {
        key: "DECLINED",
        label: "Request declined",
        description:
          booking.declineReason ?? "The technician could not take this job.",
        date: booking.updatedAt,
        state: "terminal",
      },
    ];
  }

  if (booking.status === "CANCELLED") {
    return [
      {
        key: "REQUESTED",
        label: "Request sent",
        description: "Your booking request was created.",
        date: booking.createdAt,
        state: "complete",
      },
      {
        key: "CANCELLED",
        label: "Booking cancelled",
        description:
          booking.cancellationReason ?? "This booking is no longer active.",
        date: booking.cancelledAt ?? booking.updatedAt,
        state: "terminal",
      },
    ];
  }

  const currentIndex = standardFlow.indexOf(
    booking.status as (typeof standardFlow)[number],
  );
  const payment = getPayment(booking);

  const details: Record<
    (typeof standardFlow)[number],
    { label: string; description: string; date: string | null }
  > = {
    REQUESTED: {
      label: "Request sent",
      description: "The technician has received your booking request.",
      date: booking.createdAt,
    },
    ACCEPTED: {
      label: "Technician accepted",
      description: "You can now complete the secure payment.",
      date: booking.acceptedAt,
    },
    PAID: {
      label: "Payment completed",
      description: "SSLCommerz payment was verified successfully.",
      date: payment?.paidAt ?? null,
    },
    IN_PROGRESS: {
      label: "Job in progress",
      description: "The technician has started working on the service.",
      date: booking.startedAt,
    },
    COMPLETED: {
      label: "Service completed",
      description: "The job has been marked as completed.",
      date: booking.completedAt,
    },
  };

  return standardFlow.map((key, index) => ({
    key,
    ...details[key],
    state:
      index < currentIndex
        ? "complete"
        : index === currentIndex
          ? "current"
          : "pending",
  }));
}

function DetailSkeleton() {
  return (
    <div className="space-y-5">
      <div className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white" />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="h-[32rem] animate-pulse rounded-2xl border border-slate-200 bg-white" />
        <div className="h-96 animate-pulse rounded-2xl border border-slate-200 bg-white" />
      </div>
    </div>
  );
}

function Timeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol className="space-y-0" aria-label="Booking progress">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const active = step.state === "complete" || step.state === "current";
        const terminal = step.state === "terminal";

        return (
          <li key={step.key} className="relative flex gap-4 pb-7 last:pb-0">
            {!isLast ? (
              <span
                className={`absolute left-[11px] top-6 h-[calc(100%-0.25rem)] w-px ${
                  active ? "bg-emerald-300" : "bg-slate-200"
                }`}
                aria-hidden="true"
              />
            ) : null}
            <span
              className={`relative z-10 mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border-2 ${
                terminal
                  ? "border-rose-500 bg-rose-50"
                  : step.state === "pending"
                    ? "border-slate-300 bg-white"
                    : "border-emerald-600 bg-emerald-600"
              }`}
              aria-hidden="true"
            >
              {step.state === "complete" ? (
                <svg
                  viewBox="0 0 24 24"
                  className="size-3.5 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="m5 12 4 4L19 6" />
                </svg>
              ) : terminal ? (
                <span className="size-2 rounded-full bg-rose-500" />
              ) : step.state === "current" ? (
                <span className="size-2 rounded-full bg-white" />
              ) : null}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <p
                  className={`font-semibold ${
                    terminal
                      ? "text-rose-800"
                      : step.state === "pending"
                        ? "text-slate-400"
                        : "text-slate-900"
                  }`}
                >
                  {step.label}
                </p>
                {step.date ? (
                  <time className="text-xs text-slate-400">
                    {formatDateTime(step.date)}
                  </time>
                ) : null}
              </div>
              <p
                className={`mt-1 text-sm leading-6 ${
                  step.state === "pending" ? "text-slate-400" : "text-slate-600"
                }`}
              >
                {step.description}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function BookingDetails({ bookingId }: BookingDetailsProps) {
  const { session, isReady } = useAuthSession();
  const { toast } = useToast();
  const [booking, setBooking] = useState<CustomerBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("My schedule has changed.");
  const [cancelling, setCancelling] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!isReady || !session || session.user.role !== "CUSTOMER") return;

    const token = session.token;
    let cancelled = false;

    async function loadBooking() {
      try {
        const response = await apiRequest<CustomerBooking>(
          `/api/bookings/${bookingId}`,
          { token },
        );

        if (!cancelled) setBooking(response.data);
      } catch (error) {
        if (!cancelled) {
          setBooking(null);
          toast(getApiErrorMessage(error), "error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadBooking();

    return () => {
      cancelled = true;
    };
  }, [bookingId, isReady, refreshKey, session, toast]);

  const timeline = useMemo(
    () => (booking ? getTimeline(booking) : []),
    [booking],
  );

  const payment = booking ? getPayment(booking) : undefined;
  const canCancel =
    booking?.status === "REQUESTED" || booking?.status === "ACCEPTED";

  async function cancelBooking() {
    if (!session || !booking || !canCancel) return;

    if (cancelReason.trim().length < 3) {
      toast("Please provide a short cancellation reason.", "error");
      return;
    }

    setCancelling(true);

    try {
      const response = await apiRequest<CustomerBooking>(
        `/api/bookings/${booking.id}/cancel`,
        {
          method: "PATCH",
          token: session.token,
          body: { reason: cancelReason.trim() },
        },
      );

      setBooking(response.data);
      setCancelDialogOpen(false);
      toast("Booking cancelled successfully.", "success");
    } catch (error) {
      toast(getApiErrorMessage(error), "error");
    } finally {
      setCancelling(false);
    }
  }

  async function submitReview(rating: number, comment: string) {
    if (!session || !booking || booking.status !== "COMPLETED") return;

    setSubmittingReview(true);

    try {
      const response = await apiRequest<CustomerReview>("/api/reviews", {
        method: "POST",
        token: session.token,
        body: {
          bookingId: booking.id,
          rating,
          comment: comment || null,
        },
      });

      setBooking((current) =>
        current
          ? {
              ...current,
              review: {
                id: response.data.id,
                rating: response.data.rating,
                comment: response.data.comment,
                createdAt: response.data.createdAt,
              },
            }
          : current,
      );
      setReviewOpen(false);
      toast("Review submitted successfully.", "success");
    } catch (error) {
      toast(getApiErrorMessage(error), "error");
    } finally {
      setSubmittingReview(false);
    }
  }

  if (!isReady || loading) return <DetailSkeleton />;

  if (!booking) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
        <h1 className="text-2xl font-bold text-slate-950">Booking not found</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600">
          The booking may no longer exist, or it does not belong to your
          customer account.
        </p>
        <Link
          href="/dashboard/customer"
          className="mt-6 inline-flex rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          Return to bookings
        </Link>
      </section>
    );
  }

  const amount = booking.amount || booking.service.price;

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div>
            <Link
              href="/dashboard/customer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-emerald-700"
            >
              <span aria-hidden="true">←</span> Back to bookings
            </Link>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <BookingStatusBadge status={booking.status} />
              <span className="text-xs text-slate-400">
                Booking #{booking.id.slice(0, 8).toUpperCase()}
              </span>
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              {booking.service.name}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Track the service from request to completion and review all
              booking information in one place.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setRefreshKey((value) => value + 1);
              }}
              className="rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
            >
              Refresh
            </button>
            {booking.status === "ACCEPTED" ? (
              <Link
                href={`/dashboard/customer/bookings/${booking.id}/pay`}
                className="rounded-xl bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Pay now
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <div className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Booking progress
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Current status and completed milestones.
                </p>
              </div>
              <BookingStatusBadge status={booking.status} />
            </div>
            <div className="pt-5">
              <Timeline steps={timeline} />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="text-lg font-bold text-slate-950">Service details</h2>
            <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <dt className="text-slate-500">Scheduled time</dt>
                <dd className="mt-1 font-semibold text-slate-900">
                  {formatDateTime(booking.availabilitySlot.startTime)}
                </dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <dt className="text-slate-500">Duration</dt>
                <dd className="mt-1 font-semibold text-slate-900">
                  {booking.service.durationMinutes} minutes
                </dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 sm:col-span-2">
                <dt className="text-slate-500">Service address</dt>
                <dd className="mt-1 font-semibold text-slate-900">
                  {booking.address}
                </dd>
              </div>
              {booking.notes ? (
                <div className="rounded-xl bg-slate-50 p-4 sm:col-span-2">
                  <dt className="text-slate-500">Instructions</dt>
                  <dd className="mt-1 whitespace-pre-wrap font-medium leading-6 text-slate-800">
                    {booking.notes}
                  </dd>
                </div>
              ) : null}
            </dl>
          </section>

          {booking.review ? (
            <section className="rounded-2xl border border-amber-100 bg-amber-50/60 p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-slate-950">Your review</h2>
                <span
                  className="text-lg tracking-wide text-amber-500"
                  aria-label={`${booking.review.rating} out of 5 stars`}
                >
                  {"★".repeat(booking.review.rating)}
                  <span className="text-slate-300">
                    {"★".repeat(5 - booking.review.rating)}
                  </span>
                </span>
              </div>
              {booking.review.comment ? (
                <p className="mt-3 text-sm leading-6 text-slate-700">
                  {booking.review.comment}
                </p>
              ) : (
                <p className="mt-3 text-sm text-slate-500">
                  You submitted a rating without a written comment.
                </p>
              )}
            </section>
          ) : null}
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Total amount</p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
              {formatMoney(amount)}
            </p>
            <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">Payment</span>
                <span className="font-semibold text-slate-900">
                  {payment?.status ??
                    (booking.status === "ACCEPTED" ? "AWAITING" : "NOT DUE")}
                </span>
              </div>
              {payment?.transactionId ? (
                <p className="mt-2 break-all text-xs text-slate-500">
                  Transaction: {payment.transactionId}
                </p>
              ) : null}
            </div>
            {booking.status === "ACCEPTED" ? (
              <Link
                href={`/dashboard/customer/bookings/${booking.id}/pay`}
                className="mt-4 flex w-full justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Continue to payment
              </Link>
            ) : null}
            {payment ? (
              <Link
                href="/dashboard/customer/payments"
                className="mt-2 flex w-full justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
              >
                View payment history
              </Link>
            ) : null}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <UserAvatar
                name={booking.technician.user.name}
                src={booking.technician.user.avatarUrl}
                size={48}
                className="rounded-xl"
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                  Technician
                </p>
                <p className="mt-1 truncate font-bold text-slate-950">
                  {booking.technician.user.name}
                </p>
                {booking.technician.location ? (
                  <p className="mt-0.5 truncate text-sm text-slate-500">
                    {booking.technician.location}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="mt-4 grid gap-2">
              <Link
                href={`/technicians/${booking.technician.id}`}
                className="flex justify-center rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
              >
                View public profile
              </Link>
              {booking.technician.user.phone ? (
                <a
                  href={`tel:${booking.technician.user.phone}`}
                  className="flex justify-center rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
                >
                  Call technician
                </a>
              ) : null}
              {booking.technician.user.email ? (
                <a
                  href={`mailto:${booking.technician.user.email}`}
                  className="flex justify-center rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
                >
                  Send email
                </a>
              ) : null}
            </div>
          </section>

          {(canCancel || (booking.status === "COMPLETED" && !booking.review)) ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="font-bold text-slate-950">Booking actions</h2>
              <div className="mt-4 grid gap-2">
                {booking.status === "COMPLETED" && !booking.review ? (
                  <button
                    type="button"
                    onClick={() => setReviewOpen(true)}
                    className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                  >
                    Leave a review
                  </button>
                ) : null}
                {canCancel ? (
                  <button
                    type="button"
                    onClick={() => setCancelDialogOpen(true)}
                    className="rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                  >
                    Cancel booking
                  </button>
                ) : null}
              </div>
            </section>
          ) : null}
        </aside>
      </div>

      {reviewOpen ? (
        <ReviewDialog
          booking={booking}
          submitting={submittingReview}
          onClose={() => {
            if (!submittingReview) setReviewOpen(false);
          }}
          onSubmit={(rating, comment) => void submitReview(rating, comment)}
        />
      ) : null}

      {cancelDialogOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="booking-detail-cancel-title"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target && !cancelling) {
              setCancelDialogOpen(false);
            }
          }}
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl sm:p-6">
            <h2
              id="booking-detail-cancel-title"
              className="text-xl font-bold text-slate-950"
            >
              Cancel booking
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              The selected time slot will become available to other customers.
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
                disabled={cancelling}
                className="mt-2 w-full resize-none rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-100"
              />
            </label>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setCancelDialogOpen(false)}
                disabled={cancelling}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                Keep booking
              </button>
              <button
                type="button"
                onClick={() => void cancelBooking()}
                disabled={cancelling}
                className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
              >
                {cancelling ? "Cancelling…" : "Confirm cancellation"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
