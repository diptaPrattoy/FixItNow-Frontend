import Link from "next/link";

const serviceCategories = [
  { name: "Plumbing", detail: "Leaks, fittings and pipe repair", icon: "PL" },
  { name: "Electrical", detail: "Wiring, switches and installations", icon: "EL" },
  { name: "Cleaning", detail: "Reliable home and office cleaning", icon: "CL" },
  { name: "AC Servicing", detail: "Installation, repair and maintenance", icon: "AC" },
];

const steps = [
  {
    number: "01",
    title: "Choose a service",
    description: "Browse verified professionals by category, location and price.",
  },
  {
    number: "02",
    title: "Pick a time slot",
    description: "Select an available appointment that fits your schedule.",
  },
  {
    number: "03",
    title: "Get the job done",
    description: "Track progress, pay securely and review the completed service.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-emerald-100 bg-[radial-gradient(circle_at_top_left,_#d1fae5,_transparent_45%),linear-gradient(to_bottom,_#ffffff,_#f0fdf4)]">
        <div className="absolute -right-32 top-20 size-80 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl gap-14 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:px-8 lg:py-28">
          <div>
            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-white/80 px-3 py-1.5 text-sm font-semibold text-emerald-700 shadow-sm">
              Trusted home services in one place
            </span>
            <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl lg:leading-[1.08]">
              The right professional for every home repair.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Find qualified technicians, compare services, reserve an available
              time slot and manage the whole job from one simple platform.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/services"
                className="rounded-xl bg-emerald-600 px-6 py-3.5 text-center font-semibold text-white shadow-lg shadow-emerald-900/15 transition hover:-translate-y-0.5 hover:bg-emerald-700"
              >
                Browse services
              </Link>
              <Link
                href="/auth/register"
                className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-center font-semibold text-slate-800 transition hover:border-emerald-300 hover:bg-emerald-50"
              >
                Join as a technician
              </Link>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-600">
              <span>✓ Verified professionals</span>
              <span>✓ Secure payments</span>
              <span>✓ Real booking updates</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <div className="rounded-[2rem] border border-white/80 bg-white/85 p-5 shadow-2xl shadow-emerald-950/10 backdrop-blur sm:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-emerald-700">Quick booking</p>
                  <h2 className="mt-1 text-2xl font-bold">What do you need fixed?</h2>
                </div>
                <span className="grid size-12 place-items-center rounded-2xl bg-emerald-100 text-xl">
                  🔧
                </span>
              </div>
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Service
                  </p>
                  <p className="mt-1 font-semibold text-slate-800">Home electrical repair</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Location
                    </p>
                    <p className="mt-1 font-semibold text-slate-800">Dhaka</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Date
                    </p>
                    <p className="mt-1 font-semibold text-slate-800">Next available</p>
                  </div>
                </div>
                <Link
                  href="/services"
                  className="block rounded-2xl bg-slate-950 px-5 py-4 text-center font-semibold text-white transition hover:bg-emerald-700"
                >
                  Find professionals
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-18 sm:px-6 sm:py-22 lg:px-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">
              Popular categories
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Help for every corner of your home
            </h2>
          </div>
          <Link href="/services" className="font-semibold text-emerald-700 hover:text-emerald-800">
            View all services →
          </Link>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {serviceCategories.map((category) => (
            <article
              key={category.name}
              className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-950/5"
            >
              <span className="grid size-12 place-items-center rounded-2xl bg-emerald-100 text-sm font-black text-emerald-700">
                {category.icon}
              </span>
              <h3 className="mt-5 text-lg font-bold">{category.name}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{category.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="bg-slate-950 py-18 text-white sm:py-22">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-400">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              From request to repair in three clear steps
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {steps.map((step) => (
              <article key={step.number} className="rounded-3xl border border-white/10 bg-white/5 p-7">
                <span className="text-sm font-black tracking-[0.2em] text-emerald-400">
                  {step.number}
                </span>
                <h3 className="mt-6 text-xl font-bold">{step.title}</h3>
                <p className="mt-3 leading-7 text-slate-300">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-18 sm:px-6 sm:py-22 lg:px-8">
        <div className="rounded-[2rem] bg-emerald-600 px-6 py-12 text-center text-white shadow-xl shadow-emerald-900/15 sm:px-10">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to get your home fixed?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-emerald-50">
            Create your account and connect with skilled professionals near you.
          </p>
          <Link
            href="/auth/register"
            className="mt-7 inline-flex rounded-xl bg-white px-6 py-3.5 font-semibold text-emerald-700 transition hover:bg-emerald-50"
          >
            Create free account
          </Link>
        </div>
      </section>
    </>
  );
}
