"use client";

import { useState } from "react";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    // Placeholder: wire to your mailing service later
    setSubmitted(true);
    setTimeout(() => setEmail(""), 400);
  }

  return (
    <footer className="mt-16">
      {/* Decorative slanted band to give distinct visual identity */}
      <div
        className="w-full h-12 -mt-2 bg-linear-to-r from-(--color-card) to-secondary transform -skew-y-1 pointer-events-none"
        aria-hidden
      />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Brand + signature (col 1-4) */}
          <div className="lg:col-span-4">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl neu-surface flex items-center justify-center shrink-0">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 28 28"
                  fill="none"
                  aria-hidden
                >
                  <rect
                    x="2"
                    y="4"
                    width="8"
                    height="20"
                    rx="2"
                    fill="var(--primary)"
                  />
                  <rect
                    x="10"
                    y="6"
                    width="8"
                    height="18"
                    rx="2"
                    fill="rgba(255,255,255,0.85)"
                  />
                  <circle cx="24" cy="8" r="3" fill="var(--accent)" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-lg">DiabetesDetect</div>
                <p className="mt-1 text-sm text-muted-foreground max-w-xs">
                  A calm, privacy-focused screening platform. Built for clinical
                  teams and care pathways with clear, auditable results.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-secondary text-secondary-foreground">
                Healthcare
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-secondary text-secondary-foreground">
                Privacy-first
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-secondary text-secondary-foreground">
                Integrations
              </span>
            </div>
          </div>

          {/* Link groups (col 5-9) */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-6">
            <div>
              <h5 className="text-sm font-semibold mb-3">Product</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="#features"
                    className="hover:text-foreground transition"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/predictions"
                    className="hover:text-foreground transition"
                  >
                    Predictions
                  </Link>
                </li>
                <li>
                  <Link
                    href="/history"
                    className="hover:text-foreground transition"
                  >
                    History
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="text-sm font-semibold mb-3">Resources</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    href="#how-it-works"
                    className="hover:text-foreground transition"
                  >
                    How it works
                  </Link>
                </li>
                <li>
                  <Link
                    href="/profile"
                    className="hover:text-foreground transition"
                  >
                    Profile
                  </Link>
                </li>
                <li>
                  <Link
                    href="/auth/register"
                    className="hover:text-foreground transition"
                  >
                    Get started
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Legal row */}
        <div className="mt-10 border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center neu-strong">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden
              >
                <path
                  d="M2 7h10"
                  stroke="var(--foreground)"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div>
              <div className="text-sm">DiabetesDetect</div>
              <div className="text-xs">
                Built for care teams • Secure by design
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-sm text-muted-foreground">
              &copy; {currentYear} DiabetesDetect
            </div>

            <div className="flex gap-4">
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground hover:text-foreground transition"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-muted-foreground hover:text-foreground transition"
              >
                Terms
              </Link>
              <Link
                href="/contact"
                className="text-sm text-muted-foreground hover:text-foreground transition"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
