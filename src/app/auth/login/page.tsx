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

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setIsSubmitting(true);

    const form = new FormData(event.currentTarget);

    try {
      const response = await apiRequest<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: {
          email: form.get("email"),
          password: form.get("password"),
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
          <Link href="/auth/register" className="font-semibold text-emerald-700 hover:text-emerald-800">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <FormField
          id="email"
          name="email"
          type="email"
          label="Email address"
          placeholder="you@example.com"
          autoComplete="email"
          required
          error={fieldErrors.email}
        />
        <FormField
          id="password"
          name="password"
          type="password"
          label="Password"
          placeholder="Enter your password"
          autoComplete="current-password"
          required
          error={fieldErrors.password}
        />
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
