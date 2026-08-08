import type { Metadata } from "next";

import { ContactForm } from "@/components/contact/contact-form";

export const metadata: Metadata = {
  title: "Contact | FixItNow",
  description:
    "Contact FixItNow for help with bookings, payments, technicians, or your account.",
};

function ContactIcon({ type }: { type: "message" | "booking" | "payment" }) {
  const props = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "size-5",
    "aria-hidden": true,
  };

  if (type === "booking") {
    return (
      <svg {...props}>
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M8 3v4M16 3v4M4 10h16" />
      </svg>
    );
  }

  if (type === "payment") {
    return (
      <svg {...props}>
        <rect x="3" y="6" width="18" height="13" rx="2" />
        <path d="M3 10h18M7 15h4" />
      </svg>
    );
  }

  return (
    <svg {...props}>
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" />
    </svg>
  );
}

export default function ContactPage() {
  return (
    <main>
      <section className="border-b border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Contact FixItNow
          </p>

          <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Need help? Send us a message.
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Contact us about a booking, payment, technician, account, or
            anything else related to FixItNow.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-12">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">
              We&apos;re here to help
            </h2>

            {/* <p className="mt-3 max-w-lg text-sm leading-7 text-slate-600">
              Choose the relevant topic and describe what happened. Your message
              will be stored so it can be reviewed by the FixItNow
              administration team.
            </p> */}

            <div className="mt-7 space-y-3">
              <div className="flex gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-emerald-700 shadow-sm">
                  <ContactIcon type="booking" />
                </div>

                <div>
                  <h3 className="font-semibold text-slate-950">
                    Booking support
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Get help with booking requests, cancellations, scheduling,
                    or job status.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 rounded-2xl border border-violet-100 bg-violet-50/60 p-4">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-violet-700 shadow-sm">
                  <ContactIcon type="payment" />
                </div>

                <div>
                  <h3 className="font-semibold text-slate-950">
                    Payment support
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Contact us regarding an SSLCommerz payment or payment
                    status.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-50 text-slate-700">
                  <ContactIcon type="message" />
                </div>

                <div>
                  <h3 className="font-semibold text-slate-950">
                    General support
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Ask about your account, technicians, services, or the
                    FixItNow platform.
                  </p>
                </div>
              </div>
            </div>
{/* 
            <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-900">
                Response information
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Provide an email address you can access so the support team
                knows how to identify your request.
              </p>
            </div> */}
          </div>

          <ContactForm />
        </div>
      </section>
    </main>
  );
}
