// "use client";

// import Link from "next/link";
// import { usePathname, useRouter } from "next/navigation";
// import { useState } from "react";

// import { useToast } from "@/components/providers/toast-provider";
// import { BrandLogo } from "@/components/shared/brand-logo";
// import { UserAvatar } from "@/components/shared/user-avatar";
// import { useAuthSession } from "@/hooks/use-auth-session";
// import { clearAuthSession, getDashboardPath } from "@/lib/auth/session";

// const links = [
//   { href: "/services", label: "Services" },
//   { href: "/technicians", label: "Technicians" },
//   { href: "/#how-it-works", label: "How it works" },
//   { href: "/contact", label: "Contact" },
//   { href: "/about", label: "About" },
// ];

// function isActive(pathname: string, href: string) {
//   if (href.includes("#")) return false;
//   return pathname === href || pathname.startsWith(`${href}/`);
// }

// function MenuIcon({ open }: { open: boolean }) {
//   return open ? (
//     <svg
//       viewBox="0 0 24 24"
//       className="size-5"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="1.8"
//       aria-hidden="true"
//     >
//       <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
//     </svg>
//   ) : (
//     <svg
//       viewBox="0 0 24 24"
//       className="size-5"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="1.8"
//       aria-hidden="true"
//     >
//       <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
//     </svg>
//   );
// }

// export function SiteHeader() {
//   const pathname = usePathname();
//   const { toast } = useToast();
//   const router = useRouter();
//   const { session } = useAuthSession();
//   const [menuOpen, setMenuOpen] = useState(false);

//   function handleLogout() {
//     clearAuthSession();
//     setMenuOpen(false);
//     toast("You have been logged out.", "success");
//     router.push("/");
//     router.refresh();
//   }

//   return (
//     <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
//       <div className="mx-auto flex min-h-18 max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
//         <BrandLogo />

//         <nav
//           className="hidden items-center gap-2 md:flex"
//           aria-label="Main navigation"
//         >
//           {links.map((link) => {
//             const active = isActive(pathname, link.href);
//             return (
//               <Link
//                 key={link.href}
//                 href={link.href}
//                 aria-current={active ? "page" : undefined}
//                 className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
//                   active
//                     ? "bg-emerald-50 text-emerald-800"
//                     : "text-slate-600 hover:bg-slate-50 hover:text-emerald-700"
//                 }`}
//               >
//                 {link.label}
//               </Link>
//             );
//           })}
//         </nav>

//         <div className="hidden items-center gap-2 md:flex">
//           {session ? (
//             <>
//               <Link
//                 href={getDashboardPath(session.user.role)}
//                 className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 py-2 pl-2 pr-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
//               >
//                 <UserAvatar
//                   name={session.user.name}
//                   src={session.user.avatarUrl}
//                   size={28}
//                   className="rounded-lg bg-white/20 text-white ring-white/30"
//                 />
//                 Dashboard
//               </Link>
//               <button
//                 type="button"
//                 onClick={handleLogout}
//                 className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
//               >
//                 Log out
//               </button>
//             </>
//           ) : (
//             <>
//               <Link
//                 href="/auth/login"
//                 className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
//               >
//                 Log in
//               </Link>
//               <Link
//                 href="/auth/register"
//                 className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
//               >
//                 Get started
//               </Link>
//             </>
//           )}
//         </div>

//         <button
//           type="button"
//           onClick={() => setMenuOpen((open) => !open)}
//           className="grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 md:hidden"
//           aria-label={menuOpen ? "Close navigation" : "Open navigation"}
//           aria-expanded={menuOpen}
//           aria-controls="mobile-site-navigation"
//         >
//           <MenuIcon open={menuOpen} />
//         </button>
//       </div>

//       {menuOpen ? (
//         <div
//           id="mobile-site-navigation"
//           className="border-t border-slate-100 bg-white px-4 py-4 shadow-lg shadow-slate-950/5 md:hidden"
//         >
//           <nav
//             className="mx-auto flex max-w-7xl flex-col gap-1"
//             aria-label="Mobile navigation"
//           >
//             {links.map((link) => {
//               const active = isActive(pathname, link.href);
//               return (
//                 <Link
//                   key={link.href}
//                   href={link.href}
//                   aria-current={active ? "page" : undefined}
//                   onClick={() => setMenuOpen(false)}
//                   className={`rounded-xl px-3 py-2.5 text-sm font-semibold ${
//                     active
//                       ? "bg-emerald-50 text-emerald-800"
//                       : "text-slate-700 hover:bg-slate-50 hover:text-emerald-700"
//                   }`}
//                 >
//                   {link.label}
//                 </Link>
//               );
//             })}
//             <div className="my-2 border-t border-slate-100" />
//             {session ? (
//               <>
//                 <div className="mb-2 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
//                   <UserAvatar
//                     name={session.user.name}
//                     src={session.user.avatarUrl}
//                     size={40}
//                     className="rounded-xl"
//                   />
//                   <div className="min-w-0">
//                     <p className="truncate text-sm font-semibold text-slate-900">
//                       {session.user.name}
//                     </p>
//                     <p className="text-xs capitalize text-slate-500">
//                       {session.user.role.toLowerCase()} account
//                     </p>
//                   </div>
//                 </div>
//                 <Link
//                   href={getDashboardPath(session.user.role)}
//                   onClick={() => setMenuOpen(false)}
//                   className="rounded-xl bg-emerald-600 px-3 py-2.5 text-center text-sm font-semibold text-white"
//                 >
//                   Open dashboard
//                 </Link>
//                 <button
//                   type="button"
//                   onClick={handleLogout}
//                   className="rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
//                 >
//                   Log out
//                 </button>
//               </>
//             ) : (
//               <div className="grid grid-cols-2 gap-2">
//                 <Link
//                   href="/auth/login"
//                   onClick={() => setMenuOpen(false)}
//                   className="rounded-xl border border-slate-300 px-3 py-2.5 text-center text-sm font-semibold text-slate-700"
//                 >
//                   Log in
//                 </Link>
//                 <Link
//                   href="/auth/register"
//                   onClick={() => setMenuOpen(false)}
//                   className="rounded-xl bg-emerald-600 px-3 py-2.5 text-center text-sm font-semibold text-white"
//                 >
//                   Get started
//                 </Link>
//               </div>
//             )}
//           </nav>
//         </div>
//       ) : null}
//     </header>
//   );
// }

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useToast } from "@/components/providers/toast-provider";
import { BrandLogo } from "@/components/shared/brand-logo";
import { UserAvatar } from "@/components/shared/user-avatar";
import { useAuthSession } from "@/hooks/use-auth-session";
import { clearAuthSession, getDashboardPath } from "@/lib/auth/session";

const links = [
  { href: "/services", label: "Services" },
  { href: "/technicians", label: "Technicians" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/contact", label: "Contact" },
  { href: "/about", label: "About" },
];

function isActive(pathname: string, href: string) {
  if (href.includes("#")) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function MenuIcon({ open }: { open: boolean }) {
  return open ? (
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  ) : (
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`size-4 transition-transform duration-200 ${
        open ? "rotate-180" : ""
      }`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="3" />
      <path d="M5 21a7 7 0 0 1 14 0" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M21 19V5a2 2 0 0 0-2-2h-6" />
    </svg>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const { toast } = useToast();
  const router = useRouter();
  const { session } = useAuthSession();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close dropdown when pressing Escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setProfileOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function handleLogout() {
    clearAuthSession();
    setMenuOpen(false);
    setProfileOpen(false);

    toast("You have been logged out.", "success");

    router.push("/");
    router.refresh();
  }

  function closeProfileMenu() {
    setProfileOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex min-h-18 max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <BrandLogo />

        {/* Desktop Navigation */}
        <nav
          className="hidden items-center gap-2 md:flex"
          aria-label="Main navigation"
        >
          {links.map((link) => {
            const active = isActive(pathname, link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-emerald-50 text-emerald-800"
                    : "text-slate-600 hover:bg-slate-50 hover:text-emerald-700"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Account Area */}
        <div className="hidden items-center gap-2 md:flex">
          {session ? (
            <div className="relative" ref={profileMenuRef}>
              {/* Profile Button */}
              <button
                type="button"
                onClick={() => setProfileOpen((open) => !open)}
                className={`inline-flex items-center gap-2 rounded-xl border px-2 py-1.5 pr-3 text-left transition ${
                  profileOpen
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-transparent hover:border-slate-200 hover:bg-slate-50"
                }`}
                aria-expanded={profileOpen}
                aria-haspopup="menu"
              >
                <UserAvatar
                  name={session.user.name}
                  src={session.user.avatarUrl}
                  size={32}
                  className="rounded-lg bg-emerald-100 text-emerald-700"
                />

                <span className="max-w-32">
                  <span className="block truncate text-sm font-semibold text-slate-800">
                    {session.user.name}
                  </span>

                  <span className="block text-xs capitalize text-slate-500">
                    {session.user.role.toLowerCase()}
                  </span>
                </span>

                <ChevronIcon open={profileOpen} />
              </button>

              {/* Profile Dropdown */}
              {profileOpen ? (
                <div
                  className="absolute right-0 top-[calc(100%+10px)] w-64 origin-top-right animate-in rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-950/10 duration-150"
                  role="menu"
                >
                  {/* Profile Header */}
                  <div className="mb-1 flex items-center gap-3 rounded-xl bg-emerald-50/70 p-3">
                    <UserAvatar
                      name={session.user.name}
                      src={session.user.avatarUrl}
                      size={42}
                      className="rounded-xl bg-white text-emerald-700"
                    />

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {session.user.name}
                      </p>

                      <p className="truncate text-xs text-slate-500">
                        {session.user.email}
                      </p>
                    </div>
                  </div>

                  {/* Dashboard */}
                  <Link
                    href={getDashboardPath(session.user.role)}
                    onClick={closeProfileMenu}
                    role="menuitem"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <span className="grid size-8 place-items-center rounded-lg bg-slate-50 text-slate-500">
                      <DashboardIcon />
                    </span>

                    <span>Dashboard</span>
                  </Link>

                  {/* Profile */}
                  <Link
                    href="/profile"
                    onClick={closeProfileMenu}
                    role="menuitem"
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <span className="grid size-8 place-items-center rounded-lg bg-slate-50 text-slate-500">
                      <ProfileIcon />
                    </span>

                    <span>My Profile</span>
                  </Link>

                  <div className="my-1 border-t border-slate-100" />

                  {/* Logout */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    role="menuitem"
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-rose-50 hover:text-rose-600"
                  >
                    <span className="grid size-8 place-items-center rounded-lg bg-slate-50">
                      <LogoutIcon />
                    </span>

                    <span>Log out</span>
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Log in
              </Link>

              <Link
                href="/auth/register"
                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 md:hidden"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          aria-controls="mobile-site-navigation"
        >
          <MenuIcon open={menuOpen} />
        </button>
      </div>

      {/* Mobile Navigation */}
      {menuOpen ? (
        <div
          id="mobile-site-navigation"
          className="border-t border-slate-100 bg-white px-4 py-4 shadow-lg shadow-slate-950/5 md:hidden"
        >
          <nav
            className="mx-auto flex max-w-7xl flex-col gap-1"
            aria-label="Mobile navigation"
          >
            {links.map((link) => {
              const active = isActive(pathname, link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-xl px-3 py-2.5 text-sm font-semibold ${
                    active
                      ? "bg-emerald-50 text-emerald-800"
                      : "text-slate-700 hover:bg-slate-50 hover:text-emerald-700"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            <div className="my-2 border-t border-slate-100" />

            {session ? (
              <>
                {/* Mobile User Info */}
                <div className="mb-2 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                  <UserAvatar
                    name={session.user.name}
                    src={session.user.avatarUrl}
                    size={40}
                    className="rounded-xl"
                  />

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {session.user.name}
                    </p>

                    <p className="text-xs capitalize text-slate-500">
                      {session.user.role.toLowerCase()} account
                    </p>
                  </div>
                </div>

                <Link
                  href={getDashboardPath(session.user.role)}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl bg-emerald-600 px-3 py-2.5 text-center text-sm font-semibold text-white"
                >
                  Open dashboard
                </Link>

                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  My Profile
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Log out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/auth/login"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl border border-slate-300 px-3 py-2.5 text-center text-sm font-semibold text-slate-700"
                >
                  Log in
                </Link>

                <Link
                  href="/auth/register"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl bg-emerald-600 px-3 py-2.5 text-center text-sm font-semibold text-white"
                >
                  Get started
                </Link>
              </div>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
