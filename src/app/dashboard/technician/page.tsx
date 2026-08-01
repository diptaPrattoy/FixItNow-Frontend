import type { Metadata } from "next";

import { TechnicianProfileServices } from "@/components/technician/technician-profile-services";

export const metadata: Metadata = {
  title: "Technician Workspace",
};

export default function TechnicianDashboardPage() {
  return <TechnicianProfileServices />;
}
