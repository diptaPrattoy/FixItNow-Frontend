import Image from "next/image";
import Link from "next/link";

import { Rating } from "@/components/public/rating";
import type { PublicService } from "@/types/api";

function formatPrice(price: string) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(Number(price));
}

export function ServiceCard({ service }: { service: PublicService }) {
  const rating = Number(service.technician.averageRating || 0);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg hover:shadow-slate-950/5">
      <div className="relative aspect-[16/8.5] overflow-hidden bg-emerald-50">
        <Image
          src="/images/service-tools.svg"
          alt="Home service tools"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm">
          {service.category.name}
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-950">
              {service.name}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {service.technician.user.name} · {service.technician.location}
            </p>
          </div>
          {service.technician.isVerified ? (
            <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              Verified
            </span>
          ) : null}
        </div>

        <p className="mt-4 line-clamp-2 min-h-12 text-sm leading-6 text-slate-600">
          {service.description ?? "Reliable home service from a local technician."}
        </p>

        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <div>
            <p className="text-xs text-slate-500">Starting at</p>
            <p className="font-bold text-slate-950">{formatPrice(service.price)}</p>
          </div>
          <div className="text-right">
            <Rating value={rating} count={service.technician.reviewCount} />
            <p className="mt-1 text-xs text-slate-500">{service.durationMinutes} minutes</p>
          </div>
        </div>

        <Link
          href={`/technicians/${service.technician.id}`}
          className="mt-5 block rounded-xl bg-slate-950 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          View technician
        </Link>
      </div>
    </article>
  );
}
