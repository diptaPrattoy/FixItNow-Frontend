import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Payment Successful",
};

type PaymentSuccessPageProps = {
  searchParams: Promise<{
    tran_id?: string | string[];
  }>;
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PaymentSuccessPage({
  searchParams,
}: PaymentSuccessPageProps) {
  const params = await searchParams;
  const transactionId = firstValue(params.tran_id);

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-4 py-14 sm:px-6 lg:px-8">
      <div className="w-full rounded-3xl border border-emerald-200 bg-white p-7 shadow-sm sm:p-10">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-700">
          ✓
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
          Payment verified
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          Your payment was successful
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
          SSLCommerz returned the transaction to FixItNow and the backend
          verification completed successfully. The booking should now appear as
          paid.
        </p>

        {transactionId ? (
          <div className="mt-6 rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Transaction ID
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
            View booking status
          </Link>
          <Link
            href="/dashboard/customer/payments"
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
          >
            View payment history
          </Link>
        </div>
      </div>
    </section>
  );
}
