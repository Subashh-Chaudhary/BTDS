"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth.store";

// A redesigned, original navigation bar with a distinctive asymmetric layout,
// subtle micro-animations, and an unobtrusive mobile floating toolbar.
export default function Navigation() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const initialized = useAuthStore((s) => s.initialized);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const roleOrType = (user?.role ?? (user as any)?.user_type ?? "").toString();

  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  const navItems = [
    { key: "features", label: "Features", href: "#features" },
    { key: "how", label: "How It Works", href: "#how-it-works" },
    { key: "about", label: "About", href: "#about" },
  ];

  function handleLogout() {
    logout?.();
    router.push("/");
  }

  return (
    <>
      <header
        role="banner"
        className="fixed bg-white top-0 left-0 right-0 z-50 pointer-events-auto"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center h-20">
            {/* Left: Diagonal badge logo */}
            <Link
              href="/"
              className="group flex items-center gap-3 mr-6 shrink-0"
              aria-label="Home"
            >
              <div className="w-12 h-12 bg-linear-to-br from-rose-500 to-fuchsia-400 rounded-xl transform -skew-x-6 shadow-lg flex items-center justify-center">
                <svg
                  viewBox="0 0 48 48"
                  className="w-7 h-7 text-white"
                  aria-hidden
                >
                  <rect
                    x="6"
                    y="8"
                    width="12"
                    height="28"
                    rx="3"
                    fill="white"
                    opacity="0.92"
                  />
                  <rect
                    x="18"
                    y="6"
                    width="12"
                    height="32"
                    rx="3"
                    fill="#FFEDD5"
                    opacity="0.95"
                  />
                  <circle cx="38" cy="12" r="4" fill="white" opacity="0.95" />
                </svg>
              </div>
              <span className="hidden sm:inline-block font-semibold tracking-wide text-foreground">
                DiabetesDetect
              </span>
            </Link>

            {/* Center: segmented link rail with animated underline */}
            <nav
              aria-label="Main navigation"
              className="hidden md:flex items-center gap-3 grow"
            >
              <div className="relative w-full">
                <div className="flex gap-2 overflow-auto no-scrollbar">
                  {navItems.map((item) => (
                    <Link
                      key={item.key}
                      href={item.href}
                      className="group px-4 py-2 rounded-lg bg-linear-to-tr from-white/3 to-transparent hover:from-white/8 transition-colors text-sm text-muted-foreground"
                    >
                      <span className="relative z-10">{item.label}</span>
                      <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-rose-400 scale-x-0 group-hover:scale-x-100 origin-left transition-transform rounded-full" />
                    </Link>
                  ))}

                  {/* Role-aware action */}
                  {roleOrType === "user" && (
                    <Link
                      href={mounted && isAuthenticated ? "#screening" : "#"}
                      onClick={(e) =>
                        !(mounted && isAuthenticated) && e.preventDefault()
                      }
                      className={`ml-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                        {
                          true: "bg-rose-500 text-white",
                        } as any
                      }`}
                    >
                      Predict
                    </Link>
                  )}
                  {roleOrType === "expert" && (
                    <Link
                      href={mounted && isAuthenticated ? "/assessments" : "#"}
                      onClick={(e) =>
                        !(mounted && isAuthenticated) && e.preventDefault()
                      }
                      className={`ml-2 px-4 py-2 rounded-lg text-sm font-medium transition bg-amber-400/10 text-amber-600`}
                    >
                      Assessments
                    </Link>
                  )}
                </div>
              </div>
            </nav>

            {/* Right: rotated micro-card profile / auth actions */}
            <div className="ml-4 flex items-center gap-3">
              {/* Auth-aware actions */}
              {!mounted || !initialized || !isAuthenticated || !user ? (
                <div className="hidden md:flex items-center gap-3">
                  <Link
                    href="/auth/login"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="hidden sm:inline-flex items-center px-4 py-2 rounded-full text-black text-sm font-medium"
                  >
                    Register
                  </Link>
                </div>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen((s) => !s)}
                    aria-expanded={profileOpen}
                    aria-haspopup="true"
                    className="flex items-center gap-2 bg-linear-to-br from-white/6 to-transparent px-3 py-1 rounded-2xl shadow-sm hover:shadow-md transition-transform transform hover:-translate-y-0.5"
                  >
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-rose-600 text-white font-medium">
                      {user?.name?.[0] ?? "U"}
                    </span>
                    <span className="hidden sm:inline text-sm">
                      {user?.name ?? "User"}
                    </span>
                    <svg
                      className={`w-3 h-3 transition-transform ${
                        profileOpen ? "rotate-180" : ""
                      }`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-lg shadow-lg py-2">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-muted-foreground hover:bg-accent"
                      >
                        Profile
                      </Link>
                      <Link
                        href="/history"
                        className="block px-4 py-2 text-sm text-muted-foreground hover:bg-accent"
                      >
                        History
                      </Link>
                      <div className="border-t border-border my-1" />
                      {/* <Link
                        href="/profile/delete"
                        className="block px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
                      >
                        Delete Account
                      </Link> */}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:bg-accent"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileSheetOpen((s) => !s)}
                className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg bg-white/6 hover:bg-white/8"
                aria-label="Open menu"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    d="M4 7h16M4 12h16M4 17h16"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile bottom toolbar (unique floating CTA) */}
      <div className="md:hidden">
        <div className="fixed bottom-6 left-0 right-0 flex items-center justify-center pointer-events-none">
          <div className="relative pointer-events-auto flex items-center gap-4">
            <nav className="bg-popover/90 backdrop-blur rounded-full px-3 py-2 flex items-center gap-3 shadow-xl">
              <Link
                href="#features"
                className="px-3 py-1 text-sm text-muted-foreground"
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="px-3 py-1 text-sm text-muted-foreground"
              >
                How
              </Link>
              <Link
                href="#about"
                className="px-3 py-1 text-sm text-muted-foreground"
              >
                About
              </Link>
            </nav>

            <button
              onClick={() =>
                router.push(
                  mounted && isAuthenticated ? "#screening" : "/auth/login"
                )
              }
              className="-mt-10 w-16 h-16 rounded-full bg-linear-to-br from-rose-500 to-amber-400 shadow-2xl flex items-center justify-center text-white font-bold pointer-events-auto"
              aria-label="Primary action"
            >
              Go
            </button>
          </div>
        </div>
      </div>

      {/* Mobile sheet: simple full-screen overlay menu */}
      {mobileSheetOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileSheetOpen(false)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 bg-background rounded-t-2xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3">
              <div className="text-lg font-semibold">Menu</div>
              <button
                onClick={() => setMobileSheetOpen(false)}
                aria-label="Close"
                className="text-muted-foreground"
              >
                Close
              </button>
            </div>
            <div className="space-y-2">
              <Link href="#features" className="block px-4 py-3 rounded-lg">
                Features
              </Link>
              <Link href="#how-it-works" className="block px-4 py-3 rounded-lg">
                How It Works
              </Link>
              <Link href="#about" className="block px-4 py-3 rounded-lg">
                About
              </Link>

              {isAuthenticated && (
                <>
                  <Link href="/profile" className="block px-4 py-3 rounded-lg">
                    Profile
                  </Link>
                  <Link href="/history" className="block px-4 py-3 rounded-lg">
                    History
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 rounded-lg"
                  >
                    Logout
                  </button>
                </>
              )}

              {!isAuthenticated && (
                <div className="pt-2">
                  <Link
                    href="/auth/login"
                    className="block px-4 py-3 rounded-lg"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="block px-4 py-3 rounded-lg"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
