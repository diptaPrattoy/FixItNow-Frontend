"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { FormField } from "@/components/auth/form-field";
import { useToast } from "@/components/providers/toast-provider";
import { apiRequest } from "@/lib/api/client";
import { getApiErrorMessage, getApiFieldErrors } from "@/lib/api/errors";
import { getDashboardPath, saveAuthSession } from "@/lib/auth/session";
import type { AuthResponse } from "@/types/api";

const DEMO_CREDENTIALS = {
  CUSTOMER: {
    email: "demo.customer@fixitnow.com",
    password: "Demo@123",
  },
  TECHNICIAN: {
    email: "demo.technician@fixitnow.com",
    password: "Demo@123",
  },
  ADMIN: {
    email: "demo.admin@fixitnow.com",
    password: "Demo@123",
  },
} as const;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function handleDemoLogin(role: keyof typeof DEMO_CREDENTIALS) {
    const credentials = DEMO_CREDENTIALS[role];

    setEmail(credentials.email);
    setPassword(credentials.password);
    setFieldErrors({});

    const roleName = role.charAt(0) + role.slice(1).toLowerCase();

    toast(`${roleName} demo credentials filled.`, "success");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const response = await apiRequest<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: {
          email,
          password,
        },
      });

      saveAuthSession(response.data);

      toast(`Welcome back, ${response.data.user.name}.`, "success");

      const nextPath = new URLSearchParams(window.location.search).get("next");

      const safeNextPath =
        response.data.user.role === "CUSTOMER" && nextPath?.startsWith("/")
          ? nextPath
          : getDashboardPath(response.data.user.role);

      router.push(safeNextPath);
      router.refresh();
    } catch (error) {
      setFieldErrors(getApiFieldErrors(error));
      toast(getApiErrorMessage(error), "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Log in to your account"
      description="Manage bookings, services and payments from your role-based dashboard."
      footer={
        <>
          New to FixItNow?{" "}
          <Link
            href="/auth/register"
            className="font-semibold text-emerald-700 hover:text-emerald-800"
          >
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Email */}
        <FormField
          id="email"
          name="email"
          type="email"
          label="Email address"
          placeholder="you@example.com"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={fieldErrors.email}
        />

        {/* Password */}
        <FormField
          id="password"
          name="password"
          type="password"
          label="Password"
          placeholder="Enter your password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={fieldErrors.password}
        />

        {/* Demo Login */}
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Try a demo account
            </p>

            <p className="mt-0.5 text-xs text-slate-500">
              Auto-fill credentials for testing different roles
            </p>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin("CUSTOMER")}
              className="rounded-lg border border-emerald-200 bg-white px-2 py-2 text-xs font-semibold text-emerald-700 transition hover:border-emerald-400 hover:bg-emerald-50 active:scale-[0.98]"
            >
              Customer
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin("TECHNICIAN")}
              className="rounded-lg border border-emerald-200 bg-white px-2 py-2 text-xs font-semibold text-emerald-700 transition hover:border-emerald-400 hover:bg-emerald-50 active:scale-[0.98]"
            >
              Technician
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin("ADMIN")}
              className="rounded-lg border border-emerald-200 bg-white px-2 py-2 text-xs font-semibold text-emerald-700 transition hover:border-emerald-400 hover:bg-emerald-50 active:scale-[0.98]"
            >
              Admin
            </button>
          </div>
        </div>

        {/* Login */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Logging in..." : "Log in"}
        </button>
      </form>
    </AuthShell>
  );
}
