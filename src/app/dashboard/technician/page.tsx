import type { Metadata } from "next";

import { DashboardOverview } from "@/components/dashboard/dashboard-overview";

export const metadata: Metadata = {
  title: "Technician Dashboard",
};

export default function TechnicianDashboardPage() {
  return <DashboardOverview role="TECHNICIAN" />;
}
