import type { Metadata } from "next";

import { ServicesBrowser } from "@/components/public/services-browser";

export const metadata: Metadata = {
  title: "Browse Services",
  description: "Search and filter home services by category, location, rating and price.",
};

type ServicesPageProps = {
  searchParams: Promise<{
    search?: string | string[];
    location?: string | string[];
    category?: string | string[];
  }>;
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function ServicesPage({ searchParams }: ServicesPageProps) {
  const params = await searchParams;

  return (
    <ServicesBrowser
      initialSearch={firstValue(params.search)}
      initialLocation={firstValue(params.location)}
      initialCategory={firstValue(params.category)}
    />
  );
}
