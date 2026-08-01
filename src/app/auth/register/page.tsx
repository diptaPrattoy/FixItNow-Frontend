"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { FormField } from "@/components/auth/form-field";
import { useToast } from "@/components/providers/toast-provider";
import { apiRequest } from "@/lib/api/client";
import { getApiErrorMessage, getApiFieldErrors } from "@/lib/api/errors";
import type { AuthResponse, UserRole } from "@/types/api";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [role, setRole] = useState<Extract<UserRole, "CUSTOMER" | "TECHNICIAN">>("CUSTOMER");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setIsSubmitting(true);

    const form = new FormData(event.currentTarget);
    const body = {
      name: form.get("name"),
      email: form.get("email"),
      password: form.get("password"),
      phone: form.get("phone") || undefined,
      role,
      ...(role === "TECHNICIAN" ? { location: form.get("location") } : {}),
    };

    try {
      await apiRequest<AuthResponse>("/api/auth/register", {
        method: "POST",
        body,
      });

      toast("Account created. You can now log in.", "success");
      router.push("/auth/login");
    } catch (error) {
      setFieldErrors(getApiFieldErrors(error));
      toast(getApiErrorMessage(error), "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Create account"
      title="Join FixItNow"
      description="Choose how you will use the platform. Admin accounts are created separately."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold text-emerald-700 hover:text-emerald-800">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <fieldset>
          <legend className="text-sm font-semibold text-slate-700">I am joining as</legend>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {(["CUSTOMER", "TECHNICIAN"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setRole(option)}
                className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                  role === option
                    ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                    : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
                }`}
              >
                {option === "CUSTOMER" ? "Customer" : "Technician"}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            id="name"
            name="name"
            label="Full name"
            placeholder="Your name"
            autoComplete="name"
            required
            error={fieldErrors.name}
          />
          <FormField
            id="phone"
            name="phone"
            type="tel"
            label="Phone number"
            placeholder="+8801XXXXXXXXX"
            autoComplete="tel"
            error={fieldErrors.phone}
          />
        </div>

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
          placeholder="At least 8 characters"
          autoComplete="new-password"
          required
          error={fieldErrors.password}
        />

        {role === "TECHNICIAN" ? (
          <FormField
            id="location"
            name="location"
            label="Service location"
            placeholder="For example, Dhaka"
            required
            error={fieldErrors.location}
          />
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}
