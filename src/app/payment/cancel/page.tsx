import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Payment Not Completed",
};

type PaymentCancelPageProps = {
  searchParams: Promise<{
    status?: string | string[];
    tran_id?: string | string[];
    message?: string | string[];
  }>;
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PaymentCancelPage({
  searchParams,
}: PaymentCancelPageProps) {
  const params = await searchParams;
  const status = firstValue(params.status) ?? "cancelled";
  const transactionId = firstValue(params.tran_id);
  const providedMessage = firstValue(params.message);
  const verificationIssue = status.startsWith("verification");

  const description = providedMessage
    ? providedMessage
    : verificationIssue
      ? "The gateway response could not be verified. Check payment history before starting another payment attempt."
      : status === "failed"
        ? "SSLCommerz reported that the transaction failed. No completed payment was recorded."
        : "The checkout was cancelled before payment was completed.";

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-4 py-14 sm:px-6 lg:px-8">
      <div className="w-full rounded-3xl border border-amber-200 bg-white p-7 shadow-sm sm:p-10">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-xl font-bold text-amber-800">
          !
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
          Payment not completed
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          No successful payment was confirmed
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
          {description}
        </p>

        {transactionId ? (
          <div className="mt-6 rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Transaction reference
            </p>
            <p className="mt-2 break-all font-mono text-sm text-slate-800">
              {transactionId}
            </p>
          </div>
        ) : null}

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard/customer"
            className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Return to bookings
          </Link>
          <Link
            href="/dashboard/customer/payments"
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
          >
            Check payment history
          </Link>
        </div>
      </div>
    </section>
  );
}
