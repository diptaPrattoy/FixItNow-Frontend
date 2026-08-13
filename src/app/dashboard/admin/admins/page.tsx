import type { Metadata } from "next";

import { AdminManagement } from "@/components/admin/admin-management";

export const metadata: Metadata = {
  title: "Manage Administrators",
};

export default function AdminManagementPage() {
  return <AdminManagement />;
}