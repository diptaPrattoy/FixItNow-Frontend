"use client";

import { useEffect, useMemo, useState } from "react";

import { DiscoverySkeleton } from "@/components/public/discovery-skeleton";
import { EmptyState } from "@/components/public/empty-state";
import { Pagination } from "@/components/public/pagination";
import { ServiceCard } from "@/components/public/service-card";
import { useToast } from "@/components/providers/toast-provider";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { apiRequest } from "@/lib/api/client";
import { getApiErrorMessage } from "@/lib/api/errors";
import type { Category, PaginationMeta, PublicService } from "@/types/api";

type FilterState = {
  search: string;
  category: string;
  location: string;
  minPrice: string;
  maxPrice: string;
  minRating: string;
  sortBy: string;
};

const initialFilters: FilterState = {
  search: "",
  category: "",
  location: "",
  minPrice: "",
  maxPrice: "",
  minRating: "",
  sortBy: "newest",
};

const defaultMeta: PaginationMeta = {
  page: 1,
  limit: 9,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

export function ServicesBrowser() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<PublicService[]>([]);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta>(defaultMeta);
  const [loading, setLoading] = useState(true);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  const debouncedSearch = useDebouncedValue(filters.search);
  const debouncedLocation = useDebouncedValue(filters.location);

  useEffect(() => {
    apiRequest<Category[]>("/api/categories")
      .then((response) => setCategories(response.data))
      .catch((error) => toast(getApiErrorMessage(error), "error"));
  }, [toast]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams({
      page: String(page),
      limit: "9",
      sortBy: filters.sortBy,
    });

    const values = {
      search: debouncedSearch,
      category: filters.category,
      location: debouncedLocation,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      minRating: filters.minRating,
    };

    Object.entries(values).forEach(([key, value]) => {
      if (value.trim()) {
        params.set(key, value.trim());
      }
    });

    return params.toString();
  }, [debouncedLocation, debouncedSearch, filters.category, filters.maxPrice, filters.minPrice, filters.minRating, filters.sortBy, page]);

  useEffect(() => {
    let cancelled = false;

    async function loadServices() {
      try {
        const response = await apiRequest<PublicService[]>(
          `/api/services?${queryString}`,
        );

        if (!cancelled) {
          setServices(response.data);
          setMeta(response.meta ?? defaultMeta);
        }
      } catch (error) {
        if (!cancelled) {
          setServices([]);
          setMeta(defaultMeta);
          toast(getApiErrorMessage(error), "error");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadServices();

    return () => {
      cancelled = true;
    };
  }, [queryString, toast]);

  function updateFilter<K extends keyof FilterState>(key: K, value: FilterState[K]) {
    setLoading(true);
    setPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function clearFilters() {
    setLoading(true);
    setFilters(initialFilters);
    setPage(1);
    setFilterPanelOpen(false);
  }

  function changePage(nextPage: number) {
    setLoading(true);
    setPage(nextPage);
  }

  const hasFilters = Object.entries(filters).some(([key, value]) => {
    if (key === "sortBy") {
      return value !== "newest";
    }
    return Boolean(value);
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-700">Service marketplace</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          Find the right service for your home
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          Search active services, compare prices and open a technician profile to see available time slots.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:hidden">
        <button
          type="button"
          onClick={() => setFilterPanelOpen((open) => !open)}
          className="flex w-full items-center justify-between font-semibold text-slate-800"
          aria-expanded={filterPanelOpen}
        >
          Filters and sorting
          <span aria-hidden="true">{filterPanelOpen ? "−" : "+"}</span>
        </button>
      </div>

      <div className="mt-5 grid gap-7 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className={`${filterPanelOpen ? "block" : "hidden"} h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:block lg:sticky lg:top-24`}>
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-950">Filters</h2>
            {hasFilters ? (
              <button type="button" onClick={clearFilters} className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">
                Clear
              </button>
            ) : null}
          </div>

          <div className="mt-5 space-y-5">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Search</span>
              <input
                value={filters.search}
                onChange={(event) => updateFilter("search", event.target.value)}
                placeholder="Service or technician"
                className="mt-2 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Category</span>
              <select
                value={filters.category}
                onChange={(event) => updateFilter("category", event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              >
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>{category.name}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Location</span>
              <input
                value={filters.location}
                onChange={(event) => updateFilter("location", event.target.value)}
                placeholder="e.g. Dhaka"
                className="mt-2 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
            </label>

            <div>
              <span className="text-sm font-semibold text-slate-700">Price range</span>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min="0"
                  value={filters.minPrice}
                  onChange={(event) => updateFilter("minPrice", event.target.value)}
                  placeholder="Min"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
                <input
                  type="number"
                  min="0"
                  value={filters.maxPrice}
                  onChange={(event) => updateFilter("maxPrice", event.target.value)}
                  placeholder="Max"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>
            </div>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Minimum rating</span>
              <select
                value={filters.minRating}
                onChange={(event) => updateFilter("minRating", event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              >
                <option value="">Any rating</option>
                <option value="4">4.0 and above</option>
                <option value="3">3.0 and above</option>
                <option value="2">2.0 and above</option>
              </select>
            </label>
          </div>
        </aside>

        <section>
          <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">
              {loading ? "Loading services…" : `${meta.total} service${meta.total === 1 ? "" : "s"} found`}
            </p>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              Sort
              <select
                value={filters.sortBy}
                onChange={(event) => updateFilter("sortBy", event.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-normal outline-none focus:border-emerald-500"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: low to high</option>
                <option value="price_desc">Price: high to low</option>
                <option value="rating_desc">Highest rated</option>
              </select>
            </label>
          </div>

          {loading ? <DiscoverySkeleton /> : null}

          {!loading && services.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {services.map((service) => <ServiceCard key={service.id} service={service} />)}
            </div>
          ) : null}

          {!loading && services.length === 0 ? (
            <EmptyState
              title="No matching services"
              description="Try removing a filter or using a broader service or location search."
              actionLabel={hasFilters ? "Clear filters" : undefined}
              onAction={hasFilters ? clearFilters : undefined}
            />
          ) : null}

          {!loading ? <Pagination meta={meta} onPageChange={changePage} /> : null}
        </section>
      </div>
    </div>
  );
}
