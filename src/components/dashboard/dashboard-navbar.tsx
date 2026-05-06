"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Menu,
  Settings,
  LogOut,
  Command,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/dashboard/breadcrumbs";
import { ThemeToggle } from "@/components/theme-toggle";
import { GlobalSearchCommand } from "@/components/dashboard/global-search-command";
import { useAuthStore } from "@/stores/auth-store";
import { logoutApi } from "@/services/auth-service";
import { getDisplayName, getInitials, getPlanLabel } from "@/lib/auth-utils";
import { toast } from "sonner";

interface DashboardNavbarProps {
  onMenuToggle: () => void;
}

/**
 * Dashboard Navbar Component
 *
 * Features:
 * - Breadcrumb navigation
 * - Global search (Cmd+K) with command palette
 * - Theme toggle
 * - User avatar dropdown
 * - Mobile hamburger menu
 */
export function DashboardNavbar({ onMenuToggle }: DashboardNavbarProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [searchOpen, setSearchOpen] = React.useState(false);

  // Global ⌘K keyboard listener — works on every page
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {
      // fire-and-forget: server logout is a no-op
    }
    logout();
    toast.success("Signed out successfully");
    router.push("/auth/login");
  };

  const displayName = getDisplayName(user?.firstName, user?.lastName);
  const initials = getInitials(user?.firstName, user?.lastName);
  const planLabel = getPlanLabel(user?.plan);

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6">
        {/* Left: Mobile menu + Breadcrumbs */}
        <div className="flex items-center gap-3 flex-1">
          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="md:hidden h-9 w-9"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>

          {/* Breadcrumbs (desktop) */}
          <Breadcrumbs className="hidden md:flex" />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Search (Desktop) */}
          <Button
            variant="outline"
            className="hidden md:flex items-center gap-2 h-9 px-3 text-sm text-muted-foreground w-64 justify-start"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="flex-1 truncate text-left">Search…</span>
            <kbd className="shrink-0 pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <Command className="h-3 w-3" />K
            </kbd>
          </Button>

          {/* Search (Mobile) */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Theme Toggle (Light / Dark / System dropdown) */}
          <ThemeToggle />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-9 gap-2 px-2"
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xs font-semibold text-primary">
                    {initials}
                  </span>
                </div>
                <span className="hidden md:block text-sm font-medium max-w-[100px] truncate">
                  {displayName}
                </span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">
                    {displayName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user?.email || "user@simulix.io"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Plan Badge */}
              <div className="px-2 py-1.5">
                <Badge
                  variant="secondary"
                  className="text-xs"
                >
                  {planLabel} Plan
                </Badge>
              </div>
              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Global Search Command Palette */}
      <GlobalSearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
