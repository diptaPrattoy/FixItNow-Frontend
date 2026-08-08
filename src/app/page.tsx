import Image from "next/image";
import Link from "next/link";

import { FeaturedServices } from "@/components/home/featured-services";
import { ServiceSearch } from "@/components/home/service-search";
import ContactPage from "./contact/page";

const categories = [
  {
    name: "Plumbing",
    detail: "Leaks, fittings and pipe repair",
    href: "/services?category=plumbing",
    icon: "plumbing",
  },
  {
    name: "Electrical",
    detail: "Wiring, switches and installations",
    href: "/services?category=electrical",
    icon: "electrical",
  },
  {
    name: "Cleaning",
    detail: "Routine and deep home cleaning",
    href: "/services?category=cleaning",
    icon: "cleaning",
  },
  {
    name: "AC servicing",
    detail: "Installation, repair and maintenance",
    href: "/services?category=ac-servicing",
    icon: "ac",
  },
];

const steps = [
  {
    number: "01",
    title: "Find the right service",
    description: "Search by service, location, price and technician rating.",
  },
  {
    number: "02",
    title: "Choose an open time",
    description: "Review the technician profile and select an available slot.",
  },
  {
    number: "03",
    title: "Track the whole job",
    description:
      "Pay securely, follow progress and leave a review when it is done.",
  },
];

const assurances = [
  {
    title: "Clear service details",
    description:
      "See the price, duration and technician profile before sending a request.",
    icon: "document",
  },
  {
    title: "Secure online payment",
    description:
      "Complete accepted bookings through the SSLCommerz checkout flow.",
    icon: "shield",
  },
  {
    title: "Status at every stage",
    description:
      "Follow requests from acceptance and payment through job completion.",
    icon: "status",
  },
];

function CategoryIcon({ name }: { name: string }) {
  const common = {
    className: "size-6",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (name === "plumbing") {
    return (
      <svg {...common}>
        <path d="M6 3v5a3 3 0 0 0 3 3h6a3 3 0 0 1 3 3v7" />
        <path d="M3 3h6M15 21h6" />
        <path d="M18 14h3v4h-3" />
      </svg>
    );
  }

  if (name === "electrical") {
    return (
      <svg {...common}>
        <path d="m13 2-7 12h6l-1 8 7-12h-6l1-8Z" />
      </svg>
    );
  }

  if (name === "cleaning") {
    return (
      <svg {...common}>
        <path d="M5 20h14" />
        <path d="M8 20v-7l5-9" />
        <path d="m11 13 7 3-2 4H9" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <rect x="3" y="5" width="18" height="12" rx="2" />
      <path d="M7 9h10M9 17v2M15 17v2" />
    </svg>
  );
}

function AssuranceIcon({ name }: { name: string }) {
  const common = {
    className: "size-5",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (name === "shield") {
    return (
      <svg {...common}>
        <path d="M12 3 5 6v5c0 4.6 2.9 8 7 10 4.1-2 7-5.4 7-10V6l-7-3Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    );
  }

  if (name === "status") {
    return (
      <svg {...common}>
        <path d="M4 18V6M4 18h16" />
        <path d="m7 14 4-4 3 2 5-6" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M7 3h8l3 3v15H7z" />
      <path d="M15 3v4h4M10 11h5M10 15h5" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <>
      <section className="overflow-hidden border-b border-slate-200 bg-[#f5f8f6]">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 sm:py-18 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-16 lg:px-8 lg:py-22">
          <div className="relative z-10">
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-sm font-semibold text-emerald-800 shadow-sm">
              <span className="size-2 rounded-full bg-emerald-500" />
              Home services, booked without the back-and-forth
            </p>

            <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-[-0.035em] text-slate-950 sm:text-5xl lg:text-[3.65rem] lg:leading-[1.04]">
              Trusted help for the jobs that keep your home running.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Compare local technicians, choose an available time and manage the
              service from request to completion in one place.
            </p>

            <ServiceSearch />

            <div className="mt-6 flex flex-wrap gap-x-7 gap-y-3 text-sm font-medium text-slate-600">
              <span className="inline-flex items-center gap-2">
                <span className="grid size-5 place-items-center rounded-full bg-emerald-100 text-xs text-emerald-700">
                  ✓
                </span>
                Technician profiles
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="grid size-5 place-items-center rounded-full bg-emerald-100 text-xs text-emerald-700">
                  ✓
                </span>
                Real availability
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="grid size-5 place-items-center rounded-full bg-emerald-100 text-xs text-emerald-700">
                  ✓
                </span>
                SSLCommerz checkout
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[590px] lg:mx-0 lg:justify-self-end">
            <div className="absolute -left-6 top-16 hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/10 sm:block">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
                  <svg
                    viewBox="0 0 24 24"
                    className="size-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path
                      d="m9 12 2 2 4-4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Booking update
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-slate-900">
                    Request accepted
                  </p>
                </div>
              </div>
            </div>

            <Image
              src="/images/home-service-hero.svg"
              alt="A home service technician repairing a kitchen fixture"
              width={960}
              height={760}
              priority
              className="h-auto w-full drop-shadow-[0_28px_50px_rgba(15,23,42,0.12)]"
            />

            <div className="absolute -bottom-3 right-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/10 sm:bottom-5 sm:right-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                Available slots
              </p>
              <p className="mt-1 text-sm font-bold text-slate-900">
                See times before booking
              </p>
              <p className="mt-1 text-xs text-emerald-700">
                Choose what fits your day
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl divide-y divide-slate-200 px-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-6 lg:px-8">
          {assurances.map((item) => (
            <article
              key={item.title}
              className="flex gap-4 py-7 sm:px-6 sm:first:pl-0 sm:last:pr-0"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                <AssuranceIcon name={item.icon} />
              </span>
              <div>
                <h2 className="font-bold text-slate-900">{item.title}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {item.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Browse by category
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Start with what needs attention
            </h2>
          </div>
          <Link
            href="/services"
            className="font-semibold text-emerald-700 transition hover:text-emerald-800"
          >
            See every service →
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg hover:shadow-slate-950/5"
            >
              <span className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700 transition group-hover:bg-emerald-600 group-hover:text-white">
                <CategoryIcon name={category.icon} />
              </span>
              <h3 className="mt-5 text-lg font-bold text-slate-950">
                {category.name}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {category.detail}
              </p>
              <span className="mt-5 inline-flex text-sm font-semibold text-emerald-700">
                Explore →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <FeaturedServices />

      <section
        id="how-it-works"
        className="border-y border-slate-200 bg-[#f6f8f7]"
      >
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
            <div className="max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                How it works
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                A straightforward path from problem to solution
              </h2>
              <p className="mt-4 leading-7 text-slate-600">
                FixItNow keeps the technician, time slot, payment and job status
                connected to one booking.
              </p>
            </div>

            <div className="grid gap-4">
              {steps.map((step) => (
                <article
                  key={step.number}
                  className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-[64px_1fr] sm:items-start sm:p-6"
                >
                  <span className="grid size-12 place-items-center rounded-full border border-emerald-200 bg-emerald-50 text-sm font-black text-emerald-700">
                    {step.number}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-slate-950">
                      {step.title}
                    </h3>
                    <p className="mt-2 leading-7 text-slate-600">
                      {step.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-12 text-white sm:px-10 lg:flex lg:items-center lg:justify-between lg:gap-10 lg:px-14">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-400">
              For service professionals
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Turn your skills into a clear, bookable service.
            </h2>
            <p className="mt-4 leading-7 text-slate-300">
              Create your technician profile, publish services, set working
              hours and manage incoming jobs from one dashboard.
            </p>
          </div>
          <Link
            href="/auth/register"
            className="mt-7 inline-flex shrink-0 rounded-xl bg-white px-6 py-3.5 font-semibold text-slate-950 transition hover:bg-emerald-50 lg:mt-0"
          >
            Join as a technician
          </Link>
        </div>
      </section>
      <section>
        <ContactPage />
      </section>
    </>
  );
}
