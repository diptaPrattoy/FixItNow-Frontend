import Link from "next/link";

import type { UserRole } from "@/types/api";

type DashboardOverviewProps = {
  role: UserRole;
};

const content: Record<
  UserRole,
  {
    eyebrow: string;
    title: string;
    description: string;
    actions: Array<{ href: string; label: string; detail: string }>;
  }
> = {
  CUSTOMER: {
    eyebrow: "Customer dashboard",
    title: "Find help without the usual back-and-forth.",
    description:
      "Browse trusted professionals now. Your bookings, payments and reviews will stay organized in this workspace.",
    actions: [
      {
        href: "/services",
        label: "Browse services",
        detail: "Compare prices, locations and ratings.",
      },
      {
        href: "/technicians",
        label: "Find technicians",
        detail: "Review profiles and available services.",
      },
    ],
  },
  TECHNICIAN: {
    eyebrow: "Technician dashboard",
    title: "Keep your workday clear and manageable.",
    description:
      "Your profile, service catalogue, availability and booking requests will be managed from this workspace.",
    actions: [
      {
        href: "/services",
        label: "Review marketplace",
        detail: "See how active services appear to customers.",
      },
      {
        href: "/technicians",
        label: "View technician listings",
        detail: "Compare public profiles and service presentation.",
      },
    ],
  },
  ADMIN: {
    eyebrow: "Admin dashboard",
    title: "A focused view of the whole platform.",
    description:
      "User moderation, booking oversight and category management will be available from this protected workspace.",
    actions: [
      {
        href: "/dashboard/admin/users",
        label: "Manage users",
        detail: "Search accounts and control platform access.",
      },
      {
        href: "/services",
        label: "Review marketplace",
        detail: "Check the customer-facing service catalogue.",
      },
    ],
  },
};

export function DashboardOverview({ role }: DashboardOverviewProps) {
  const dashboard = content[role];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
          {dashboard.eyebrow}
        </p>
        <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          {dashboard.title}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          {dashboard.description}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {dashboard.actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold text-slate-950 group-hover:text-emerald-800">
                  {action.label}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {action.detail}
                </p>
              </div>
              <span className="text-lg text-slate-400 transition group-hover:translate-x-1 group-hover:text-emerald-700">
                →
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5">
        <p className="text-sm font-semibold text-emerald-950">Protected workspace</p>
        <p className="mt-1 text-sm leading-6 text-emerald-900/75">
          Dashboard routes are restricted by the active session and account role. Backend authorization remains the source of truth for every protected API request.
        </p>
      </div>
    </div>
  );
}
