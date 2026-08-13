"use client";

import { FormEvent, useEffect, useState } from "react";

import { useToast } from "@/components/providers/toast-provider";
import { useAuthSession } from "@/hooks/use-auth-session";
import { apiRequest } from "@/lib/api/client";
import { getApiErrorMessage, getApiFieldErrors } from "@/lib/api/errors";

type Admin = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "ADMIN";
  status: "ACTIVE" | "BANNED";
  createdAt: string;
  updatedAt: string;
};

type CreateAdminInput = {
  name: string;
  email: string;
  password: string;
  phone: string;
};

export function AdminManagement() {
  const { toast } = useToast();
  const { session, isReady } = useAuthSession();

  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState<CreateAdminInput>({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function loadAdmins() {
    if (!session?.token) return;

    try {
      setLoading(true);

      const response = await apiRequest<Admin[]>(
        "/dashboard/admin/admins?page=1&limit=50",
        {
          token: session.token,
        },
      );

      setAdmins(response.data);
    } catch (error) {
      toast(getApiErrorMessage(error), "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isReady || !session || session.user.role !== "ADMIN") {
      return;
    }

    void loadAdmins();
  }, [isReady, session]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((previous) => ({
        ...previous,
        [name]: "",
      }));
    }
  }

  async function handleCreateAdmin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session?.token) {
      toast("Authentication is required.", "error");
      return;
    }

    setCreating(true);
    setFieldErrors({});

    try {
      const response = await apiRequest<Admin>(
        "/src/app/dashboard/admin/admins/page.tsx",
        {
          method: "POST",
          token: session.token,
          body: {
            name: form.name.trim(),
            email: form.email.trim(),
            password: form.password,
            phone: form.phone.trim() || null,
          },
        },
      );

      setAdmins((previous) => [response.data, ...previous]);

      setForm({
        name: "",
        email: "",
        password: "",
        phone: "",
      });

      toast("Administrator account created successfully.", "success");
    } catch (error) {
      setFieldErrors(getApiFieldErrors(error));
      toast(getApiErrorMessage(error), "error");
    } finally {
      setCreating(false);
    }
  }

  if (!isReady || loading) {
    return (
      <div className="space-y-6">
        <section className="dashboard-tint-card rounded-[28px] p-6 sm:p-8">
          <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
          <div className="mt-4 h-9 w-64 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-slate-200" />
        </section>

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          <div className="h-[500px] animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-[500px] animate-pulse rounded-2xl bg-slate-100" />
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== "ADMIN") {
    return (
      <section className="dashboard-surface rounded-2xl p-8 text-center">
        <h1 className="text-xl font-bold text-slate-950">Access denied</h1>

        <p className="mt-2 text-sm text-slate-500">
          Only administrators can manage administrator accounts.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="dashboard-tint-card rounded-[28px] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
          Administration
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          Manage administrators
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Create and manage administrator accounts for the FixItNow platform.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* Create admin */}
        <section className="dashboard-surface rounded-2xl p-5 sm:p-6">
          <div className="border-b border-slate-100 pb-5">
            <h2 className="text-lg font-bold text-slate-950">
              Create administrator
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Add a new administrator account.
            </p>
          </div>

          <form
            onSubmit={handleCreateAdmin}
            className="mt-6 space-y-5"
            noValidate
          >
            {/* Name */}
            <div>
              <label
                htmlFor="admin-name"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Full name
              </label>

              <input
                id="admin-name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Administrator name"
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 ${
                  fieldErrors.name ? "border-rose-300" : "border-slate-200"
                }`}
              />

              {fieldErrors.name && (
                <p className="mt-1.5 text-xs text-rose-600">
                  {fieldErrors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="admin-email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email address
              </label>

              <input
                id="admin-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="admin@example.com"
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 ${
                  fieldErrors.email ? "border-rose-300" : "border-slate-200"
                }`}
              />

              {fieldErrors.email && (
                <p className="mt-1.5 text-xs text-rose-600">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="admin-phone"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Phone number
              </label>

              <input
                id="admin-phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="+880 1XXXXXXXXX"
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 ${
                  fieldErrors.phone ? "border-rose-300" : "border-slate-200"
                }`}
              />

              {fieldErrors.phone && (
                <p className="mt-1.5 text-xs text-rose-600">
                  {fieldErrors.phone}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="admin-password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Password
              </label>

              <input
                id="admin-password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 ${
                  fieldErrors.password ? "border-rose-300" : "border-slate-200"
                }`}
              />

              {fieldErrors.password && (
                <p className="mt-1.5 text-xs text-rose-600">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={creating}
              className="w-full rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? "Creating administrator..." : "Create administrator"}
            </button>
          </form>
        </section>

        {/* Admin list */}
        <section className="dashboard-surface rounded-2xl p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Administrator accounts
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {admins.length} administrator
                {admins.length === 1 ? "" : "s"} registered.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {admins.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
                <p className="text-sm font-medium text-slate-700">
                  No administrator accounts found.
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Create the first administrator using the form.
                </p>
              </div>
            ) : (
              admins.map((admin) => (
                <div
                  key={admin.id}
                  className="flex flex-col gap-4 rounded-xl border border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-sm font-bold text-emerald-700">
                      {admin.name
                        .split(/\s+/)
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((part) => part[0])
                        .join("")
                        .toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-900">
                        {admin.name}
                      </p>

                      <p className="truncate text-sm text-slate-500">
                        {admin.email}
                      </p>

                      {admin.phone && (
                        <p className="mt-0.5 text-xs text-slate-400">
                          {admin.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        admin.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {admin.status === "ACTIVE" ? "Active" : "Banned"}
                    </span>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      Admin
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
