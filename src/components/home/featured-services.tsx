"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { DiscoverySkeleton } from "@/components/public/discovery-skeleton";
import { ServiceCard } from "@/components/public/service-card";
import { useToast } from "@/components/providers/toast-provider";
import { apiRequest } from "@/lib/api/client";
import { getApiErrorMessage } from "@/lib/api/errors";
import type { PublicService } from "@/types/api";

export function FeaturedServices() {
  const { toast } = useToast();
  const [services, setServices] = useState<PublicService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadFeaturedServices() {
      try {
        const response = await apiRequest<PublicService[]>(
          "/api/services?page=1&limit=3&sortBy=newest",
        );

        if (!cancelled) {
          setServices(response.data.slice(0, 3));
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

    void loadFeaturedServices();

    return () => {
      cancelled = true;
    };
  }, [toast]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Available now
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Services people are booking
          </h2>
          <p className="mt-4 leading-7 text-slate-600">
            Compare current prices, ratings and technician availability before you book.
          </p>
        </div>
        <Link
          href="/services"
          className="inline-flex items-center gap-2 font-semibold text-emerald-700 transition hover:text-emerald-800"
        >
          Browse all services
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      <div className="mt-8">
        {loading ? <DiscoverySkeleton count={3} /> : null}

        {!loading && services.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : null}

        {!loading && services.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <h3 className="font-bold text-slate-900">No services are available yet</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Technicians can add services from their dashboard after registration.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
