import Image from "next/image";
import Link from "next/link";

import { Rating } from "@/components/public/rating";
import type { TechnicianListItem } from "@/types/api";

function formatPrice(price: string) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(Number(price));
}

export function TechnicianCard({ technician }: { technician: TechnicianListItem }) {
  const lowestPrice = technician.services.reduce<number | null>((lowest, service) => {
    const price = Number(service.price);
    return lowest === null || price < lowest ? price : lowest;
  }, null);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-lg hover:shadow-slate-950/5">
      <div className="flex items-start gap-4">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl bg-emerald-50">
          <Image
            src="/images/avatar-placeholder.svg"
            alt={technician.user.name}
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="truncate text-lg font-bold text-slate-950">
                {technician.user.name}
              </h2>
              <p className="mt-1 text-sm text-slate-500">{technician.location}</p>
            </div>
            {technician.isVerified ? (
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                Verified
              </span>
            ) : null}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
            <Rating value={Number(technician.averageRating || 0)} count={technician.reviewCount} />
            <span className="text-sm text-slate-500">{technician.experienceYears} years experience</span>
          </div>
        </div>
      </div>

      <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">
        {technician.bio ?? "Local technician available for trusted home services."}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {technician.services.slice(0, 3).map((service) => (
          <span key={service.id} className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600">
            {service.category.name}
          </span>
        ))}
        {technician.services.length === 0 ? (
          <span className="text-sm text-slate-500">No active services listed</span>
        ) : null}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <div>
          <p className="text-xs text-slate-500">Services from</p>
          <p className="font-bold text-slate-950">
            {lowestPrice === null ? "Not listed" : formatPrice(String(lowestPrice))}
          </p>
        </div>
        <Link
          href={`/technicians/${technician.id}`}
          className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          View profile
        </Link>
      </div>
    </article>
  );
}
