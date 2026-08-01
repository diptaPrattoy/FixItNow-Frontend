"use client";

import { useEffect, useMemo, useState } from "react";

import { DiscoverySkeleton } from "@/components/public/discovery-skeleton";
import { EmptyState } from "@/components/public/empty-state";
import { Pagination } from "@/components/public/pagination";
import { TechnicianCard } from "@/components/public/technician-card";
import { useToast } from "@/components/providers/toast-provider";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { apiRequest } from "@/lib/api/client";
import { getApiErrorMessage } from "@/lib/api/errors";
import type { PaginationMeta, TechnicianListItem } from "@/types/api";

type Filters = {
  search: string;
  location: string;
  minRating: string;
  sortBy: string;
};

const initialFilters: Filters = {
  search: "",
  location: "",
  minRating: "",
  sortBy: "rating_desc",
};

const defaultMeta: PaginationMeta = {
  page: 1,
  limit: 8,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

export function TechniciansBrowser() {
  const { toast } = useToast();
  const [technicians, setTechnicians] = useState<TechnicianListItem[]>([]);
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(defaultMeta);
  const [loading, setLoading] = useState(true);

  const search = useDebouncedValue(filters.search);
  const location = useDebouncedValue(filters.location);

  const queryString = useMemo(() => {
    const params = new URLSearchParams({
      page: String(page),
      limit: "8",
      sortBy: filters.sortBy,
    });

    if (search.trim()) params.set("search", search.trim());
    if (location.trim()) params.set("location", location.trim());
    if (filters.minRating) params.set("minRating", filters.minRating);

    return params.toString();
  }, [filters.minRating, filters.sortBy, location, page, search]);

  useEffect(() => {
    let cancelled = false;

    async function loadTechnicians() {
      try {
        const response = await apiRequest<TechnicianListItem[]>(
          `/api/technicians?${queryString}`,
        );

        if (!cancelled) {
          setTechnicians(response.data);
          setMeta(response.meta ?? defaultMeta);
        }
      } catch (error) {
        if (!cancelled) {
          setTechnicians([]);
          setMeta(defaultMeta);
          toast(getApiErrorMessage(error), "error");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadTechnicians();

    return () => {
      cancelled = true;
    };
  }, [queryString, toast]);

  function updateFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setLoading(true);
    setPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function clearFilters() {
    setLoading(true);
    setPage(1);
    setFilters(initialFilters);
  }

  function changePage(nextPage: number) {
    setLoading(true);
    setPage(nextPage);
  }

  const hasFilters = Boolean(
    filters.search || filters.location || filters.minRating || filters.sortBy !== "rating_desc",
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-700">Local professionals</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Browse technicians near you
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Compare experience, ratings and active services before choosing a time slot.
          </p>
        </div>
        <p className="text-sm text-slate-500">{loading ? "Loading…" : `${meta.total} technicians found`}</p>
      </div>

      <div className="mt-8 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-[1fr_1fr_180px_190px_auto]">
        <label>
          <span className="sr-only">Search technicians</span>
          <input
            value={filters.search}
            onChange={(event) => updateFilter("search", event.target.value)}
            placeholder="Search name or service"
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          />
        </label>
        <label>
          <span className="sr-only">Location</span>
          <input
            value={filters.location}
            onChange={(event) => updateFilter("location", event.target.value)}
            placeholder="Location"
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          />
        </label>
        <select
          value={filters.minRating}
          onChange={(event) => updateFilter("minRating", event.target.value)}
          aria-label="Minimum rating"
          className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500"
        >
          <option value="">Any rating</option>
          <option value="4">4.0+</option>
          <option value="3">3.0+</option>
        </select>
        <select
          value={filters.sortBy}
          onChange={(event) => updateFilter("sortBy", event.target.value)}
          aria-label="Sort technicians"
          className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500"
        >
          <option value="rating_desc">Highest rated</option>
          <option value="experience_desc">Most experienced</option>
          <option value="newest">Newest</option>
        </select>
        <button
          type="button"
          onClick={clearFilters}
          disabled={!hasFilters}
          className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Clear
        </button>
      </div>

      <div className="mt-7">
        {loading ? <DiscoverySkeleton count={4} /> : null}

        {!loading && technicians.length > 0 ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {technicians.map((technician) => (
              <TechnicianCard key={technician.id} technician={technician} />
            ))}
          </div>
        ) : null}

        {!loading && technicians.length === 0 ? (
          <EmptyState
            title="No matching technicians"
            description="Try a different name, service, location or rating filter."
            actionLabel={hasFilters ? "Clear filters" : undefined}
            onAction={hasFilters ? clearFilters : undefined}
          />
        ) : null}

        {!loading ? <Pagination meta={meta} onPageChange={changePage} /> : null}
      </div>
    </div>
  );
}
