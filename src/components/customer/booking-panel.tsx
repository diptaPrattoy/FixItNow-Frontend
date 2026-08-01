"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";

import { useToast } from "@/components/providers/toast-provider";
import { useAuthSession } from "@/hooks/use-auth-session";
import { apiRequest } from "@/lib/api/client";
import { getApiErrorMessage, getApiFieldErrors } from "@/lib/api/errors";
import type { CustomerBooking, TechnicianDetails } from "@/types/api";

type BookingPanelProps = {
  technician: TechnicianDetails;
};

type BookingFormState = {
  serviceId: string;
  availabilitySlotId: string;
  address: string;
  notes: string;
};

type FieldErrors = Partial<Record<keyof BookingFormState, string>>;

function formatPrice(price: string) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(Number(price));
}

function formatSlot(startTime: string, endTime: string) {
  const start = new Date(startTime);
  const end = new Date(endTime);

  return `${new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
  }).format(start)} · ${new Intl.DateTimeFormat("en-BD", {
    hour: "numeric",
    minute: "2-digit",
  }).format(start)}–${new Intl.DateTimeFormat("en-BD", {
    hour: "numeric",
    minute: "2-digit",
  }).format(end)}`;
}

export function BookingPanel({ technician }: BookingPanelProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { session, isReady } = useAuthSession();
  const [form, setForm] = useState<BookingFormState>({
    serviceId: technician.services[0]?.id ?? "",
    availabilitySlotId: technician.availabilitySlots[0]?.id ?? "",
    address: "",
    notes: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const selectedService = useMemo(
    () => technician.services.find((service) => service.id === form.serviceId),
    [form.serviceId, technician.services],
  );

  function updateField<K extends keyof BookingFormState>(
    field: K,
    value: BookingFormState[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validateForm() {
    const nextErrors: FieldErrors = {};

    if (!form.serviceId) {
      nextErrors.serviceId = "Select a service.";
    }

    if (!form.availabilitySlotId) {
      nextErrors.availabilitySlotId = "Select an available time slot.";
    }

    if (form.address.trim().length < 8) {
      nextErrors.address = "Enter a complete service address.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session || session.user.role !== "CUSTOMER") {
      toast("Log in with a customer account to create a booking.", "error");
      return;
    }

    if (!validateForm()) {
      toast("Please complete the required booking details.", "error");
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      await apiRequest<CustomerBooking>("/api/bookings", {
        method: "POST",
        token: session.token,
        body: {
          serviceId: form.serviceId,
          availabilitySlotId: form.availabilitySlotId,
          address: form.address.trim(),
          notes: form.notes.trim() || undefined,
        },
      });

      toast("Booking request submitted successfully.", "success");
      router.push("/dashboard/customer");
      router.refresh();
    } catch (error) {
      setErrors(getApiFieldErrors(error));
      toast(getApiErrorMessage(error), "error");
    } finally {
      setSubmitting(false);
    }
  }

  if (!isReady) {
    return <div className="h-80 animate-pulse rounded-2xl bg-slate-100" />;
  }

  if (!session) {
    return (
      <div>
        <h2 className="text-lg font-bold text-slate-950">Book this technician</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Log in with a customer account to choose a service and available time.
        </p>
        <Link
          href={`/auth/login?next=${encodeURIComponent(`/technicians/${technician.id}`)}`}
          className="mt-5 block rounded-xl bg-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          Log in to book
        </Link>
        <Link
          href="/auth/register"
          className="mt-2 block rounded-xl border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
        >
          Create customer account
        </Link>
      </div>
    );
  }

  if (session.user.role !== "CUSTOMER") {
    return (
      <div>
        <h2 className="text-lg font-bold text-slate-950">Customer booking only</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          You are signed in as {session.user.role.toLowerCase()}. Booking requests
          can only be created from a customer account.
        </p>
        <Link
          href={`/dashboard/${session.user.role.toLowerCase()}`}
          className="mt-5 block rounded-xl border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
        >
          Return to dashboard
        </Link>
      </div>
    );
  }

  const hasServices = technician.services.length > 0;
  const hasSlots = technician.availabilitySlots.length > 0;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h2 className="text-lg font-bold text-slate-950">Book this technician</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Choose an active service and one available time slot.
      </p>

      <div className="mt-5 space-y-4">
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Service</span>
          <select
            value={form.serviceId}
            onChange={(event) => updateField("serviceId", event.target.value)}
            disabled={!hasServices || submitting}
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-100"
          >
            {!hasServices ? <option value="">No active service</option> : null}
            {technician.services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name} · {formatPrice(service.price)}
              </option>
            ))}
          </select>
          {errors.serviceId ? (
            <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.serviceId}</p>
          ) : null}
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Available time</span>
          <select
            value={form.availabilitySlotId}
            onChange={(event) =>
              updateField("availabilitySlotId", event.target.value)
            }
            disabled={!hasSlots || submitting}
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-100"
          >
            {!hasSlots ? <option value="">No future time available</option> : null}
            {technician.availabilitySlots.map((slot) => (
              <option key={slot.id} value={slot.id}>
                {formatSlot(slot.startTime, slot.endTime)}
              </option>
            ))}
          </select>
          {errors.availabilitySlotId ? (
            <p className="mt-1.5 text-xs font-medium text-rose-600">
              {errors.availabilitySlotId}
            </p>
          ) : null}
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Service address</span>
          <textarea
            value={form.address}
            onChange={(event) => updateField("address", event.target.value)}
            rows={3}
            placeholder="House, road, area and city"
            disabled={submitting}
            className="mt-2 w-full resize-none rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          />
          {errors.address ? (
            <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.address}</p>
          ) : null}
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-700">
            Notes <span className="font-normal text-slate-400">(optional)</span>
          </span>
          <textarea
            value={form.notes}
            onChange={(event) => updateField("notes", event.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="Access details or anything the technician should know"
            disabled={submitting}
            className="mt-2 w-full resize-none rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          />
          {errors.notes ? (
            <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.notes}</p>
          ) : null}
        </label>
      </div>

      {selectedService ? (
        <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-3 text-sm">
          <span className="text-slate-600">Booking amount</span>
          <span className="font-bold text-slate-950">
            {formatPrice(selectedService.price)}
          </span>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={submitting || !hasServices || !hasSlots}
        className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {submitting ? "Submitting…" : "Request booking"}
      </button>
    </form>
  );
}
