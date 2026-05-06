"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  FlaskConical,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LogOut,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Logo, LogoIcon } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/auth-store";
import { logoutApi } from "@/services/auth-service";
import { getDisplayName, getInitials, getPlanLabel } from "@/lib/auth-utils";
import { toast } from "sonner";

/**
 * Sidebar Navigation Items
 */
const navSections = [
  {
    label: "Main",
    items: [
      {
        href: "/dashboard",
        label: "Overview",
        icon: LayoutDashboard,
        exact: true,
      },
      {
        href: "/dashboard/builder",
        label: "Portfolio Builder",
        icon: Briefcase,
      },
      {
        href: "/dashboard/simulate",
        label: "Simulation Lab",
        icon: FlaskConical,
      },
    ],
  },
  {
    label: "Account",
    items: [{ href: "/dashboard/settings", label: "Settings", icon: Settings }],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

/**
 * Dashboard Sidebar Component
 *
 * Features:
 * - Collapsible with icon-only mode
 * - Active route highlighting
 * - Section grouping
 * - User info at bottom
 * - Tooltip labels when collapsed
 * - Upgrade CTA for trial/lite users
 *
 * Matches Stitch UI: Simulix Dashboard Sidebar
 */
export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {
      // fire-and-forget
    }
    logout();
    toast.success("Signed out successfully");
    router.push("/auth/login");
  };

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const showUpgrade = user?.plan === "free" || user?.plan === "basic";

  const displayName = getDisplayName(user?.firstName, user?.lastName);
  const initials = getInitials(user?.firstName, user?.lastName);
  const planLabel = getPlanLabel(user?.plan);

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300",
          collapsed ? "w-[68px]" : "w-[260px]",
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "flex items-center h-16 border-b border-sidebar-border px-4",
            collapsed ? "justify-center" : "justify-between",
          )}
        >
          {collapsed ? <LogoIcon className="w-8 h-8" /> : <Logo size="sm" />}

          {/* Collapse Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={cn(
              "h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent",
              collapsed && "hidden",
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {navSections.map((section) => (
            <div key={section.label}>
              {/* Section Label */}
              {!collapsed && (
                <p className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/40 mb-2 px-3">
                  {section.label}
                </p>
              )}

              {/* Nav Items */}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const active = isActive(item.href, item.exact);

                  const linkContent = (
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                        active
                          ? "bg-sidebar-accent text-sidebar-primary"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                        collapsed && "justify-center px-2",
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-5 w-5 shrink-0",
                          active
                            ? "text-sidebar-primary"
                            : "text-sidebar-foreground/50",
                        )}
                      />
                      {!collapsed && (
                        <>
                          <span className="flex-1">{item.label}</span>
                        </>
                      )}
                    </Link>
                  );

                  if (collapsed) {
                    return (
                      <Tooltip key={item.href}>
                        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                        <TooltipContent side="right" sideOffset={8}>
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return (
                    <React.Fragment key={item.href}>
                      {linkContent}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Upgrade CTA (for trial/lite) */}
        {showUpgrade && !collapsed && (
          <div className="px-3 pb-3">
            <div className="rounded-lg bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 p-3">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-sidebar-foreground">
                  Upgrade to Pro
                </span>
              </div>
              <p className="text-xs text-sidebar-foreground/60 mb-3">
                Unlock unlimited simulations and advanced analytics.
              </p>
              <Button size="sm" className="w-full h-8 text-xs" asChild>
                <Link href="/dashboard/settings">Upgrade Now</Link>
              </Button>
            </div>
          </div>
        )}

        {/* User Section */}
        <div className="border-t border-sidebar-border p-3">
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onToggle}
                  className="flex items-center justify-center w-full rounded-lg p-2 hover:bg-sidebar-accent transition-colors"
                >
                  <ChevronRight className="h-4 w-4 text-sidebar-foreground/60" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Expand sidebar</TooltipContent>
            </Tooltip>
          ) : (
            <div className="flex items-center gap-3">
              {/* User Avatar */}
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <span className="text-sm font-semibold text-primary">
                  {initials}
                </span>
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {displayName}
                </p>
                <p className="text-xs text-sidebar-foreground/50 truncate">
                  {planLabel} Plan
                </p>
              </div>

              {/* Logout */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-sidebar-foreground/50 hover:text-sidebar-foreground"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Sign out</TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
