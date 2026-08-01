"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";

import { FormField } from "@/components/auth/form-field";
import { useToast } from "@/components/providers/toast-provider";
import { useAuthSession } from "@/hooks/use-auth-session";
import { apiRequest } from "@/lib/api/client";
import { getApiErrorMessage, getApiFieldErrors } from "@/lib/api/errors";
import { updateAuthSessionUser } from "@/lib/auth/session";
import type {
  Category,
  TechnicianManagedService,
  TechnicianPrivateProfile,
} from "@/types/api";

type ProfileForm = {
  bio: string;
  experienceYears: string;
  location: string;
};

type ServiceForm = {
  categoryId: string;
  name: string;
  description: string;
  price: string;
  durationMinutes: string;
};

type FieldErrors = Partial<Record<keyof ProfileForm | keyof ServiceForm, string>>;

type ProfilePayload = TechnicianPrivateProfile | { profile: TechnicianPrivateProfile };
type ServicesPayload =
  | TechnicianManagedService[]
  | { services: TechnicianManagedService[] };

const emptyProfile: ProfileForm = {
  bio: "",
  experienceYears: "0",
  location: "",
};

const emptyService: ServiceForm = {
  categoryId: "",
  name: "",
  description: "",
  price: "",
  durationMinutes: "60",
};

function unwrapProfile(data: ProfilePayload) {
  return "profile" in data ? data.profile : data;
}

function unwrapServices(data: ServicesPayload) {
  return Array.isArray(data) ? data : data.services;
}

function money(value: string) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function validateProfile(form: ProfileForm): FieldErrors {
  const errors: FieldErrors = {};
  const experience = Number(form.experienceYears);

  if (form.location.trim().length < 2) {
    errors.location = "Enter your working location.";
  }

  if (!Number.isInteger(experience) || experience < 0 || experience > 60) {
    errors.experienceYears = "Experience must be between 0 and 60 years.";
  }

  if (form.bio.trim().length > 1000) {
    errors.bio = "Bio must not exceed 1000 characters.";
  }

  return errors;
}

function validateService(form: ServiceForm): FieldErrors {
  const errors: FieldErrors = {};
  const price = Number(form.price);
  const duration = Number(form.durationMinutes);

  if (!form.categoryId) errors.categoryId = "Select a service category.";
  if (form.name.trim().length < 3) {
    errors.name = "Service name must contain at least 3 characters.";
  }
  if (form.description.trim().length > 1000) {
    errors.description = "Description must not exceed 1000 characters.";
  }
  if (!Number.isFinite(price) || price <= 0) {
    errors.price = "Enter a valid price greater than zero.";
  }
  if (!Number.isInteger(duration) || duration < 15 || duration > 1440) {
    errors.durationMinutes = "Duration must be between 15 and 1440 minutes.";
  }

  return errors;
}

function TextareaField({
  id,
  label,
  value,
  error,
  placeholder,
  rows = 4,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  error?: string;
  placeholder: string;
  rows?: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block" htmlFor={id}>
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <textarea
        id={id}
        value={value}
        rows={rows}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
        className={`mt-2 w-full resize-y rounded-xl border bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
          error
            ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
            : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-100"
        }`}
      />
      {error ? (
        <span id={`${id}-error`} className="mt-1.5 block text-sm text-rose-600">
          {error}
        </span>
      ) : null}
    </label>
  );
}

function WorkspaceSkeleton() {
  return (
    <div className="space-y-5">
      <div className="h-44 animate-pulse rounded-2xl border border-slate-200 bg-white" />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="h-[520px] animate-pulse rounded-2xl border border-slate-200 bg-white" />
        <div className="h-[520px] animate-pulse rounded-2xl border border-slate-200 bg-white" />
      </div>
    </div>
  );
}

export function TechnicianProfileServices() {
  const { session, isReady } = useAuthSession();
  const { toast } = useToast();
  const [profile, setProfile] = useState<TechnicianPrivateProfile | null>(null);
  const [services, setServices] = useState<TechnicianManagedService[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [profileForm, setProfileForm] = useState<ProfileForm>(emptyProfile);
  const [serviceForm, setServiceForm] = useState<ServiceForm>(emptyService);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingService, setSavingService] = useState(false);
  const [editingService, setEditingService] = useState<TechnicianManagedService | null>(null);
  const [serviceEditorOpen, setServiceEditorOpen] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState<TechnicianManagedService | null>(null);
  const [deactivating, setDeactivating] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!isReady || !session || session.user.role !== "TECHNICIAN") return;

    let cancelled = false;
    const token = session.token;

    async function loadWorkspace() {
      try {
        const [profileResponse, servicesResponse, categoriesResponse] =
          await Promise.all([
            apiRequest<ProfilePayload>("/api/technician/profile", { token }),
            apiRequest<ServicesPayload>("/api/technician/services", { token }),
            apiRequest<Category[]>("/api/categories"),
          ]);

        if (cancelled) return;

        const currentProfile = unwrapProfile(profileResponse.data);
        setProfile(currentProfile);
        setProfileForm({
          bio: currentProfile.bio ?? "",
          experienceYears: String(currentProfile.experienceYears ?? 0),
          location: currentProfile.location ?? "",
        });
        setServices(unwrapServices(servicesResponse.data));
        setCategories(
          categoriesResponse.data.filter((category) => category.isActive !== false),
        );
      } catch (error) {
        if (!cancelled) {
          toast(getApiErrorMessage(error), "error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadWorkspace();

    return () => {
      cancelled = true;
    };
  }, [isReady, refreshKey, session, toast]);

  const summary = useMemo(() => {
    const active = services.filter((service) => service.isActive !== false).length;
    const inactive = services.length - active;
    return { active, inactive };
  }, [services]);

  function setProfileValue(key: keyof ProfileForm, value: string) {
    setProfileForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
  }

  function setServiceValue(key: keyof ServiceForm, value: string) {
    setServiceForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function submitProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) return;

    const errors = validateProfile(profileForm);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast("Please correct the highlighted profile fields.", "error");
      return;
    }

    setSavingProfile(true);
    setFieldErrors({});

    try {
      const response = await apiRequest<ProfilePayload>("/api/technician/profile", {
        method: "PUT",
        token: session.token,
        body: {
          bio: profileForm.bio.trim() || null,
          experienceYears: Number(profileForm.experienceYears),
          location: profileForm.location.trim(),
        },
      });

      const updated = unwrapProfile(response.data);
      setProfile(updated);
      setProfileForm({
        bio: updated.bio ?? "",
        experienceYears: String(updated.experienceYears ?? 0),
        location: updated.location ?? "",
      });

      updateAuthSessionUser({
        ...session.user,
        technicianProfile: {
          ...(session.user.technicianProfile ?? {
            id: updated.id,
            averageRating: updated.averageRating ?? "0",
            reviewCount: updated.reviewCount ?? 0,
            isVerified: updated.isVerified ?? false,
          }),
          id: updated.id,
          bio: updated.bio,
          experienceYears: updated.experienceYears,
          location: updated.location,
          averageRating: updated.averageRating,
          reviewCount: updated.reviewCount,
          isVerified: updated.isVerified,
        },
      });

      toast("Profile updated successfully.", "success");
    } catch (error) {
      setFieldErrors(getApiFieldErrors(error));
      toast(getApiErrorMessage(error), "error");
    } finally {
      setSavingProfile(false);
    }
  }

  function openCreateService() {
    setEditingService(null);
    setServiceForm({ ...emptyService, categoryId: categories[0]?.id ?? "" });
    setFieldErrors({});
    setServiceEditorOpen(true);
  }

  function openEditService(service: TechnicianManagedService) {
    setEditingService(service);
    setServiceForm({
      categoryId: service.category.id,
      name: service.name,
      description: service.description ?? "",
      price: service.price,
      durationMinutes: String(service.durationMinutes),
    });
    setFieldErrors({});
    setServiceEditorOpen(true);
  }

  function closeServiceEditor() {
    if (savingService) return;
    setServiceEditorOpen(false);
    setEditingService(null);
    setServiceForm(emptyService);
    setFieldErrors({});
  }

  async function submitService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) return;

    const errors = validateService(serviceForm);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast("Please correct the highlighted service fields.", "error");
      return;
    }

    setSavingService(true);
    setFieldErrors({});

    const path = editingService
      ? `/api/technician/services/${editingService.id}`
      : "/api/technician/services";

    try {
      const response = await apiRequest<TechnicianManagedService>(path, {
        method: editingService ? "PATCH" : "POST",
        token: session.token,
        body: {
          categoryId: serviceForm.categoryId,
          name: serviceForm.name.trim(),
          description: serviceForm.description.trim() || null,
          price: Number(serviceForm.price),
          durationMinutes: Number(serviceForm.durationMinutes),
        },
      });

      setServices((current) =>
        editingService
          ? current.map((service) =>
              service.id === editingService.id ? response.data : service,
            )
          : [response.data, ...current],
      );
      toast(
        editingService
          ? "Service updated successfully."
          : "Service created successfully.",
        "success",
      );
      setServiceEditorOpen(false);
      setEditingService(null);
      setServiceForm(emptyService);
      setFieldErrors({});
    } catch (error) {
      setFieldErrors(getApiFieldErrors(error));
      toast(getApiErrorMessage(error), "error");
    } finally {
      setSavingService(false);
    }
  }

  async function reactivateService(service: TechnicianManagedService) {
    if (!session) return;

    try {
      const response = await apiRequest<TechnicianManagedService>(
        `/api/technician/services/${service.id}`,
        {
          method: "PATCH",
          token: session.token,
          body: { isActive: true },
        },
      );
      setServices((current) =>
        current.map((item) => (item.id === service.id ? response.data : item)),
      );
      toast("Service activated successfully.", "success");
    } catch (error) {
      toast(getApiErrorMessage(error), "error");
    }
  }

  async function confirmDeactivation() {
    if (!session || !deactivateTarget) return;

    setDeactivating(true);
    try {
      await apiRequest<TechnicianManagedService | null>(
        `/api/technician/services/${deactivateTarget.id}`,
        {
          method: "DELETE",
          token: session.token,
        },
      );
      setServices((current) =>
        current.map((service) =>
          service.id === deactivateTarget.id
            ? { ...service, isActive: false }
            : service,
        ),
      );
      toast("Service deactivated successfully.", "success");
      setDeactivateTarget(null);
    } catch (error) {
      toast(getApiErrorMessage(error), "error");
    } finally {
      setDeactivating(false);
    }
  }

  if (loading) return <WorkspaceSkeleton />;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="flex min-w-0 items-center gap-4">
            <Image
              src={session?.user.avatarUrl ?? "/images/avatar-placeholder.svg"}
              alt=""
              width={64}
              height={64}
              className="size-16 shrink-0 rounded-2xl border border-slate-200 bg-slate-50 object-cover"
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                Technician workspace
              </p>
              <h1 className="mt-2 truncate text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                {session?.user.name}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Keep your public details and service catalogue accurate.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile?.id ? (
              <Link
                href={`/technicians/${profile.id}`}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
              >
                View public profile
              </Link>
            ) : null}
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setRefreshKey((current) => current + 1);
              }}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
            >
              Refresh
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Active services</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{summary.active}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Average rating</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {Number(profile?.averageRating ?? 0).toFixed(1)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Customer reviews</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {profile?.reviewCount ?? 0}
          </p>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <section className="h-fit rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-950">Public profile</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              These details help customers understand your experience and service area.
            </p>
          </div>

          <form onSubmit={submitProfile} className="mt-5 space-y-5">
            <FormField
              id="technician-location"
              label="Working location"
              value={profileForm.location}
              placeholder="Dhaka"
              error={fieldErrors.location}
              onChange={(event) => setProfileValue("location", event.target.value)}
            />
            <FormField
              id="technician-experience"
              label="Years of experience"
              type="number"
              min="0"
              max="60"
              value={profileForm.experienceYears}
              error={fieldErrors.experienceYears}
              onChange={(event) =>
                setProfileValue("experienceYears", event.target.value)
              }
            />
            <TextareaField
              id="technician-bio"
              label="Professional bio"
              value={profileForm.bio}
              placeholder="Describe your experience, the work you handle and how you serve customers."
              error={fieldErrors.bio}
              onChange={(value) => setProfileValue("bio", value)}
            />
            <button
              type="submit"
              disabled={savingProfile}
              className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingProfile ? "Saving profile…" : "Save profile"}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-950">Your services</h2>
              <p className="mt-1 text-sm text-slate-500">
                {services.length} total · {summary.inactive} inactive
              </p>
            </div>
            <button
              type="button"
              onClick={openCreateService}
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Add service
            </button>
          </div>

          {services.length === 0 ? (
            <div className="py-12 text-center">
              <h3 className="font-semibold text-slate-950">No services added</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                Add your first service so customers can find and book you.
              </p>
              <button
                type="button"
                onClick={openCreateService}
                className="mt-5 rounded-xl border border-emerald-300 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
              >
                Create first service
              </button>
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {services.map((service) => (
                <article
                  key={service.id}
                  className="rounded-2xl border border-slate-200 p-4 sm:p-5"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          {service.category.name}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            service.isActive === false
                              ? "bg-slate-100 text-slate-500"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {service.isActive === false ? "Inactive" : "Active"}
                        </span>
                      </div>
                      <h3 className="mt-3 text-lg font-bold text-slate-950">
                        {service.name}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
                        {service.description || "No description provided."}
                      </p>
                    </div>
                    <div className="shrink-0 sm:text-right">
                      <p className="font-bold text-slate-950">{money(service.price)}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {service.durationMinutes} minutes
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => openEditService(service)}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
                    >
                      Edit
                    </button>
                    {service.isActive === false ? (
                      <button
                        type="button"
                        onClick={() => void reactivateService(service)}
                        className="rounded-lg border border-emerald-300 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                      >
                        Activate
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeactivateTarget(service)}
                        className="rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                      >
                        Deactivate
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {serviceEditorOpen ? (
        <div className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/40 p-0 sm:items-center sm:p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="service-editor-title"
            className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-2xl sm:rounded-2xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 id="service-editor-title" className="text-xl font-bold text-slate-950">
                  {editingService ? "Edit service" : "Add a service"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Keep pricing and expected duration clear for customers.
                </p>
              </div>
              <button
                type="button"
                onClick={closeServiceEditor}
                className="rounded-lg px-2 py-1 text-xl leading-none text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close service form"
              >
                ×
              </button>
            </div>

            <form onSubmit={submitService} className="mt-5 space-y-5">
              <label className="block" htmlFor="service-category">
                <span className="text-sm font-semibold text-slate-700">Category</span>
                <select
                  id="service-category"
                  value={serviceForm.categoryId}
                  onChange={(event) =>
                    setServiceValue("categoryId", event.target.value)
                  }
                  aria-invalid={Boolean(fieldErrors.categoryId)}
                  className={`mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:ring-4 ${
                    fieldErrors.categoryId
                      ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                      : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-100"
                  }`}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {fieldErrors.categoryId ? (
                  <span className="mt-1.5 block text-sm text-rose-600">
                    {fieldErrors.categoryId}
                  </span>
                ) : null}
              </label>

              <FormField
                id="service-name"
                label="Service name"
                value={serviceForm.name}
                placeholder="Home electrical repair"
                error={fieldErrors.name}
                onChange={(event) => setServiceValue("name", event.target.value)}
              />

              <TextareaField
                id="service-description"
                label="Description"
                value={serviceForm.description}
                placeholder="Explain what is included in this service."
                error={fieldErrors.description}
                onChange={(value) => setServiceValue("description", value)}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  id="service-price"
                  label="Price (BDT)"
                  type="number"
                  min="1"
                  step="1"
                  value={serviceForm.price}
                  placeholder="1000"
                  error={fieldErrors.price}
                  onChange={(event) => setServiceValue("price", event.target.value)}
                />
                <FormField
                  id="service-duration"
                  label="Duration (minutes)"
                  type="number"
                  min="15"
                  max="1440"
                  step="15"
                  value={serviceForm.durationMinutes}
                  error={fieldErrors.durationMinutes}
                  onChange={(event) =>
                    setServiceValue("durationMinutes", event.target.value)
                  }
                />
              </div>

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeServiceEditor}
                  disabled={savingService}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingService}
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingService
                    ? "Saving…"
                    : editingService
                      ? "Save changes"
                      : "Create service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {deactivateTarget ? (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/40 p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="deactivate-service-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <h2 id="deactivate-service-title" className="text-xl font-bold text-slate-950">
              Deactivate this service?
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              <strong>{deactivateTarget.name}</strong> will no longer appear as an
              active option for customers. Existing booking records will remain unchanged.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={deactivating}
                onClick={() => setDeactivateTarget(null)}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                Keep service
              </button>
              <button
                type="button"
                disabled={deactivating}
                onClick={() => void confirmDeactivation()}
                className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
              >
                {deactivating ? "Deactivating…" : "Deactivate"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
