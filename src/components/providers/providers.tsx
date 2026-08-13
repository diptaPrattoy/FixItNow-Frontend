"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";

import { SiteFooter } from "../layout/site-footer";
import { SiteHeader } from "../layout/site-header";
import { NetworkStatus } from "./network-status";
import { ToastProvider } from "./toast-provider";

type ProvidersProps = {
  children: React.ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    console.error("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured.");
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId ?? ""}>
      <ToastProvider>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />

          <main id="main-content" className="flex-1" tabIndex={-1}>
            {children}
          </main>

          <SiteFooter />
        </div>

        <a
          href="#main-content"
          className="fixed left-4 top-3 z-[120] -translate-y-20 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition focus:translate-y-0"
        >
          Skip to main content
        </a>

        <NetworkStatus />
      </ToastProvider>
    </GoogleOAuthProvider>
  );
}
