"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { BookingPanel } from "@/components/customer/booking-panel";
import { Rating } from "@/components/public/rating";
import { useToast } from "@/components/providers/toast-provider";
import { apiRequest } from "@/lib/api/client";
import { getApiErrorMessage } from "@/lib/api/errors";
import type { TechnicianDetails } from "@/types/api";

function formatPrice(price: string) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(Number(price));
}

export default function TechnicianDetailsPage() {
  const params = useParams<{ id: string }>();

  return <TechnicianDetailsContent key={params.id} technicianId={params.id} />;
}

function TechnicianDetailsContent({ technicianId }: { technicianId: string }) {
  const { toast } = useToast();
  const [technician, setTechnician] = useState<TechnicianDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadTechnician() {
      try {
        const response = await apiRequest<TechnicianDetails>(
          `/api/technicians/${technicianId}`,
        );

        if (!cancelled) {
          setTechnician(response.data);
        }
      } catch (error) {
        if (!cancelled) {
          toast(getApiErrorMessage(error), "error");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadTechnician();

    return () => {
      cancelled = true;
    };
  }, [technicianId, toast]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="h-44 animate-pulse rounded-3xl bg-slate-200" />
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />
          <div className="h-80 animate-pulse rounded-2xl bg-slate-200" />
        </div>
      </div>
    );
  }

  if (!technician) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <h1 className="text-3xl font-bold text-slate-950">Technician not found</h1>
        <p className="mt-3 text-slate-600">The profile may be unavailable or the backend request failed.</p>
        <Link href="/technicians" className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white hover:bg-emerald-700">
          Browse technicians
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="relative size-24 shrink-0 overflow-hidden rounded-3xl bg-emerald-50">
            <Image src="/images/avatar-placeholder.svg" alt={technician.user.name} fill className="object-cover" sizes="96px" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-slate-950">{technician.user.name}</h1>
              {technician.isVerified ? (
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Verified technician</span>
              ) : null}
            </div>
            <p className="mt-2 text-slate-500">{technician.location} · {technician.experienceYears} years experience</p>
            <div className="mt-3"><Rating value={Number(technician.averageRating || 0)} count={technician.reviewCount} /></div>
          </div>
        </div>
        <p className="mt-6 max-w-3xl leading-7 text-slate-600">
          {technician.bio ?? "This technician has not added a profile description yet."}
        </p>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-bold text-slate-950">Services</h2>
            <div className="mt-5 space-y-3">
              {technician.services.map((service) => (
                <article key={service.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">{service.category.name}</p>
                      <h3 className="mt-1 font-bold text-slate-950">{service.name}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{service.description ?? "No description provided."}</p>
                    </div>
                    <div className="shrink-0 sm:text-right">
                      <p className="font-bold text-slate-950">{formatPrice(service.price)}</p>
                      <p className="mt-1 text-xs text-slate-500">{service.durationMinutes} minutes</p>
                    </div>
                  </div>
                </article>
              ))}
              {technician.services.length === 0 ? <p className="text-sm text-slate-500">No active services are available.</p> : null}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-bold text-slate-950">Recent reviews</h2>
            <div className="mt-5 space-y-4">
              {technician.reviews.map((review) => (
                <article key={review.id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-800">{review.customer.name}</p>
                    <Rating value={review.rating} />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{review.comment ?? "No written comment."}</p>
                </article>
              ))}
              {technician.reviews.length === 0 ? <p className="text-sm text-slate-500">No reviews yet.</p> : null}
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
          <BookingPanel technician={technician} />
        </aside>
      </div>
    </div>
  );
}
