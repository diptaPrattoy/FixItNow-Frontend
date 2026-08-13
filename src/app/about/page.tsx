import Link from "next/link";

const values = [
  {
    title: "Trusted professionals",
    description:
      "Customers can discover technician profiles, services, ratings and availability before making a booking.",
  },
  {
    title: "Simple booking",
    description:
      "Find the service you need, choose a suitable technician and select an available time slot in one place.",
  },
  {
    title: "Clear communication",
    description:
      "Booking statuses keep customers and technicians informed throughout the service journey.",
  },
];

const steps = [
  {
    number: "01",
    title: "Find a service",
    description:
      "Browse home services or search by service and location to find the right professional.",
  },
  {
    number: "02",
    title: "Choose your technician",
    description:
      "Review technician profiles, services, ratings and available time slots before booking.",
  },
  {
    number: "03",
    title: "Book and track",
    description:
      "Submit your booking request, complete payment when accepted and track the job until completion.",
  },
];

export default function AboutPage() {
  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="border-b border-slate-200 bg-[#f5f8f6]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
              About FixItNow
            </p>

            <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Your trusted home service platform.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              FixItNow connects customers with qualified home service
              professionals, making it easier to discover services, compare
              technicians, book available time slots and manage the entire
              service journey.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Our mission
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Making home services easier for everyone.
            </h2>
          </div>

          <div className="max-w-2xl">
            <p className="leading-8 text-slate-600">
              Finding a reliable professional for a home repair or maintenance
              job should not involve endless calls and uncertain schedules.
              FixItNow brings customers and service professionals together
              through a simple digital platform.
            </p>

            <p className="mt-5 leading-8 text-slate-600">
              Customers can explore available services, review technician
              information, select suitable time slots and follow their booking
              status. Technicians can build their profiles, manage
              availability and handle incoming jobs from their dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-y border-slate-200 bg-[#f6f8f7]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Why FixItNow
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Built around a better service experience.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {values.map((value) => (
              <article
                key={value.title}
                className="rounded-2xl border border-slate-200 bg-white p-6"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-emerald-50 font-bold text-emerald-700">
                  ✓
                </span>

                <h3 className="mt-5 text-lg font-bold text-slate-950">
                  {value.title}
                </h3>

                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {value.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
            How it works
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            From problem to solution in a few steps.
          </h2>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {steps.map((step) => (
            <article
              key={step.number}
              className="rounded-2xl border border-slate-200 bg-white p-6"
            >
              <span className="grid size-11 place-items-center rounded-full border border-emerald-200 bg-emerald-50 text-sm font-black text-emerald-700">
                {step.number}
              </span>

              <h3 className="mt-5 text-lg font-bold text-slate-950">
                {step.title}
              </h3>

              <p className="mt-2 leading-7 text-slate-600">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
        <div className="rounded-[2rem] bg-slate-950 px-6 py-12 text-center text-white sm:px-10">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to get started?
          </h2>

          <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-300">
            Find a service professional or create your technician profile
            today.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/services"
              className="rounded-xl bg-white px-6 py-3.5 font-semibold text-slate-950 transition hover:bg-emerald-50"
            >
              Browse services
            </Link>

            <Link
              href="/auth/register"
              className="rounded-xl border border-slate-700 px-6 py-3.5 font-semibold text-white transition hover:border-emerald-500 hover:bg-slate-900"
            >
              Join FixItNow
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}