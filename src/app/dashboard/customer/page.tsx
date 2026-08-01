import type { Metadata } from "next";

import { DashboardOverview } from "@/components/dashboard/dashboard-overview";

export const metadata: Metadata = {
  title: "Customer Dashboard",
};

export default function CustomerDashboardPage() {
  return <DashboardOverview role="CUSTOMER" />;
}
