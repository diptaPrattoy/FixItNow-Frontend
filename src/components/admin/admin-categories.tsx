"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";

import { FormField } from "@/components/auth/form-field";
import { useToast } from "@/components/providers/toast-provider";
import { useAuthSession } from "@/hooks/use-auth-session";
import { apiRequest } from "@/lib/api/client";
import { getApiErrorMessage, getApiFieldErrors } from "@/lib/api/errors";
import type { Category } from "@/types/api";

type CategoryForm = {
  name: string;
  description: string;
};

type FieldErrors = Partial<Record<keyof CategoryForm, string>>;
type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE";

const emptyForm: CategoryForm = {
  name: "",
  description: "",
};

function isCategoryActive(category: Category) {
  return category.isActive !== false;
}

function validateCategory(form: CategoryForm): FieldErrors {
  const errors: FieldErrors = {};

  if (form.name.trim().length < 2) {
    errors.name = "Category name must contain at least 2 characters.";
  }

  if (form.name.trim().length > 100) {
    errors.name = "Category name must not exceed 100 characters.";
  }

  if (form.description.trim().length > 1000) {
    errors.description = "Description must not exceed 1000 characters.";
  }

  return errors;
}

function CategoryStatusBadge({ category }: { category: Category }) {
  const active = isCategoryActive(category);

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function CategoriesSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-56 animate-pulse rounded-2xl border border-slate-200 bg-white"
        />
      ))}
    </div>
  );
}

function EmptyCategories({ filtered }: { filtered: boolean }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <p className="text-lg font-semibold text-slate-950">
        {filtered ? "No categories match these filters" : "No categories yet"}
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {filtered
          ? "Try another search term or status filter."
          : "Create the first service category to organize technician listings."}
      </p>
    </div>
  );
}

function CategoryEditor({
  open,
  category,
  form,
  errors,
  saving,
  onClose,
  onChange,
  onSubmit,
}: {
  open: boolean;
  category: Category | null;
  form: CategoryForm;
  errors: FieldErrors;
  saving: boolean;
  onClose: () => void;
  onChange: (key: keyof CategoryForm, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/40 p-0 sm:items-center sm:p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-editor-title"
        className="w-full rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-lg sm:rounded-2xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
              Category details
            </p>
            <h2
              id="category-editor-title"
              className="mt-2 text-2xl font-bold tracking-tight text-slate-950"
            >
              {category ? "Edit category" : "Create category"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg px-2 py-1 text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
            aria-label="Close category form"
          >
            ×
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          <FormField
            id="category-name"
            label="Category name"
            value={form.name}
            placeholder="For example, Electrical"
            error={errors.name}
            onChange={(event) => onChange("name", event.target.value)}
          />

          <label className="block" htmlFor="category-description">
            <span className="text-sm font-semibold text-slate-700">
              Description <span className="font-normal text-slate-400">(optional)</span>
            </span>
            <textarea
              id="category-description"
              value={form.description}
              rows={5}
              maxLength={1000}
              placeholder="Describe the type of services included in this category."
              aria-invalid={Boolean(errors.description)}
              aria-describedby={
                errors.description ? "category-description-error" : undefined
              }
              onChange={(event) => onChange("description", event.target.value)}
              className={`mt-2 w-full resize-y rounded-xl border bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                errors.description
                  ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                  : "border-slate-300 focus:border-emerald-500 focus:ring-emerald-100"
              }`}
            />
            <div className="mt-1.5 flex items-start justify-between gap-4">
              {errors.description ? (
                <span id="category-description-error" className="text-sm text-rose-600">
                  {errors.description}
                </span>
              ) : (
                <span />
              )}
              <span className="text-xs text-slate-400">
                {form.description.length}/1000
              </span>
            </div>
          </label>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : category
                  ? "Save changes"
                  : "Create category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StatusConfirmation({
  category,
  busy,
  onCancel,
  onConfirm,
}: {
  category: Category | null;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!category) return null;

  const deactivating = isCategoryActive(category);

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/40 p-4">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="category-status-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <h2 id="category-status-title" className="text-xl font-bold text-slate-950">
          {deactivating ? "Deactivate category?" : "Activate category?"}
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {deactivating
            ? `${category.name} will stop appearing as an active choice for new services. Existing services remain unchanged.`
            : `${category.name} will become available for technician service creation again.`}
        </p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
              deactivating
                ? "bg-rose-600 hover:bg-rose-700"
                : "bg-emerald-700 hover:bg-emerald-800"
            }`}
          >
            {busy
              ? "Updating..."
              : deactivating
                ? "Deactivate"
                : "Activate"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminCategories() {
  const { toast } = useToast();
  const { session, isReady } = useAuthSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [statusTarget, setStatusTarget] = useState<Category | null>(null);
  const [statusBusy, setStatusBusy] = useState(false);

  useEffect(() => {
    if (!isReady || !session || session.user.role !== "ADMIN") return;

    const token = session.token;
    let cancelled = false;

    async function loadCategories() {
      try {
        const response = await apiRequest<Category[]>("/api/admin/categories", {
          token,
        });

        if (!cancelled) setCategories(response.data);
      } catch (error) {
        if (!cancelled) {
          setCategories([]);
          toast(getApiErrorMessage(error), "error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadCategories();

    return () => {
      cancelled = true;
    };
  }, [isReady, refreshKey, session, toast]);

  const summary = useMemo(() => {
    const active = categories.filter(isCategoryActive).length;
    const services = categories.reduce(
      (total, category) => total + (category._count?.services ?? 0),
      0,
    );

    return {
      active,
      inactive: categories.length - active,
      services,
    };
  }, [categories]);

  const visibleCategories = useMemo(() => {
    const term = search.trim().toLowerCase();

    return categories.filter((category) => {
      const matchesSearch =
        !term ||
        category.name.toLowerCase().includes(term) ||
        category.slug.toLowerCase().includes(term) ||
        category.description?.toLowerCase().includes(term);
      const active = isCategoryActive(category);
      const matchesStatus =
        status === "ALL" ||
        (status === "ACTIVE" && active) ||
        (status === "INACTIVE" && !active);

      return matchesSearch && matchesStatus;
    });
  }, [categories, search, status]);

  const hasFilters = Boolean(search.trim()) || status !== "ALL";

  function refreshCategories() {
    setLoading(true);
    setRefreshKey((current) => current + 1);
  }

  function openCreateEditor() {
    setEditingCategory(null);
    setForm(emptyForm);
    setFieldErrors({});
    setEditorOpen(true);
  }

  function openEditEditor(category: Category) {
    setEditingCategory(category);
    setForm({
      name: category.name,
      description: category.description ?? "",
    });
    setFieldErrors({});
    setEditorOpen(true);
  }

  function closeEditor() {
    if (saving) return;
    setEditorOpen(false);
    setEditingCategory(null);
    setForm(emptyForm);
    setFieldErrors({});
  }

  function updateForm(key: keyof CategoryForm, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function submitCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) return;

    const errors = validateCategory(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast("Please correct the highlighted category fields.", "error");
      return;
    }

    setSaving(true);
    setFieldErrors({});

    try {
      await apiRequest<Category>(
        editingCategory
          ? `/api/admin/categories/${editingCategory.id}`
          : "/api/admin/categories",
        {
          method: editingCategory ? "PATCH" : "POST",
          token: session.token,
          body: {
            name: form.name.trim(),
            description: form.description.trim() || null,
          },
        },
      );

      toast(
        editingCategory
          ? "Category updated successfully."
          : "Category created successfully.",
        "success",
      );
      setEditorOpen(false);
      setEditingCategory(null);
      setForm(emptyForm);
      setFieldErrors({});
      refreshCategories();
    } catch (error) {
      setFieldErrors(getApiFieldErrors(error));
      toast(getApiErrorMessage(error), "error");
    } finally {
      setSaving(false);
    }
  }

  async function confirmStatusChange() {
    if (!session || !statusTarget) return;

    const nextStatus = !isCategoryActive(statusTarget);
    setStatusBusy(true);

    try {
      await apiRequest<Category>(`/api/admin/categories/${statusTarget.id}`, {
        method: "PATCH",
        token: session.token,
        body: { isActive: nextStatus },
      });

      toast(
        nextStatus
          ? `${statusTarget.name} is active again.`
          : `${statusTarget.name} has been deactivated.`,
        "success",
      );
      setStatusTarget(null);
      refreshCategories();
    } catch (error) {
      toast(getApiErrorMessage(error), "error");
    } finally {
      setStatusBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
              Category management
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Organize marketplace services
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Create clear service groups and control which categories technicians can use for new listings.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={refreshCategories}
              disabled={loading}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={openCreateEditor}
              className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              Add category
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-500">Active categories</p>
            <p className="mt-2 text-2xl font-bold text-slate-950">{summary.active}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-500">Inactive categories</p>
            <p className="mt-2 text-2xl font-bold text-slate-950">{summary.inactive}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-500">Linked services</p>
            <p className="mt-2 text-2xl font-bold text-slate-950">{summary.services}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px_auto]">
          <label className="block">
            <span className="sr-only">Search categories</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search categories"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />
          </label>
          <label className="block">
            <span className="sr-only">Filter by status</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as StatusFilter)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            >
              <option value="ALL">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </label>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setStatus("ALL");
            }}
            disabled={!hasFilters}
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Clear
          </button>
        </div>
      </section>

      {loading ? (
        <CategoriesSkeleton />
      ) : visibleCategories.length === 0 ? (
        <EmptyCategories filtered={hasFilters} />
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleCategories.map((category) => {
            const active = isCategoryActive(category);

            return (
              <article
                key={category.id}
                className="flex min-h-56 flex-col rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-bold text-slate-950">
                      {category.name}
                    </h2>
                    <p className="mt-1 truncate text-xs font-medium text-slate-400">
                      {category.slug}
                    </p>
                  </div>
                  <CategoryStatusBadge category={category} />
                </div>

                <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
                  {category.description || "No description has been added yet."}
                </p>

                <div className="mt-auto pt-5">
                  <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                    <p className="text-sm text-slate-500">
                      <span className="font-semibold text-slate-800">
                        {category._count?.services ?? 0}
                      </span>{" "}
                      linked {(category._count?.services ?? 0) === 1 ? "service" : "services"}
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEditEditor(category)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatusTarget(category)}
                        className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                          active
                            ? "border-rose-200 text-rose-700 hover:bg-rose-50"
                            : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        }`}
                      >
                        {active ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      <CategoryEditor
        open={editorOpen}
        category={editingCategory}
        form={form}
        errors={fieldErrors}
        saving={saving}
        onClose={closeEditor}
        onChange={updateForm}
        onSubmit={submitCategory}
      />

      <StatusConfirmation
        category={statusTarget}
        busy={statusBusy}
        onCancel={() => {
          if (!statusBusy) setStatusTarget(null);
        }}
        onConfirm={confirmStatusChange}
      />
    </div>
  );
}
