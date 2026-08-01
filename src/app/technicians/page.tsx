import type { Metadata } from "next";

import { TechniciansBrowser } from "@/components/public/technicians-browser";

export const metadata: Metadata = {
  title: "Browse Technicians",
  description: "Compare local technicians by experience, rating and services.",
};

export default function TechniciansPage() {
  return <TechniciansBrowser />;
}
