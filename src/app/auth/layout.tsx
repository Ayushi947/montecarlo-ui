"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Auth Layout
 *
 * Shared layout for all authentication pages:
 * - Login, Signup, Forgot Password, Reset Password, Success
 *
 * Features:
 * - Split screen design (decorative left, content right)
 * - Glassmorphism card for auth forms
 * - Responsive: Full-screen card on mobile
 * - Auth redirect: sends authenticated users to /dashboard
 *
 * Matches Stitch UI: Auth Portal design
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const token = useAuthStore((s) => s.token);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const [checked, setChecked] = useState(false);

  // Redirect authenticated users to dashboard
  // Exception: allow /auth/success to show for newly signed-up users
  // IMPORTANT: Wait for Zustand hydration so we don't flash auth UI
  // before localStorage values are restored.
  useEffect(() => {
    if (!hasHydrated) return; // Wait for store rehydration

    if (isAuthenticated && token) {
      // Allow success page and verify page through for authenticated users
      if (typeof window !== "undefined") {
        const pathname = window.location.pathname;
        if (pathname === "/auth/success" || pathname === "/auth/verify") {
          setChecked(true);
          return;
        }
      }
      router.replace("/dashboard");
      return;
    }
    setChecked(true);
  }, [hasHydrated, isAuthenticated, token, router]);

  // Don't flash the auth UI before hydration + redirect check completes
  if (!hasHydrated || !checked) return null;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Decorative (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 dark:bg-slate-950 relative overflow-hidden">
        {/* Background Pattern */}
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/backgrounds/auth-background.png"
            alt="Simulix Background"
            fill
            priority
            className="object-cover opacity-80"
          />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/40 via-transparent to-primary/20 z-0" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          {/* Logo */}
          <Logo showText size="md" className="text-white" />

          {/* Tagline */}
          <div className="space-y-6 max-w-md">
            <h1 className="text-4xl font-bold font-header leading-tight">
              Institutional-Grade Monte Carlo Projections
            </h1>
            <p className="text-lg text-slate-300">
              Run 10,000+ financial simulations in milliseconds. GPU-accelerated
              precision for your wealth management decisions.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-700">
              <div>
                <p className="text-3xl font-bold text-primary">10K+</p>
                <p className="text-sm text-slate-400">Simulations/sec</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">64-bit</p>
                <p className="text-sm text-slate-400">Precision</p>
              </div>

            </div>
          </div>

          {/* Footer */}
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Simulix Inc. All rights reserved.
          </p>
        </div>

        {/* Animated Elements - Kept simple for now as image is rich */}
      </div>

      {/* Right Panel - Auth Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between p-4 lg:p-6">
          {/* Mobile Logo */}
          <div className="lg:hidden">
            <Logo showText size="sm" />
          </div>
          <div className="hidden lg:block" />

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
          <div className="w-full max-w-md">{children}</div>
        </div>

        {/* Bottom Links (Mobile) */}
        <div className="lg:hidden p-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Simulix Inc. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
