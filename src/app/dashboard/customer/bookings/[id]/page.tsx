import type { Metadata } from "next";

import { BookingDetails } from "@/components/customer/booking-details";

export const metadata: Metadata = {
  title: "Booking Details",
};

type BookingDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BookingDetailsPage({
  params,
}: BookingDetailsPageProps) {
  const { id } = await params;

  return <BookingDetails bookingId={id} />;
}
