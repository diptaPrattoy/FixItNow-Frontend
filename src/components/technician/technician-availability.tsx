"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";

import { useToast } from "@/components/providers/toast-provider";
import { useAuthSession } from "@/hooks/use-auth-session";
import { apiRequest } from "@/lib/api/client";
import { getApiErrorMessage, getApiFieldErrors } from "@/lib/api/errors";
import type { TechnicianAvailabilitySlot } from "@/types/api";

type AvailabilityPayload =
  | TechnicianAvailabilitySlot[]
  | { slots: TechnicianAvailabilitySlot[] }
  | { availabilitySlots: TechnicianAvailabilitySlot[] };

type SlotPayload =
  | TechnicianAvailabilitySlot
  | { slot: TechnicianAvailabilitySlot }
  | { availabilitySlot: TechnicianAvailabilitySlot };

type SlotForm = {
  date: string;
  startTime: string;
  endTime: string;
};

type FieldErrors = Partial<Record<keyof SlotForm, string>>;

const emptyForm: SlotForm = {
  date: "",
  startTime: "09:00",
  endTime: "11:00",
};

function unwrapSlots(data: AvailabilityPayload) {
  if (Array.isArray(data)) return data;
  if ("slots" in data) return data.slots;
  return data.availabilitySlots;
}

function unwrapSlot(data: SlotPayload) {
  if ("slot" in data) return data.slot;
  if ("availabilitySlot" in data) return data.availabilitySlot;
  return data;
}

function toLocalDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toLocalTimeInput(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function toIso(date: string, time: string) {
  return new Date(`${date}T${time}:00`).toISOString();
}

function getDateKey(value: string) {
  return toLocalDateInput(new Date(value));
}

function formatDay(value: string) {
  return new Intl.DateTimeFormat("en-BD", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}

function formatFullDate(value: string) {
  return new Intl.DateTimeFormat("en-BD", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-BD", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function durationLabel(startTime: string, endTime: string) {
  const minutes = Math.max(
    0,
    Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000),
  );
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (hours === 0) return `${rest} min`;
  if (rest === 0) return `${hours} hr`;
  return `${hours} hr ${rest} min`;
}

function isEditable(slot: TechnicianAvailabilitySlot) {
  return (slot.status ?? "AVAILABLE") === "AVAILABLE";
}

function validateForm(form: SlotForm): FieldErrors {
  const errors: FieldErrors = {};

  if (!form.date) errors.date = "Select a date.";
  if (!form.startTime) errors.startTime = "Select a start time.";
  if (!form.endTime) errors.endTime = "Select an end time.";

  if (form.date && form.startTime && form.endTime) {
    const start = new Date(`${form.date}T${form.startTime}:00`);
    const end = new Date(`${form.date}T${form.endTime}:00`);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      errors.date = "Enter a valid date and time.";
    } else {
      if (start.getTime() <= Date.now()) {
        errors.startTime = "Start time must be in the future.";
      }
      if (end.getTime() <= start.getTime()) {
        errors.endTime = "End time must be later than the start time.";
      }
      if (end.getTime() - start.getTime() > 12 * 60 * 60 * 1000) {
        errors.endTime = "A single slot cannot be longer than 12 hours.";
      }
    }
  }

  return errors;
}

function AvailabilitySkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white" />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)]">
        <div className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        <div className="h-[520px] animate-pulse rounded-2xl border border-slate-200 bg-white" />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const normalized = status ?? "AVAILABLE";
  const classes =
    normalized === "BOOKED"
      ? "bg-blue-50 text-blue-700"
      : normalized === "AVAILABLE"
        ? "bg-emerald-50 text-emerald-700"
        : "bg-slate-100 text-slate-600";

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${classes}`}>
      {normalized.replaceAll("_", " ").toLowerCase()}
    </span>
  );
}

export function TechnicianAvailability() {
  const { session, isReady } = useAuthSession();
  const { toast } = useToast();
  const [slots, setSlots] = useState<TechnicianAvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedDate, setSelectedDate] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TechnicianAvailabilitySlot | null>(null);
  const [form, setForm] = useState<SlotForm>(emptyForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TechnicianAvailabilitySlot | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isReady || !session || session.user.role !== "TECHNICIAN") return;

    let cancelled = false;

    async function loadAvailability() {
      try {
        const response = await apiRequest<AvailabilityPayload>(
          "/api/technician/availability?page=1&limit=50",
          { token: session?.token },
        );

        if (cancelled) return;

        const now = Date.now();
        const sorted = unwrapSlots(response.data)
          .filter((slot) => new Date(slot.endTime).getTime() > now)
          .toSorted(
            (left, right) =>
              new Date(left.startTime).getTime() - new Date(right.startTime).getTime(),
          );
        setSlots(sorted);
      } catch (error) {
        if (!cancelled) toast(getApiErrorMessage(error), "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadAvailability();

    return () => {
      cancelled = true;
    };
  }, [isReady, refreshKey, session, toast]);

  const upcomingSlots = slots;

  const dateOptions = useMemo(() => {
    const keys = Array.from(new Set(upcomingSlots.map((slot) => getDateKey(slot.startTime))));
    return keys.slice(0, 10);
  }, [upcomingSlots]);

  const visibleSlots = useMemo(
    () =>
      selectedDate
        ? upcomingSlots.filter((slot) => getDateKey(slot.startTime) === selectedDate)
        : upcomingSlots,
    [selectedDate, upcomingSlots],
  );

  const groupedSlots = useMemo(() => {
    return visibleSlots.reduce<Record<string, TechnicianAvailabilitySlot[]>>(
      (groups, slot) => {
        const key = getDateKey(slot.startTime);
        groups[key] = [...(groups[key] ?? []), slot];
        return groups;
      },
      {},
    );
  }, [visibleSlots]);

  const summary = useMemo(() => {
    const available = upcomingSlots.filter((slot) => isEditable(slot)).length;
    const booked = upcomingSlots.filter((slot) => slot.status === "BOOKED").length;
    const next = upcomingSlots[0] ?? null;
    return { available, booked, next };
  }, [upcomingSlots]);

  function updateField<K extends keyof SlotForm>(key: K, value: SlotForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function openCreateEditor() {
    const baseDate = selectedDate || toLocalDateInput(new Date(Date.now() + 24 * 60 * 60 * 1000));
    setEditingSlot(null);
    setForm({ ...emptyForm, date: baseDate });
    setErrors({});
    setEditorOpen(true);
  }

  function openEditEditor(slot: TechnicianAvailabilitySlot) {
    const start = new Date(slot.startTime);
    const end = new Date(slot.endTime);

    setEditingSlot(slot);
    setForm({
      date: toLocalDateInput(start),
      startTime: toLocalTimeInput(start),
      endTime: toLocalTimeInput(end),
    });
    setErrors({});
    setEditorOpen(true);
  }

  function closeEditor() {
    if (saving) return;
    setEditorOpen(false);
    setEditingSlot(null);
    setForm(emptyForm);
    setErrors({});
  }

  async function submitSlot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) return;

    const nextErrors = validateForm(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast("Please correct the highlighted time-slot fields.", "error");
      return;
    }

    setSaving(true);
    setErrors({});

    const path = editingSlot
      ? `/api/technician/availability/${editingSlot.id}`
      : "/api/technician/availability";

    try {
      const response = await apiRequest<SlotPayload>(path, {
        method: editingSlot ? "PATCH" : "POST",
        token: session.token,
        body: {
          startTime: toIso(form.date, form.startTime),
          endTime: toIso(form.date, form.endTime),
          status: "AVAILABLE",
        },
      });

      const saved = unwrapSlot(response.data);
      setSlots((current) =>
        (editingSlot
          ? current.map((slot) => (slot.id === editingSlot.id ? saved : slot))
          : [...current, saved]
        ).toSorted(
          (left, right) =>
            new Date(left.startTime).getTime() - new Date(right.startTime).getTime(),
        ),
      );
      setSelectedDate(getDateKey(saved.startTime));
      toast(
        editingSlot ? "Availability updated successfully." : "Availability added successfully.",
        "success",
      );
      closeEditor();
    } catch (error) {
      setErrors(getApiFieldErrors(error));
      toast(getApiErrorMessage(error), "error");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!session || !deleteTarget) return;

    setDeleting(true);
    try {
      await apiRequest<TechnicianAvailabilitySlot | null>(
        `/api/technician/availability/${deleteTarget.id}`,
        {
          method: "DELETE",
          token: session.token,
        },
      );
      setSlots((current) => current.filter((slot) => slot.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast("Availability removed successfully.", "success");
    } catch (error) {
      toast(getApiErrorMessage(error), "error");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <AvailabilitySkeleton />;

  return (
    <div className="space-y-6">
      <section className="dashboard-tint-card rounded-[28px] p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
              Working schedule
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Availability
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Publish the time blocks customers can choose when requesting a service.
              Booked slots remain visible but cannot be changed.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
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
            <button
              type="button"
              onClick={openCreateEditor}
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Add time slot
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="dashboard-tint-card rounded-2xl p-5">
          <p className="text-sm text-slate-500">Available slots</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{summary.available}</p>
        </div>
        <div className="dashboard-soft-accent rounded-2xl p-5">
          <p className="text-sm text-slate-500">Booked slots</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{summary.booked}</p>
        </div>
        <div className="dashboard-warm-card rounded-2xl p-5">
          <p className="text-sm text-slate-500">Next working time</p>
          <p className="mt-2 text-base font-bold text-slate-950">
            {summary.next ? formatDay(summary.next.startTime) : "No upcoming slot"}
          </p>
          {summary.next ? (
            <p className="mt-1 text-sm text-slate-500">
              {formatTime(summary.next.startTime)}–{formatTime(summary.next.endTime)}
            </p>
          ) : null}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)]">
        <section className="dashboard-surface h-fit rounded-2xl p-5 sm:p-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-950">Schedule by day</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Filter upcoming slots to focus on a specific working day.
            </p>
          </div>

          <div className="mt-4 space-y-2">
            <button
              type="button"
              onClick={() => setSelectedDate("")}
              className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${
                selectedDate === ""
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                  : "border-slate-200 text-slate-700 hover:border-slate-300"
              }`}
            >
              <span>All upcoming</span>
              <span className="text-xs font-medium text-slate-500">{upcomingSlots.length}</span>
            </button>

            {dateOptions.map((date) => {
              const count = upcomingSlots.filter(
                (slot) => getDateKey(slot.startTime) === date,
              ).length;
              return (
                <button
                  key={date}
                  type="button"
                  onClick={() => setSelectedDate(date)}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${
                    selectedDate === date
                      ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                      : "border-slate-200 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <span>{formatDay(`${date}T12:00:00`)}</span>
                  <span className="text-xs font-medium text-slate-500">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 rounded-xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-800">Scheduling note</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Times are entered in your device&apos;s local timezone. Remove unused
              slots before customers book them.
            </p>
          </div>
        </section>

        <section className="dashboard-surface rounded-2xl p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                {selectedDate
                  ? formatFullDate(`${selectedDate}T12:00:00`)
                  : "Upcoming time slots"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {visibleSlots.length} {visibleSlots.length === 1 ? "slot" : "slots"}
              </p>
            </div>
            <button
              type="button"
              onClick={openCreateEditor}
              className="rounded-xl border border-emerald-300 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
            >
              Add for this day
            </button>
          </div>

          {visibleSlots.length === 0 ? (
            <div className="py-14 text-center">
              <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-emerald-50 text-xl text-emerald-700">
                +
              </div>
              <h3 className="mt-4 font-semibold text-slate-950">No time slots here</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                Add a future working period so customers can request a booking.
              </p>
              <button
                type="button"
                onClick={openCreateEditor}
                className="mt-5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Add first slot
              </button>
            </div>
          ) : (
            <div className="mt-5 space-y-6">
              {Object.entries(groupedSlots).map(([date, daySlots]) => (
                <div key={date}>
                  {!selectedDate ? (
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {formatFullDate(`${date}T12:00:00`)}
                    </p>
                  ) : null}
                  <div className="space-y-3">
                    {daySlots.map((slot) => (
                      <article
                        key={slot.id}
                        className="rounded-2xl border border-slate-200 p-4 sm:p-5"
                      >
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-lg font-bold text-slate-950">
                                {formatTime(slot.startTime)}–{formatTime(slot.endTime)}
                              </p>
                              <StatusBadge status={slot.status} />
                            </div>
                            <p className="mt-1 text-sm text-slate-500">
                              {durationLabel(slot.startTime, slot.endTime)} working block
                            </p>
                          </div>

                          {isEditable(slot) ? (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => openEditEditor(slot)}
                                className="rounded-xl border border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(slot)}
                                className="rounded-xl border border-rose-200 px-3.5 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <p className="text-xs font-medium text-slate-500">
                              Linked to a booking
                            </p>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {editorOpen ? (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/40 p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="availability-editor-title"
        >
          <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-lg sm:rounded-2xl sm:p-6">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                  Working hours
                </p>
                <h2 id="availability-editor-title" className="mt-1 text-xl font-bold text-slate-950">
                  {editingSlot ? "Edit time slot" : "Add time slot"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeEditor}
                className="grid size-9 place-items-center rounded-xl border border-slate-200 text-lg text-slate-500 hover:bg-slate-50"
                aria-label="Close availability form"
              >
                ×
              </button>
            </div>

            <form onSubmit={submitSlot} noValidate className="mt-5 space-y-5">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Date</span>
                <input
                  type="date"
                  value={form.date}
                  min={toLocalDateInput(new Date())}
                  disabled={saving}
                  onChange={(event) => updateField("date", event.target.value)}
                  className={`mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:ring-4 ${
                    errors.date
                      ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                      : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-100"
                  }`}
                />
                {errors.date ? (
                  <span className="mt-1.5 block text-sm text-rose-600">{errors.date}</span>
                ) : null}
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Start time</span>
                  <input
                    type="time"
                    value={form.startTime}
                    disabled={saving}
                    onChange={(event) => updateField("startTime", event.target.value)}
                    className={`mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:ring-4 ${
                      errors.startTime
                        ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                        : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-100"
                    }`}
                  />
                  {errors.startTime ? (
                    <span className="mt-1.5 block text-sm text-rose-600">
                      {errors.startTime}
                    </span>
                  ) : null}
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">End time</span>
                  <input
                    type="time"
                    value={form.endTime}
                    disabled={saving}
                    onChange={(event) => updateField("endTime", event.target.value)}
                    className={`mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:ring-4 ${
                      errors.endTime
                        ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                        : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-100"
                    }`}
                  />
                  {errors.endTime ? (
                    <span className="mt-1.5 block text-sm text-rose-600">
                      {errors.endTime}
                    </span>
                  ) : null}
                </label>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                The backend checks overlapping slots and returns a toast-friendly error when
                the selected period conflicts with your existing availability.
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeEditor}
                  disabled={saving}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving…"
                    : editingSlot
                      ? "Save changes"
                      : "Publish slot"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <div
          className="fixed inset-0 z-[80] grid place-items-center bg-slate-950/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="remove-slot-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 id="remove-slot-title" className="text-xl font-bold text-slate-950">
              Remove this time slot?
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {formatFullDate(deleteTarget.startTime)}, {formatTime(deleteTarget.startTime)}–
              {formatTime(deleteTarget.endTime)} will no longer be available for customers.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                Keep slot
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? "Removing…" : "Remove slot"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
