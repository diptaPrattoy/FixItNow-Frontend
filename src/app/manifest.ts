import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FixItNow Home Services",
    short_name: "FixItNow",
    description: "Find local technicians, book available time slots and manage home services.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#047857",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
