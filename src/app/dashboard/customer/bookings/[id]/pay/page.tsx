import type { Metadata } from "next";

import { PaymentCheckout } from "@/components/customer/payment-checkout";

export const metadata: Metadata = {
  title: "Pay for Booking",
};

type PaymentPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PaymentPage({ params }: PaymentPageProps) {
  const { id } = await params;

  return <PaymentCheckout bookingId={id} />;
}
