import type { Metadata } from "next";

import { AdminBookings } from "@/components/admin/admin-bookings";

export const metadata: Metadata = {
  title: "Booking Oversight",
};

export default function AdminBookingsPage() {
  return <AdminBookings />;
}
