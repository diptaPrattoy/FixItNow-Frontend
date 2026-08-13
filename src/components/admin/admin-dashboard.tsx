"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { BookingStatusBadge } from "@/components/customer/booking-status-badge";
import { useToast } from "@/components/providers/toast-provider";
import { useAuthSession } from "@/hooks/use-auth-session";
import { apiRequest } from "@/lib/api/client";
import { getApiErrorMessage } from "@/lib/api/errors";
import type { AdminBooking, AdminUser, PaginationMeta } from "@/types/api";

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-BD", { dateStyle: "medium" }).format(
    new Date(value),
  );
}

export function AdminDashboard() {
  const { toast } = useToast();
  const { session, isReady } = useAuthSession();
  const [usersTotal, setUsersTotal] = useState(0);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [bookingMeta, setBookingMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isReady || !session || session.user.role !== "ADMIN") return;
    const token = session.token;
    let cancelled = false;

    async function loadOverview() {
      try {
        const [usersResponse, bookingsResponse] = await Promise.all([
          apiRequest<AdminUser[]>("/api/admin/users?page=1&limit=1", { token }),
          apiRequest<AdminBooking[]>("/api/admin/bookings?page=1&limit=50", {
            token,
          }),
        ]);
        const totalPages = bookingsResponse.meta?.totalPages ?? 1;
        const remainingPages =
          totalPages > 1
            ? await Promise.all(
                Array.from({ length: totalPages - 1 }, (_, index) =>
                  apiRequest<AdminBooking[]>(
                    `/api/admin/bookings?page=${index + 2}&limit=50`,
                    { token },
                  ),
                ),
              )
            : [];
        const allBookings = [
          ...bookingsResponse.data,
          ...remainingPages.flatMap((response) => response.data),
        ];

        if (!cancelled) {
          setUsersTotal(usersResponse.meta?.total ?? usersResponse.data.length);
          setBookings(allBookings);
          setBookingMeta(bookingsResponse.meta ?? null);
        }
      } catch (error) {
        if (!cancelled) toast(getApiErrorMessage(error), "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadOverview();
    return () => {
      cancelled = true;
    };
  }, [isReady, session, toast]);

  const stats = useMemo(() => {
    const active = bookings.filter((booking) =>
      ["REQUESTED", "ACCEPTED", "PAID", "IN_PROGRESS"].includes(booking.status),
    ).length;
    const completed = bookings.filter(
      (booking) => booking.status === "COMPLETED",
    ).length;
    const revenue = bookings
      .filter((booking) =>
        booking.payments.some((payment) => payment.status === "COMPLETED"),
      )
      .reduce((sum, booking) => sum + Number(booking.amount), 0);
    return { active, completed, revenue };
  }, [bookings]);

  const cards = [
    { label: "Total users", value: usersTotal.toLocaleString("en-BD") },
    { label: "Active bookings", value: stats.active.toLocaleString("en-BD") },
    { label: "Completed jobs", value: stats.completed.toLocaleString("en-BD") },
    { label: "Recorded revenue", value: formatMoney(stats.revenue) },
  ];

  return (
    <div className="space-y-6">
      <section className="dashboard-tint-card rounded-[28px] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
          Admin overview
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          Platform activity at a glance
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Monitor account growth, current work, completed jobs and verified
          payment activity from live backend data.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card, index) => {
          const className =
            index === 0
              ? "dashboard-tint-card"
              : index === 1
                ? "dashboard-soft-accent"
                : index === 2
                  ? "dashboard-warm-card"
                  : "dashboard-surface";

          return (
            <div key={card.label} className={`${className} rounded-2xl p-5`}>
              <p className="text-sm text-slate-500">{card.label}</p>
              <p className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
                {loading ? "—" : card.value}
              </p>
            </div>
          );
        })}
      </section>
      {/*
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Link
          href="/dashboard/admin/users"
          className="dashboard-surface rounded-2xl p-5 transition hover:border-emerald-200 hover:shadow-sm"
        >
          <p className="font-semibold text-slate-950">Manage users</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Search accounts and control customer or technician access.
          </p>
        </Link>

        <Link
          href="/dashboard/admin/bookings"
          className="dashboard-surface rounded-2xl p-5 transition hover:border-emerald-200 hover:shadow-sm"
        >
          <p className="font-semibold text-slate-950">Review bookings</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Inspect every request, payment state and service outcome.
          </p>
        </Link>

        <Link
          href="/dashboard/admin/categories"
          className="dashboard-surface rounded-2xl p-5 transition hover:border-emerald-200 hover:shadow-sm"
        >
          <p className="font-semibold text-slate-950">Manage categories</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Create service groups and control which categories stay active.
          </p>
        </Link>

        <Link
          href="/dashboard/admin/admins"
          className="dashboard-surface rounded-2xl p-5 transition hover:border-emerald-200 hover:shadow-sm"
        >
          <p className="font-semibold text-slate-950">Manage admins</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Create and manage administrator accounts for the platform.
          </p>
        </Link>
      </section> */}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Manage Users */}
        <Link
          href="/dashboard/admin/users"
          className="group flex min-h-[180px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-md"
        >
          <div>
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm7-3a4 4 0 110 8m4 5v-2a4 4 0 00-3-3.87"
                />
              </svg>
            </div>

            <h3 className="font-semibold text-slate-950">Manage users</h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Search accounts and control customer or technician access.
            </p>
          </div>

          <div className="mt-5 flex items-center justify-between text-sm font-semibold text-emerald-600">
            <span>Open management</span>
            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </div>
        </Link>

        {/* Review Bookings */}
        <Link
          href="/dashboard/admin/bookings"
          className="group flex min-h-[180px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-md"
        >
          <div>
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>

            <h3 className="font-semibold text-slate-950">Review bookings</h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Inspect every request, payment state and service outcome.
            </p>
          </div>

          <div className="mt-5 flex items-center justify-between text-sm font-semibold text-emerald-600">
            <span>View bookings</span>
            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </div>
        </Link>

        {/* Manage Categories */}
        <Link
          href="/dashboard/admin/categories"
          className="group flex min-h-[180px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-md"
        >
          <div>
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 transition-colors group-hover:bg-purple-600 group-hover:text-white">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </div>

            <h3 className="font-semibold text-slate-950">Manage categories</h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Create service groups and control which categories stay active.
            </p>
          </div>

          <div className="mt-5 flex items-center justify-between text-sm font-semibold text-emerald-600">
            <span>Manage categories</span>
            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </div>
        </Link>

        {/* Manage Admins */}
        <Link
          href="/dashboard/admin/admins"
          className="group flex min-h-[180px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-md"
        >
          <div>
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600 transition-colors group-hover:bg-orange-600 group-hover:text-white">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15a3 3 0 100-6 3 3 0 000 6zm7.4-3a7.4 7.4 0 01-.1 1.2l2 1.5-2 3.4-2.3-.9a7.4 7.4 0 01-2.1 1.2L12.6 21h-4l-.3-2.6a7.4 7.4 0 01-2.1-1.2l-2.3.9-2-3.4 2-1.5A7.4 7.4 0 014 12c0-.4 0-.8.1-1.2l-2-1.5 2-3.4 2.3.9a7.4 7.4 0 012.1-1.2L8.6 3h4l.3 2.6a7.4 7.4 0 012.1 1.2l2.3-.9 2 3.4-2 1.5c.1.4.1.8.1 1.2z"
                />
              </svg>
            </div>

            <h3 className="font-semibold text-slate-950">Manage admins</h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Create and manage administrator accounts for the platform.
            </p>
          </div>

          <div className="mt-5 flex items-center justify-between text-sm font-semibold text-emerald-600">
            <span>Manage administrators</span>
            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </div>
        </Link>
      </section>

      <section className="dashboard-surface rounded-2xl p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              Recent bookings
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Showing the latest activity from {bookingMeta?.total ?? 0} total
              bookings.
            </p>
          </div>
          <Link
            href="/dashboard/admin/bookings"
            className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          >
            View all
          </Link>
        </div>
        <div className="mt-5 space-y-3">
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-20 animate-pulse rounded-xl bg-slate-100"
                />
              ))
            : bookings.slice(0, 5).map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-col gap-3 rounded-xl border border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      {booking.service.name}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {booking.customer.name} · {formatDate(booking.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-slate-700">
                      {formatMoney(Number(booking.amount))}
                    </span>
                    <BookingStatusBadge status={booking.status} />
                  </div>
                </div>
              ))}
          {!loading && bookings.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              No booking activity yet.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
