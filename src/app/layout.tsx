import type { Metadata, Viewport } from "next";

import { Providers } from "@/components/providers/providers";
import { siteConfig } from "@/lib/site-config";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} | Home Services Made Simple`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    "home services",
    "technicians",
    "service booking",
    "Bangladesh",
    "SSLCommerz",
  ],
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#047857",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-950 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}