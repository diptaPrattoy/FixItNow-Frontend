import type { Metadata } from "next";

import { ServicesBrowser } from "@/components/public/services-browser";

export const metadata: Metadata = {
  title: "Browse Services",
  description: "Search and filter home services by category, location, rating and price.",
};

export default function ServicesPage() {
  return <ServicesBrowser />;
}
