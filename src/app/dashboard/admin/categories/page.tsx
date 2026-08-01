import type { Metadata } from "next";

import { AdminCategories } from "@/components/admin/admin-categories";

export const metadata: Metadata = {
  title: "Category Management",
};

export default function AdminCategoriesPage() {
  return <AdminCategories />;
}
