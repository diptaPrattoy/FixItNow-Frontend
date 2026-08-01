"use client";

import { useEffect, useMemo, useState } from "react";

import { useToast } from "@/components/providers/toast-provider";
import { Pagination } from "@/components/public/pagination";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { apiRequest } from "@/lib/api/client";
import { getApiErrorMessage } from "@/lib/api/errors";
import type {
  AdminUser,
  PaginationMeta,
  UserRole,
  UserStatus,
} from "@/types/api";

const defaultMeta: PaginationMeta = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

const roleOptions: Array<{ value: "ALL" | UserRole; label: string }> = [
  { value: "ALL", label: "All roles" },
  { value: "CUSTOMER", label: "Customers" },
  { value: "TECHNICIAN", label: "Technicians" },
  { value: "ADMIN", label: "Admins" },
];

const statusOptions: Array<{ value: "ALL" | UserStatus; label: string }> = [
  { value: "ALL", label: "All statuses" },
  { value: "ACTIVE", label: "Active" },
  { value: "BANNED", label: "Banned" },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function roleLabel(role: UserRole) {
  if (role === "TECHNICIAN") return "Technician";
  if (role === "CUSTOMER") return "Customer";
  return "Admin";
}

function UserStatusBadge({ status }: { status: UserStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        status === "ACTIVE"
          ? "bg-emerald-50 text-emerald-700"
          : "bg-rose-50 text-rose-700"
      }`}
    >
      {status === "ACTIVE" ? "Active" : "Banned"}
    </span>
  );
}

function RoleBadge({ role }: { role: UserRole }) {
  const className =
    role === "ADMIN"
      ? "bg-violet-50 text-violet-700"
      : role === "TECHNICIAN"
        ? "bg-sky-50 text-sky-700"
        : "bg-slate-100 text-slate-600";

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>
      {roleLabel(role)}
    </span>
  );
}

function UsersSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white"
        />
      ))}
    </div>
  );
}

function EmptyUsers({ filtered }: { filtered: boolean }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <p className="text-lg font-semibold text-slate-950">
        {filtered ? "No users match these filters" : "No users found"}
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {filtered
          ? "Try a different search term, role, or account status."
          : "Registered accounts will appear here."}
      </p>
    </div>
  );
}

function ModerationButton({
  user,
  currentUserId,
  busy,
  onSelect,
}: {
  user: AdminUser;
  currentUserId: string;
  busy: boolean;
  onSelect: (user: AdminUser) => void;
}) {
  if (user.role === "ADMIN" || user.id === currentUserId) {
    return <span className="text-xs font-medium text-slate-400">Protected account</span>;
  }

  const banning = user.status === "ACTIVE";

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => onSelect(user)}
      className={`rounded-lg border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
        banning
          ? "border-rose-200 text-rose-700 hover:bg-rose-50"
          : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
      }`}
    >
      {busy ? "Updating..." : banning ? "Ban user" : "Unban user"}
    </button>
  );
}

export function AdminUsers() {
  const { toast } = useToast();
  const { session, isReady } = useAuthSession();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [meta, setMeta] = useState(defaultMeta);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<"ALL" | UserRole>("ALL");
  const [status, setStatus] = useState<"ALL" | UserStatus>("ALL");
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search.trim(), 350);

  useEffect(() => {
    if (!isReady || !session || session.user.role !== "ADMIN") {
      return;
    }

    const token = session.token;
    let cancelled = false;
    const query = new URLSearchParams({
      page: String(page),
      limit: "10",
    });

    if (debouncedSearch) query.set("search", debouncedSearch);
    if (role !== "ALL") query.set("role", role);
    if (status !== "ALL") query.set("status", status);

    async function loadUsers() {
      try {
        const response = await apiRequest<AdminUser[]>(
          `/api/admin/users?${query.toString()}`,
          { token },
        );

        if (!cancelled) {
          setUsers(response.data);
          setMeta(response.meta ?? defaultMeta);
        }
      } catch (error) {
        if (!cancelled) {
          setUsers([]);
          setMeta(defaultMeta);
          toast(getApiErrorMessage(error), "error");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadUsers();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, isReady, page, refreshKey, role, session, status, toast]);

  const summary = useMemo(() => {
    return {
      active: users.filter((user) => user.status === "ACTIVE").length,
      technicians: users.filter((user) => user.role === "TECHNICIAN").length,
      banned: users.filter((user) => user.status === "BANNED").length,
    };
  }, [users]);

  const hasFilters = Boolean(search.trim()) || role !== "ALL" || status !== "ALL";

  function changeSearch(value: string) {
    setLoading(true);
    setPage(1);
    setSearch(value);
  }

  function changeRole(value: "ALL" | UserRole) {
    setLoading(true);
    setPage(1);
    setRole(value);
  }

  function changeStatus(value: "ALL" | UserStatus) {
    setLoading(true);
    setPage(1);
    setStatus(value);
  }

  function changePage(nextPage: number) {
    setLoading(true);
    setPage(nextPage);
  }

  function clearFilters() {
    setLoading(true);
    setPage(1);
    setSearch("");
    setRole("ALL");
    setStatus("ALL");
  }

  function refreshUsers() {
    setLoading(true);
    setRefreshKey((current) => current + 1);
  }

  async function confirmStatusChange() {
    if (!session || !selectedUser) return;

    const targetStatus: UserStatus =
      selectedUser.status === "ACTIVE" ? "BANNED" : "ACTIVE";

    setUpdatingId(selectedUser.id);

    try {
      const response = await apiRequest<AdminUser>(
        `/api/admin/users/${selectedUser.id}`,
        {
          method: "PATCH",
          token: session.token,
          body: { status: targetStatus },
        },
      );

      setUsers((current) =>
        current.map((user) => (user.id === response.data.id ? response.data : user)),
      );
      toast(
        targetStatus === "BANNED"
          ? `${selectedUser.name} has been banned.`
          : `${selectedUser.name} has been unbanned.`,
        "success",
      );
      setSelectedUser(null);
    } catch (error) {
      toast(getApiErrorMessage(error), "error");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
              User management
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
              Review platform accounts
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Search customers and technicians, inspect account activity, and restrict access when moderation is required.
            </p>
          </div>
          <button
            type="button"
            onClick={refreshUsers}
            disabled={loading}
            className="w-fit rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Refresh
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-500">Active on this page</p>
            <p className="mt-2 text-2xl font-bold text-slate-950">{summary.active}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-500">Technicians on this page</p>
            <p className="mt-2 text-2xl font-bold text-slate-950">{summary.technicians}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-500">Banned on this page</p>
            <p className="mt-2 text-2xl font-bold text-slate-950">{summary.banned}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px_auto]">
          <label className="block">
            <span className="sr-only">Search users</span>
            <input
              type="search"
              value={search}
              onChange={(event) => changeSearch(event.target.value)}
              placeholder="Search name, email, phone or location"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />
          </label>

          <label className="block">
            <span className="sr-only">Filter by role</span>
            <select
              value={role}
              onChange={(event) => changeRole(event.target.value as "ALL" | UserRole)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="sr-only">Filter by status</span>
            <select
              value={status}
              onChange={(event) => changeStatus(event.target.value as "ALL" | UserStatus)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={clearFilters}
            disabled={!hasFilters}
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Clear
          </button>
        </div>
      </section>

      {loading ? (
        <UsersSkeleton />
      ) : users.length === 0 ? (
        <EmptyUsers filtered={hasFilters} />
      ) : (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
          <div className="space-y-3 md:hidden">
            {users.map((user) => (
              <article key={user.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-950">{user.name}</p>
                    <p className="mt-1 truncate text-sm text-slate-500">{user.email}</p>
                  </div>
                  <UserStatusBadge status={user.status} />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <RoleBadge role={user.role} />
                  {user.technicianProfile?.isVerified ? (
                    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      Verified
                    </span>
                  ) : null}
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-xs text-slate-400">Joined</dt>
                    <dd className="mt-1 font-medium text-slate-700">{formatDate(user.createdAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-400">Activity</dt>
                    <dd className="mt-1 font-medium text-slate-700">
                      {user._count.customerBookings} bookings
                    </dd>
                  </div>
                </dl>

                {user.technicianProfile?.location ? (
                  <p className="mt-3 text-sm text-slate-500">
                    Working in {user.technicianProfile.location}
                  </p>
                ) : null}

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <span className="text-xs text-slate-400">
                    {user.phone ?? "No phone number"}
                  </span>
                  <ModerationButton
                    user={user}
                    currentUserId={session?.user.id ?? ""}
                    busy={updatingId === user.id}
                    onSelect={setSelectedUser}
                  />
                </div>
              </article>
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-3 py-3 font-semibold">User</th>
                  <th className="px-3 py-3 font-semibold">Role</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="px-3 py-3 font-semibold">Activity</th>
                  <th className="px-3 py-3 font-semibold">Joined</th>
                  <th className="px-3 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-3 py-4 align-top">
                      <p className="font-semibold text-slate-900">{user.name}</p>
                      <a
                        href={`mailto:${user.email}`}
                        className="mt-1 block text-xs text-slate-500 hover:text-emerald-700"
                      >
                        {user.email}
                      </a>
                      {user.phone ? (
                        <a
                          href={`tel:${user.phone}`}
                          className="mt-1 block text-xs text-slate-500 hover:text-emerald-700"
                        >
                          {user.phone}
                        </a>
                      ) : null}
                    </td>
                    <td className="px-3 py-4 align-top">
                      <RoleBadge role={user.role} />
                      {user.technicianProfile?.location ? (
                        <p className="mt-2 text-xs text-slate-500">
                          {user.technicianProfile.location}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-3 py-4 align-top">
                      <UserStatusBadge status={user.status} />
                    </td>
                    <td className="px-3 py-4 align-top text-xs leading-5 text-slate-500">
                      <p>{user._count.customerBookings} bookings</p>
                      <p>{user._count.payments} payments</p>
                      <p>{user._count.reviews} reviews</p>
                    </td>
                    <td className="px-3 py-4 align-top text-slate-600">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-3 py-4 align-top">
                      <ModerationButton
                        user={user}
                        currentUserId={session?.user.id ?? ""}
                        busy={updatingId === user.id}
                        onSelect={setSelectedUser}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination meta={meta} onPageChange={changePage} />
        </section>
      )}

      {selectedUser ? (
        <div
          className="fixed inset-0 z-[110] flex items-end justify-center bg-slate-950/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="moderation-dialog-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
              Account moderation
            </p>
            <h2 id="moderation-dialog-title" className="mt-2 text-xl font-bold text-slate-950">
              {selectedUser.status === "ACTIVE"
                ? `Ban ${selectedUser.name}?`
                : `Unban ${selectedUser.name}?`}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {selectedUser.status === "ACTIVE"
                ? "The user will be blocked from logging in and using protected API routes until an administrator restores the account."
                : "The user will regain access to login and protected platform features."}
            </p>

            <div className="mt-5 rounded-xl bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">{selectedUser.email}</p>
              <p className="mt-1 text-sm text-slate-500">
                {roleLabel(selectedUser.role)} · Current status: {selectedUser.status.toLowerCase()}
              </p>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                disabled={Boolean(updatingId)}
                onClick={() => setSelectedUser(null)}
                className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={Boolean(updatingId)}
                onClick={() => void confirmStatusChange()}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  selectedUser.status === "ACTIVE"
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {updatingId
                  ? "Updating..."
                  : selectedUser.status === "ACTIVE"
                    ? "Ban user"
                    : "Unban user"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
