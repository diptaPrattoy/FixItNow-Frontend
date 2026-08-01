import type { BookingStatus } from "@/types/api";

type BookingStatusBadgeProps = {
  status: BookingStatus;
};

const statusStyles: Record<BookingStatus, string> = {
  REQUESTED: "border-amber-200 bg-amber-50 text-amber-800",
  ACCEPTED: "border-sky-200 bg-sky-50 text-sky-800",
  DECLINED: "border-rose-200 bg-rose-50 text-rose-800",
  CANCELLED: "border-red-200 bg-red-50 text-red-800",
  PAID: "border-violet-200 bg-violet-50 text-violet-800",
  IN_PROGRESS: "border-emerald-200 bg-emerald-50 text-emerald-800",
  COMPLETED: "border-slate-200 bg-slate-100 text-slate-700",
};

function formatStatus(status: BookingStatus) {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[status]}`}
    >
      {formatStatus(status)}
    </span>
  );
}
