"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

import { BookingStatusBadge } from "@/components/customer/booking-status-badge";
import { useToast } from "@/components/providers/toast-provider";
import { useAuthSession } from "@/hooks/use-auth-session";
import { apiRequest } from "@/lib/api/client";
import { getApiErrorMessage, getApiFieldErrors } from "@/lib/api/errors";
import type { CustomerBooking, PaymentSession } from "@/types/api";

type PaymentCheckoutProps = {
  bookingId: string;
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

function CheckoutSkeleton() {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="h-96 animate-pulse rounded-2xl border border-slate-200 bg-white" />
      <div className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white" />
    </div>
  );
}

export function PaymentCheckout({ bookingId }: PaymentCheckoutProps) {
  const { session, isReady } = useAuthSession();
  const { toast } = useToast();
  const [booking, setBooking] = useState<CustomerBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isReady || !session || session.user.role !== "CUSTOMER") {
      return;
    }

    const token = session.token;
    let cancelled = false;

    async function loadBooking() {
      try {
        const response = await apiRequest<CustomerBooking>(
          `/api/bookings/${bookingId}`,
          { token },
        );

        if (!cancelled) {
          setBooking(response.data);
        }
      } catch (error) {
        if (!cancelled) {
          setBooking(null);
          toast(getApiErrorMessage(error), "error");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadBooking();

    return () => {
      cancelled = true;
    };
  }, [bookingId, isReady, session, toast]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session || !booking || booking.status !== "ACCEPTED") {
      return;
    }

    const form = new FormData(event.currentTarget);
    const city = String(form.get("city") ?? "").trim();
    const postcode = String(form.get("postcode") ?? "").trim();

    setFieldErrors({});

    if (!city || !postcode) {
      setFieldErrors({
        ...(city ? {} : { city: "City is required." }),
        ...(postcode ? {} : { postcode: "Postcode is required." }),
      });
      toast("Please complete the billing details.", "error");
      return;
    }

    setSubmitting(true);

    try {
      const response = await apiRequest<PaymentSession>(
        "/api/payments/create",
        {
          method: "POST",
          token: session.token,
          body: {
            bookingId: booking.id,
            city,
            postcode,
          },
          timeout: 25000,
        },
      );

      const gatewayPageUrl = response.data.gatewayPageUrl;

      if (!gatewayPageUrl) {
        toast("SSLCommerz did not return a checkout URL.", "error");
        setSubmitting(false);
        return;
      }

      toast("Redirecting to SSLCommerz securely…", "success");
      window.location.assign(gatewayPageUrl);
    } catch (error) {
      setFieldErrors(getApiFieldErrors(error));
      toast(getApiErrorMessage(error), "error");
      setSubmitting(false);
    }
  }

  if (loading || !isReady) {
    return <CheckoutSkeleton />;
  }

  if (!booking) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
        <h1 className="text-2xl font-bold text-slate-950">Booking not found</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600">
          The booking may have been removed, or it may not belong to your
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
  const canPay = booking.status === "ACCEPTED";

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
          Secure payment
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          Complete your booking payment
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
          Review the accepted booking, add billing details and continue to the
          hosted SSLCommerz checkout page.
        </p>
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
            <div>
              <p className="text-sm text-slate-500">Booking</p>
              <h2 className="mt-1 text-xl font-bold text-slate-950">
                {booking.service.name}
              </h2>
            </div>
            <BookingStatusBadge status={booking.status} />
          </div>

          <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4">
              <dt className="text-slate-500">Technician</dt>
              <dd className="mt-1 font-semibold text-slate-900">
                {booking.technician.user.name}
              </dd>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <dt className="text-slate-500">Scheduled time</dt>
              <dd className="mt-1 font-semibold text-slate-900">
                {formatDateTime(booking.availabilitySlot.startTime)}
              </dd>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 sm:col-span-2">
              <dt className="text-slate-500">Service address</dt>
              <dd className="mt-1 font-semibold text-slate-900">
                {booking.address}
              </dd>
            </div>
          </dl>

          {!canPay ? (
            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
              This booking cannot be paid right now. Payment is available only
              after the technician accepts the request.
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <div>
              <label
                htmlFor="city"
                className="text-sm font-semibold text-slate-700"
              >
                Billing city
              </label>
              <input
                id="city"
                name="city"
                defaultValue="Dhaka"
                disabled={!canPay || submitting}
                className="mt-2 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-100"
              />
              {fieldErrors.city ? (
                <p className="mt-1.5 text-sm text-rose-600">{fieldErrors.city}</p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="postcode"
                className="text-sm font-semibold text-slate-700"
              >
                Postcode
              </label>
              <input
                id="postcode"
                name="postcode"
                inputMode="numeric"
                placeholder="1216"
                disabled={!canPay || submitting}
                className="mt-2 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-100"
              />
              {fieldErrors.postcode ? (
                <p className="mt-1.5 text-sm text-rose-600">
                  {fieldErrors.postcode}
                </p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={!canPay || submitting}
              className="w-full rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-55"
            >
              {submitting
                ? "Opening SSLCommerz…"
                : `Pay ${formatMoney(amount)}`}
            </button>
          </form>
        </section>

        <aside className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-bold text-slate-950">Payment summary</h2>
          <div className="mt-5 space-y-3 border-b border-slate-100 pb-5 text-sm">
            <div className="flex justify-between gap-4 text-slate-600">
              <span>Service charge</span>
              <span className="font-medium text-slate-900">
                {formatMoney(amount)}
              </span>
            </div>
            <div className="flex justify-between gap-4 text-slate-600">
              <span>Gateway</span>
              <span className="font-medium text-slate-900">SSLCommerz</span>
            </div>
          </div>
          <div className="mt-5 flex items-end justify-between gap-4">
            <span className="font-semibold text-slate-700">Total</span>
            <span className="text-2xl font-bold tracking-tight text-slate-950">
              {formatMoney(amount)}
            </span>
          </div>
          <p className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-xs leading-5 text-emerald-900">
            Card and supported mobile payment details are entered only on the
            SSLCommerz-hosted checkout page. FixItNow does not collect them.
          </p>
          <Link
            href="/dashboard/customer"
            className="mt-4 block text-center text-sm font-semibold text-slate-600 hover:text-slate-950"
          >
            Back to bookings
          </Link>
        </aside>
      </div>
    </div>
  );
}
