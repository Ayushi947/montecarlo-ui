"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Briefcase,
  FlaskConical,
  Settings,
  Sparkles,
  LogOut,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAuthStore } from "@/stores/auth-store";
import { logoutApi } from "@/services/auth-service";
import { getDisplayName, getInitials, getPlanLabel } from "@/lib/auth-utils";
import { toast } from "sonner";

/**
 * Mobile navigation items (same as sidebar)
 */
const navSections = [
  {
    label: "Main",
    items: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
      { href: "/dashboard/builder", label: "Portfolio Builder", icon: Briefcase },
      { href: "/dashboard/simulate", label: "Simulation Lab", icon: FlaskConical, badge: "New" },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ],
  },
];

interface MobileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Mobile Sidebar (Sheet) Component
 *
 * Slide-in sidebar for mobile devices using the Sheet component.
 *
 * Matches Stitch UI: Simulix Mobile Navigation
 */
export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
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
    onOpenChange(false);
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[280px] p-0 bg-sidebar">
        <SheetHeader className="h-16 flex flex-row items-center px-4 border-b border-sidebar-border">
          <SheetTitle>
            <Logo size="sm" />
          </SheetTitle>
        </SheetHeader>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/40 mb-2 px-3">
                {section.label}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const active = isActive(item.href, item.exact);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => onOpenChange(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                        active
                          ? "bg-sidebar-accent text-sidebar-primary"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-5 w-5 shrink-0",
                          active ? "text-sidebar-primary" : "text-sidebar-foreground/50"
                        )}
                      />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <Badge
                          variant="secondary"
                          className="h-5 text-[10px] px-1.5 bg-primary/10 text-primary"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Upgrade CTA */}
        {showUpgrade && (
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
              <Button
                size="sm"
                className="w-full h-8 text-xs"
                asChild
                onClick={() => onOpenChange(false)}
              >
                <Link href="/dashboard/settings">Upgrade Now</Link>
              </Button>
            </div>
          </div>
        )}

        {/* User Section */}
        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <span className="text-sm font-semibold text-primary">
                {initials}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {displayName}
              </p>
              <p className="text-xs text-sidebar-foreground/50 truncate">
                {planLabel} Plan
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-sidebar-foreground/50 hover:text-sidebar-foreground"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
