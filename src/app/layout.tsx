import type { Metadata, Viewport } from "next";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { NetworkStatus } from "@/components/providers/network-status";
import { ToastProvider } from "@/components/providers/toast-provider";
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
        <ToastProvider>
          <a
            href="#main-content"
            className="fixed left-4 top-3 z-[120] -translate-y-20 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition focus:translate-y-0"
          >
            Skip to main content
          </a>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main id="main-content" className="flex-1" tabIndex={-1}>
              {children}
            </main>
            <SiteFooter />
          </div>
          <NetworkStatus />
        </ToastProvider>
      </body>
    </html>
  );
}
