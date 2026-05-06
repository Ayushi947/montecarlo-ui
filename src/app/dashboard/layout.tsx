"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardNavbar } from "@/components/dashboard/dashboard-navbar";
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar";
import { useAuthStore } from "@/stores/auth-store";
import { getMeApi } from "@/services/auth-service";
import { mapApiUserToUser } from "@/lib/auth-utils";
import { getUsageApi } from "@/services/subscription-service";
import { toast } from "sonner";

/**
 * Dashboard Layout
 *
 * Provides the shared layout for all dashboard pages:
 * - Auth guard: redirects to login if not authenticated
 * - Token validation: verifies JWT on mount via GET /auth/me
 * - Collapsible sidebar (desktop)
 * - Sheet sidebar (mobile)
 * - Top navbar with breadcrumbs, search, user menu
 * - Main content area with padding
 *
 * Sidebar state persists in localStorage.
 *
 * Matches Stitch UI: Simulix Dashboard Shell
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, token, login, logout } = useAuthStore();
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isValidating, setIsValidating] = React.useState(true);

  // Auth guard: redirect to login if not authenticated
  // IMPORTANT: Wait for Zustand hydration before making routing decisions.
  // Without this, a page refresh reads default state (isAuthenticated=false)
  // and prematurely redirects to /auth/login → /dashboard, losing the URL.
  React.useEffect(() => {
    if (!hasHydrated) return; // Store not yet restored from localStorage

    if (!isAuthenticated || !token) {
      router.replace("/auth/login");
      return;
    }

    // Validate token by calling GET /auth/me
    let cancelled = false;
    getMeApi()
      .then((response) => {
        if (cancelled) return;
        if (response.success && response.data) {
          // Refresh user data from server
          const freshUser = mapApiUserToUser(
            response.data,
            response.data.subscription,
            {
              phoneNumber: response.data.phoneNumber,
              emailVerified: response.data.emailVerified,
            },
          );
          login(freshUser, token);

          // Also fetch real usage stats (non-blocking)
          getUsageApi()
            .then((usageResponse) => {
              if (cancelled) return;
              if (usageResponse.success && usageResponse.data) {
                const data = usageResponse.data;
                // Map backend field names to frontend expectations
                // -1 means unlimited (Pro plan)
                useAuthStore.getState().updateUser({
                  simulationsUsed: data.simulationsRun ?? 0,
                  simulationsLimit: data.maxSimulations ?? 5,
                });
              }
            })
            .catch(() => {
              // Usage fetch failure is non-critical — silently ignore
            });
        }
      })
      .catch(() => {
        if (cancelled) return;
        // Token invalid/expired — force logout
        logout();
        toast.error("Session expired", {
          description: "Please sign in again to continue.",
        });
        router.replace("/auth/login");
      })
      .finally(() => {
        if (!cancelled) setIsValidating(false);
      });

    return () => {
      cancelled = true;
    };
    // Run once after hydration completes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated]);

  // Restore sidebar state from localStorage
  React.useEffect(() => {
    const stored = localStorage.getItem("simulix-sidebar-collapsed");
    if (stored !== null) {
      setSidebarCollapsed(JSON.parse(stored));
    }
  }, []);

  const toggleSidebar = () => {
    const next = !sidebarCollapsed;
    setSidebarCollapsed(next);
    localStorage.setItem("simulix-sidebar-collapsed", JSON.stringify(next));
  };

  // Show loading while hydrating store or validating auth
  if (!hasHydrated || !isAuthenticated || isValidating) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar open={mobileOpen} onOpenChange={setMobileOpen} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <DashboardNavbar onMenuToggle={() => setMobileOpen(true)} />

        {/* Page Content */}
        <main className={cn("flex-1 overflow-y-auto", "p-4 md:p-6 lg:p-8")}>
          <div>{children}</div>
        </main>
      </div>
    </div>
  );
}
