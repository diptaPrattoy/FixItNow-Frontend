import Link from "next/link";

const sections = [
  {
    title: "1. Using FixItNow",
    content:
      "FixItNow provides a platform that allows customers to discover home services and technicians and allows service professionals to offer their services. By using the platform, you agree to use it responsibly and provide accurate information.",
  },
  {
    title: "2. Accounts",
    content:
      "Some features require an account. You are responsible for keeping your login credentials secure and for the activity associated with your account. Users should provide accurate and up-to-date information during registration.",
  },
  {
    title: "3. Services and Bookings",
    content:
      "Service information, prices, availability and technician details are displayed through the platform. A booking request may require technician acceptance before it becomes confirmed. Customers should review the booking details before completing any payment.",
  },
  {
    title: "4. Payments",
    content:
      "Where online payment is available, payments are processed through the supported payment gateway. Payment-related information is handled according to the policies of the applicable payment provider.",
  },
  {
    title: "5. Cancellations",
    content:
      "Customers may cancel eligible bookings according to the booking status and applicable platform rules. A cancellation option may not be available after a service has entered an active or in-progress state.",
  },
  {
    title: "6. Technician Responsibilities",
    content:
      "Technicians are responsible for providing accurate service information, maintaining their availability, responding to booking requests and completing accepted services professionally.",
  },
  {
    title: "7. Reviews",
    content:
      "Customers may submit reviews for eligible completed services. Reviews should be honest, relevant and respectful. FixItNow may moderate content that violates platform rules.",
  },
  {
    title: "8. Platform Availability",
    content:
      "We aim to keep FixItNow available and reliable, but the platform may occasionally be unavailable because of maintenance, technical issues or circumstances outside our control.",
  },
  {
    title: "9. Changes to These Terms",
    content:
      "These terms may be updated as the platform evolves. Continued use of FixItNow after changes are published indicates acceptance of the updated terms.",
  },
];

export default function TermsPage() {
  return (
    <main className="bg-white">
      {/* Header */}
      <section className="border-b border-slate-200 bg-[#f5f8f6]">
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-18 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Legal
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            Terms of Service
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            These terms describe the basic rules for using the FixItNow
            platform as a customer, technician or other visitor.
          </p>

          <p className="mt-4 text-sm text-slate-500">
            Last updated: August 2026
          </p>
        </div>
      </section>

      {/* Terms */}
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="divide-y divide-slate-200">
          {sections.map((section) => (
            <article key={section.title} className="py-8 first:pt-0">
              <h2 className="text-xl font-bold text-slate-950">
                {section.title}
              </h2>

              <p className="mt-3 leading-8 text-slate-600">
                {section.content}
              </p>
            </article>
          ))}
        </div>

        {/* Contact */}
        <div className="mt-10 rounded-2xl border border-emerald-100 bg-emerald-50 p-6">
          <h2 className="text-lg font-bold text-slate-950">
            Questions about these terms?
          </h2>

          <p className="mt-2 text-sm leading-7 text-slate-600">
            If you have questions about FixItNow or these terms, please get in
            touch with our team.
          </p>

          <Link
            href="/contact"
            className="mt-4 inline-flex rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Contact us
          </Link>
        </div>
      </section>
    </main>
  );
}