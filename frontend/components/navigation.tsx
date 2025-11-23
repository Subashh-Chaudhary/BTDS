"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth.store";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const initialized = useAuthStore((s) => s.initialized);
  const [mounted, setMounted] = useState(false);

  const isAdmin = !!user?.is_admin;
  // prefer explicit user_type then role for backward compatibility
  // Prefer `role` (we explicitly sync it on login/register) then fallback to user_type.
  const roleOrType = (user?.role ?? (user as any)?.user_type ?? "").toString();

  // Avoid rendering auth-dependent UI during SSR/initial hydration to prevent
  // mismatches between server and client HTML. Only show auth UI after mount.
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="fixed top-0 w-full bg-background/95 backdrop-blur-sm border-b border-border z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">GD</span>
            </div>
            <span className="font-bold text-lg text-foreground hidden sm:inline">
              DiabetesDetect
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
              className="text-sm text-muted-foreground hover:text-foreground transition"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm text-muted-foreground hover:text-foreground transition"
            >
              How It Works
            </Link>
            {/* Admins see Dashboard (home page). Non-admins: show Upload for regular users and Predictions for experts. */}
            {isAdmin ? (
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground transition"
              >
                Dashboard
              </Link>
            ) : roleOrType === "user" ? (
              <Link
                href={mounted && isAuthenticated ? "#screening" : "#"}
                onClick={(e) =>
                  !(mounted && isAuthenticated) && e.preventDefault()
                }
                className={`text-sm ${
                  mounted && isAuthenticated
                    ? "text-muted-foreground hover:text-foreground"
                    : "text-muted-foreground/50 cursor-not-allowed"
                } transition`}
              >
                Screening
              </Link>
            ) : roleOrType === "expert" ? (
              <Link
                href={mounted && isAuthenticated ? "/assessments" : "#"}
                onClick={(e) =>
                  !(mounted && isAuthenticated) && e.preventDefault()
                }
                className={`text-sm ${
                  mounted && isAuthenticated
                    ? "text-muted-foreground hover:text-foreground"
                    : "text-muted-foreground/50 cursor-not-allowed"
                } transition`}
              >
                Assessments
              </Link>
            ) : null}

            {user?.role === "user" && (
              <Link
                href="#resources"
                className="text-sm text-muted-foreground hover:text-foreground transition"
              >
                Resources
              </Link>
            )}
          </div>

          {/* Auth Buttons / Profile */}
          <div className="hidden md:flex items-center gap-4">
            {/* During SSR/mount we render the non-authenticated view to match server HTML.
                After mount, the real `isAuthenticated` will be reflected. */}
            {!mounted || !initialized || !isAuthenticated || !user ? (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm text-muted-foreground hover:text-foreground transition"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="px-6 py-2 rounded-full bg-gradient-to-r from-rose-500 to-amber-400 text-white text-sm font-medium hover:opacity-95 transition"
                >
                  Register
                </Link>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 p-1 rounded-md hover:bg-accent transition">
                    <Avatar>
                      <AvatarFallback>{user?.name?.[0] ?? "U"}</AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline text-sm">
                      {user?.name ?? "User"}
                    </span>
                    <ChevronDown size={16} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <Link href="/profile">
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                  </Link>
                  <Link href="/history">
                    <DropdownMenuItem>Histories</DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <Link href="/profile/delete">
                    <DropdownMenuItem
                      className="text-destructive"
                      data-variant="destructive"
                    >
                      Delete Account
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem
                    onSelect={() => {
                      logout();
                      router.push("/");
                    }}
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-accent rounded-lg transition"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden pb-4 space-y-2"
          >
            <Link
              href="#features"
              className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              How It Works
            </Link>
            {/* Mobile: admin -> Dashboard, user -> Upload, expert -> Predictions */}
            {isAdmin ? (
              <Link
                href="/"
                className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                Dashboard
              </Link>
            ) : roleOrType === "user" ? (
              <Link
                href={isAuthenticated ? "#screening" : "#"}
                onClick={(e) => !isAuthenticated && e.preventDefault()}
                className={`block px-4 py-2 text-sm ${
                  isAuthenticated
                    ? "text-muted-foreground hover:text-foreground"
                    : "text-muted-foreground/50 cursor-not-allowed"
                }`}
              >
                Screening
              </Link>
            ) : roleOrType === "expert" ? (
              <Link
                href={isAuthenticated ? "/assessments" : "#"}
                onClick={(e) => !isAuthenticated && e.preventDefault()}
                className={`block px-4 py-2 text-sm ${
                  isAuthenticated
                    ? "text-muted-foreground hover:text-foreground"
                    : "text-muted-foreground/50 cursor-not-allowed"
                }`}
              >
                Assessments
              </Link>
            ) : null}
            <Link
              href="#about"
              className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              About
            </Link>
            <div className="pt-2 space-y-2">
              {!initialized || !isAuthenticated ? (
                <>
                  <Link
                    href="/auth/login"
                    className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="block w-full px-6 py-2 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary/90 transition text-center"
                  >
                    Register
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/profile/edit"
                    className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    Edit Profile
                  </Link>
                  <Link
                    href="/history"
                    className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    Histories
                  </Link>
                  <Link
                    href="/profile/delete"
                    className="block px-4 py-2 text-sm text-destructive hover:text-destructive/90"
                  >
                    Delete Account
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      router.push("/");
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}
