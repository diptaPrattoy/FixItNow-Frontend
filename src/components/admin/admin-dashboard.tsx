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
  return new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 0 }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-BD", { dateStyle: "medium" }).format(new Date(value));
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
          apiRequest<AdminBooking[]>("/api/admin/bookings?page=1&limit=50", { token }),
        ]);
        const totalPages = bookingsResponse.meta?.totalPages ?? 1;
        const remainingPages = totalPages > 1
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
    return () => { cancelled = true; };
  }, [isReady, session, toast]);

  const stats = useMemo(() => {
    const active = bookings.filter((booking) => ["REQUESTED", "ACCEPTED", "PAID", "IN_PROGRESS"].includes(booking.status)).length;
    const completed = bookings.filter((booking) => booking.status === "COMPLETED").length;
    const revenue = bookings
      .filter((booking) => booking.payments.some((payment) => payment.status === "COMPLETED"))
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
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Admin overview</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Platform activity at a glance</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Monitor account growth, current work, completed jobs and verified payment activity from live backend data.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-3 text-2xl font-bold tracking-tight text-slate-950">{loading ? "—" : card.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Link href="/dashboard/admin/users" className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-emerald-200 hover:shadow-sm"><p className="font-semibold text-slate-950">Manage users</p><p className="mt-2 text-sm leading-6 text-slate-600">Search accounts and control customer or technician access.</p></Link>
        <Link href="/dashboard/admin/bookings" className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-emerald-200 hover:shadow-sm"><p className="font-semibold text-slate-950">Review bookings</p><p className="mt-2 text-sm leading-6 text-slate-600">Inspect every request, payment state and service outcome.</p></Link>
        <Link href="/dashboard/admin/categories" className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-emerald-200 hover:shadow-sm"><p className="font-semibold text-slate-950">Manage categories</p><p className="mt-2 text-sm leading-6 text-slate-600">Create service groups and control which categories stay active.</p></Link>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4"><div><h2 className="text-lg font-bold text-slate-950">Recent bookings</h2><p className="mt-1 text-sm text-slate-500">Showing the latest activity from {bookingMeta?.total ?? 0} total bookings.</p></div><Link href="/dashboard/admin/bookings" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">View all</Link></div>
        <div className="mt-5 space-y-3">
          {loading ? Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-20 animate-pulse rounded-xl bg-slate-100" />) : bookings.slice(0, 5).map((booking) => (
            <div key={booking.id} className="flex flex-col gap-3 rounded-xl border border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div><p className="font-semibold text-slate-900">{booking.service.name}</p><p className="mt-1 text-sm text-slate-500">{booking.customer.name} · {formatDate(booking.createdAt)}</p></div>
              <div className="flex items-center gap-3"><span className="text-sm font-semibold text-slate-700">{formatMoney(Number(booking.amount))}</span><BookingStatusBadge status={booking.status} /></div>
            </div>
          ))}
          {!loading && bookings.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">No booking activity yet.</p> : null}
        </div>
      </section>
    </div>
  );
}
