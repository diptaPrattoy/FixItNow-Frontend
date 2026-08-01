import type { Metadata } from "next";

import { TechnicianBookings } from "@/components/technician/technician-bookings";

export const metadata: Metadata = {
  title: "Booking Requests",
};

export default function TechnicianBookingsPage() {
  return <TechnicianBookings />;
}
