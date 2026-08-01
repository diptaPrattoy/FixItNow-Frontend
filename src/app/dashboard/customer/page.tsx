import type { Metadata } from "next";

import { CustomerDashboard } from "@/components/customer/customer-dashboard";

export const metadata: Metadata = {
  title: "Customer Dashboard",
};

export default function CustomerDashboardPage() {
  return <CustomerDashboard />;
}
