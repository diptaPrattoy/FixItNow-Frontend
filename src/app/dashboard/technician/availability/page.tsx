import type { Metadata } from "next";

import { TechnicianAvailability } from "@/components/technician/technician-availability";

export const metadata: Metadata = {
  title: "Availability",
};

export default function TechnicianAvailabilityPage() {
  return <TechnicianAvailability />;
}
