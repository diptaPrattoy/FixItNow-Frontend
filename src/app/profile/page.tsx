"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";

import { useToast } from "@/components/providers/toast-provider";
import { UserAvatar } from "@/components/shared/user-avatar";
import { apiRequest } from "@/lib/api/client";
import { getApiErrorMessage, getApiFieldErrors } from "@/lib/api/errors";

import { getAuthSession } from "@/lib/auth/session";

type TechnicianProfile = {
  id: string;
  bio: string | null;
  experienceYears: number;
  location: string;
  averageRating: number | string;
  reviewCount: number;
  isVerified: boolean;
};

type ProfileData = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  role: "CUSTOMER" | "TECHNICIAN" | "ADMIN";
  status: "ACTIVE" | "BANNED";
  createdAt: string;
  updatedAt: string;
  technicianProfile: TechnicianProfile | null;
};

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<ProfileData | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [bio, setBio] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [location, setLocation] = useState("");

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  /*
   * Load current user.
   *
   * Your backend already provides:
   * GET /api/auth/me
   */
  useEffect(() => {
    async function loadProfile() {
      const authSession = getAuthSession();

      if (!authSession?.token) {
        toast("Please log in to access your profile.", "error");
        setIsLoading(false);
        router.push("/auth/login");
        return;
      }

      try {
        const response = await apiRequest<ProfileData>("/api/auth/me", {
          method: "GET",
          token: authSession.token,
        });

        const data = response.data;

        setProfile(data);

        setName(data.name);
        setEmail(data.email);
        setPhone(data.phone ?? "");
        setAvatarUrl(data.avatarUrl ?? null);

        if (data.technicianProfile) {
          setBio(data.technicianProfile.bio ?? "");
          setExperienceYears(
            String(data.technicianProfile.experienceYears ?? 0),
          );
          setLocation(data.technicianProfile.location ?? "");
        }
      } catch (error) {
        toast(getApiErrorMessage(error), "error");
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [router, toast]);

  function handleImageSelect(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast("Please select a valid image file.", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast("Image size must be less than 5 MB.", "error");
      return;
    }

    setSelectedImage(file);

    const previewUrl = URL.createObjectURL(file);
    setAvatarUrl(previewUrl);
  }

  async function handleAvatarUpload() {
    if (!selectedImage) {
      return;
    }

    const authSession = getAuthSession();

    if (!authSession?.token) {
      toast("Please log in again.", "error");
      router.push("/auth/login");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("avatar", selectedImage);

      const response = await apiRequest<ProfileData>(
        "/api/auth/profile/avatar",
        {
          method: "PATCH",
          body: formData,
          token: authSession.token,
        },
      );

      const updatedProfile = response.data;

      console.log("Updated profile:", updatedProfile);

      setProfile(updatedProfile);
      setName(updatedProfile.name ?? "");
      setEmail(updatedProfile.email ?? "");
      setPhone(updatedProfile.phone ?? "");
      setAvatarUrl(updatedProfile.avatarUrl ?? null);

      if (updatedProfile.technicianProfile) {
        setBio(updatedProfile.technicianProfile.bio ?? "");
        setExperienceYears(
          String(updatedProfile.technicianProfile.experienceYears ?? 0),
        );
        setLocation(updatedProfile.technicianProfile.location ?? "");
      }

      setSelectedImage(null);

      toast("Profile picture updated successfully.", "success");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      toast(getApiErrorMessage(error), "error");

      setAvatarUrl(profile?.avatarUrl ?? null);
    } finally {
      setIsUploading(false);
    }
  }
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setFieldErrors({});
    setIsSaving(true);

    try {
      const body: Record<string, unknown> = {
        name: name.trim(),
        phone: phone.trim() || null,
      };

      if (profile?.role === "TECHNICIAN") {
        body.bio = bio.trim() || null;
        body.experienceYears = Number(experienceYears) || 0;
        body.location = location.trim();
      }

      const authSession = getAuthSession();

      if (!authSession?.token) {
        toast("Your session has expired. Please log in again.", "error");
        router.push("/auth/login");
        return;
      }

      const response = await apiRequest<ProfileData>("/api/auth/profile", {
        method: "PATCH",
        body,
        token: authSession.token,
      });
      const updatedProfile = response.data;

      setProfile(updatedProfile);

      setName(updatedProfile.name);
      setEmail(updatedProfile.email);
      setPhone(updatedProfile.phone ?? "");
      setAvatarUrl(updatedProfile.avatarUrl ?? null);

      if (updatedProfile.technicianProfile) {
        setBio(updatedProfile.technicianProfile.bio ?? "");

        setExperienceYears(
          String(updatedProfile.technicianProfile.experienceYears ?? 0),
        );

        setLocation(updatedProfile.technicianProfile.location ?? "");
      }

      toast("Your profile has been updated successfully.", "success");
    } catch (error) {
      setFieldErrors(getApiFieldErrors(error));
      toast(getApiErrorMessage(error), "error");
    } finally {
      setIsSaving(false);
    }
  }
  if (isLoading) {
    return (
      <main className="min-h-[70vh] bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl animate-pulse">
          <div className="h-8 w-40 rounded-lg bg-slate-200" />
          <div className="mt-2 h-4 w-72 rounded bg-slate-200" />

          <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
            <div className="h-80 rounded-2xl bg-white" />
            <div className="h-[500px] rounded-2xl bg-white" />
          </div>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="grid min-h-[70vh] place-items-center bg-slate-50 px-4">
        <div className="text-center">
          <h1 className="text-xl font-bold text-slate-900">
            Unable to load profile
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Please refresh the page and try again.
          </p>

          <button
            type="button"
            onClick={() => router.refresh()}
            className="mt-5 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

//   const isTechnician = profile.role === "TECHNICIAN";

//   const roleLabel = profile.role
//     ? profile.role.charAt(0) + profile.role.slice(1).toLowerCase()
//     : "User";

const role = profile.role ?? "CUSTOMER";
const roleLabel =
  role.charAt(0) + role.slice(1).toLowerCase();
const isTechnician = role === "TECHNICIAN";

  const technician = profile.technicianProfile;

  const rating = technician
    ? Number(technician.averageRating).toFixed(1)
    : "0.0";

  return (
    <main className="min-h-[calc(100vh-72px)] bg-slate-50 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Page heading */}
        <div>
          <p className="text-sm font-semibold text-emerald-600">
            Account settings
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            My Profile
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Manage your personal information and profile picture.
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Profile card */}
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <UserAvatar
                  name={name || profile.name}
                  src={avatarUrl || undefined}
                  size={112}
                  className="rounded-3xl bg-emerald-100 text-2xl text-emerald-700"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 grid size-9 place-items-center rounded-xl border-2 border-white bg-emerald-600 text-white shadow-md transition hover:bg-emerald-700"
                  aria-label="Change profile picture"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="size-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path
                      d="M4 7h3l1.5-2h7L17 7h3v12H4V7Z"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="13" r="3.5" />
                  </svg>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleImageSelect}
                className="hidden"
              />

              <h2 className="mt-5 max-w-full truncate text-lg font-bold text-slate-900">
                {name || profile.name}
              </h2>

              <p className="mt-1 text-sm capitalize text-slate-500">
                {roleLabel} account
              </p>

              <span
                className={`mt-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                  profile.status === "ACTIVE"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-rose-50 text-rose-700"
                }`}
              >
                {profile.status === "ACTIVE" ? "Active" : "Banned"}
              </span>

              {selectedImage ? (
                <div className="mt-5 w-full">
                  <p className="mb-2 truncate text-xs text-slate-500">
                    {selectedImage.name}
                  </p>

                  <button
                    type="button"
                    onClick={handleAvatarUpload}
                    disabled={isUploading}
                    className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isUploading ? "Uploading..." : "Save profile picture"}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  Change picture
                </button>
              )}

              <p className="mt-3 text-xs leading-5 text-slate-400">
                PNG, JPG or WebP. Maximum size 5 MB.
              </p>
            </div>

            {/* Technician stats */}
            {isTechnician && technician && (
              <div className="mt-6 border-t border-slate-100 pt-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">
                    Rating
                  </span>

                  <span className="text-sm font-bold text-slate-900">
                    {rating} ★
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">
                    Reviews
                  </span>

                  <span className="text-sm font-semibold text-slate-700">
                    {technician.reviewCount}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">
                    Verification
                  </span>

                  <span
                    className={`text-xs font-semibold ${
                      technician.isVerified
                        ? "text-emerald-600"
                        : "text-amber-600"
                    }`}
                  >
                    {technician.isVerified ? "Verified" : "Not verified"}
                  </span>
                </div>
              </div>
            )}
          </aside>

          {/* Profile form */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="border-b border-slate-100 pb-5">
              <h2 className="text-lg font-bold text-slate-900">
                Personal information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Update the information associated with your FixItNow account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-6" noValidate>
              {/* Name + Email */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Full name
                  </label>

                  <input
                    id="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 ${
                      fieldErrors.name ? "border-rose-300" : "border-slate-200"
                    }`}
                    placeholder="Your full name"
                  />

                  {fieldErrors.name && (
                    <p className="mt-1.5 text-xs text-rose-600">
                      {fieldErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Email address
                  </label>

                  <input
                    id="email"
                    value={email}
                    readOnly
                    className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 outline-none"
                  />

                  <p className="mt-1.5 text-xs text-slate-400">
                    Email cannot be changed here.
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Phone number
                </label>

                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="+880 1XXXXXXXXX"
                  className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 ${
                    fieldErrors.phone ? "border-rose-300" : "border-slate-200"
                  }`}
                />

                {fieldErrors.phone && (
                  <p className="mt-1.5 text-xs text-rose-600">
                    {fieldErrors.phone}
                  </p>
                )}
              </div>

              {/* Technician fields */}
              {isTechnician && (
                <>
                  <div className="border-t border-slate-100 pt-6">
                    <h3 className="text-base font-bold text-slate-900">
                      Professional information
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      This information is shown on your technician profile.
                    </p>
                  </div>

                  {/* Bio */}
                  <div>
                    <label
                      htmlFor="bio"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Professional bio
                    </label>

                    <textarea
                      id="bio"
                      value={bio}
                      onChange={(event) => setBio(event.target.value)}
                      rows={5}
                      placeholder="Tell customers about your experience and expertise..."
                      className={`w-full resize-none rounded-xl border bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 ${
                        fieldErrors.bio ? "border-rose-300" : "border-slate-200"
                      }`}
                    />

                    {fieldErrors.bio && (
                      <p className="mt-1.5 text-xs text-rose-600">
                        {fieldErrors.bio}
                      </p>
                    )}
                  </div>

                  {/* Experience + Location */}
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="experienceYears"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        Years of experience
                      </label>

                      <input
                        id="experienceYears"
                        type="number"
                        min="0"
                        max="60"
                        value={experienceYears}
                        onChange={(event) =>
                          setExperienceYears(event.target.value)
                        }
                        className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 ${
                          fieldErrors.experienceYears
                            ? "border-rose-300"
                            : "border-slate-200"
                        }`}
                      />

                      {fieldErrors.experienceYears && (
                        <p className="mt-1.5 text-xs text-rose-600">
                          {fieldErrors.experienceYears}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="location"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        Service location
                      </label>

                      <input
                        id="location"
                        value={location}
                        onChange={(event) => setLocation(event.target.value)}
                        placeholder="Dhaka"
                        className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 ${
                          fieldErrors.location
                            ? "border-rose-300"
                            : "border-slate-200"
                        }`}
                      />

                      {fieldErrors.location && (
                        <p className="mt-1.5 text-xs text-rose-600">
                          {fieldErrors.location}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Account information */}
              <div className="border-t border-slate-100 pt-6">
                <h3 className="text-base font-bold text-slate-900">
                  Account information
                </h3>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-400">
                      Account type
                    </p>

                    <p className="mt-1 text-sm font-semibold capitalize text-slate-800">
                      {roleLabel}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-400">
                      Account status
                    </p>

                    <p
                      className={`mt-1 text-sm font-semibold ${
                        profile.status === "ACTIVE"
                          ? "text-emerald-600"
                          : "text-rose-600"
                      }`}
                    >
                      {profile.status === "ACTIVE" ? "Active" : "Banned"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? "Saving changes..." : "Save changes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
