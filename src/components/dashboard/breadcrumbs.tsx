"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

import { cn } from "@/lib/utils";
import { useSimulationStore } from "@/stores/simulation-store";

/**
 * Route Label Map
 *
 * Maps route segments to human-readable labels
 */
const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  builder: "Portfolio Builder",
  simulate: "Simulation Lab",
  new: "New Simulation",
  settings: "Settings",
};

interface BreadcrumbItem {
  label: string;
  href: string;
  isLast: boolean;
}

/**
 * Generate breadcrumbs from the current path
 */
function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  let currentPath = "";

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    breadcrumbs.push({
      label,
      href: currentPath,
      isLast: index === segments.length - 1,
    });
  });

  return breadcrumbs;
}

/**
 * Breadcrumbs Component
 *
 * Features:
 * - Auto-generated from URL path
 * - Clickable parent links
 * - Current page highlighted
 * - Home icon for root
 * - Context-aware: shows portfolio name when editing in builder
 * - Context-aware: shows simulation name for simulate/[id]
 */
export function Breadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname();
  const currentBucket = useSimulationStore((s) => s.currentBucket);
  const currentSimulation = useSimulationStore((s) => s.currentSimulation);

  const breadcrumbs = generateBreadcrumbs(pathname);

  // When editing a portfolio at /dashboard/builder/[id], replace the UUID
  // segment with the portfolio name from the store
  const builderIdMatch = pathname.match(/^\/dashboard\/builder\/(.+)$/);
  if (builderIdMatch) {
    const lastCrumb = breadcrumbs[breadcrumbs.length - 1];
    if (lastCrumb) {
      // Replace the raw UUID label with the portfolio name
      lastCrumb.label = currentBucket?.name || "Edit Portfolio";
    }
  }

  // When viewing a simulation at /dashboard/simulate/[id], replace the UUID
  // segment with a descriptive name from the store
  const simulateIdMatch = pathname.match(/^\/dashboard\/simulate\/([^/]+)$/);
  if (simulateIdMatch && simulateIdMatch[1] !== "new") {
    const lastCrumb = breadcrumbs[breadcrumbs.length - 1];
    if (lastCrumb) {
      lastCrumb.label = currentSimulation?.portfolioName
        ? `${currentSimulation.portfolioName} Simulation`
        : "Simulation Detail";
    }
  }

  // On the dashboard root, show a simple "Overview" heading instead of hiding
  if (breadcrumbs.length <= 1) {
    return (
      <div className={cn("flex items-center gap-1.5 text-sm", className)}>
        <Home className="h-3.5 w-3.5 text-muted-foreground mr-0.5" />
        <span className="font-medium text-foreground">Overview</span>
      </div>
    );
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-1.5 text-sm", className)}
    >
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.href} className="flex items-center gap-1.5">
          {/* Separator */}
          {index > 0 && (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
          )}

          {/* First item gets home icon */}
          {index === 0 && (
            <Home className="h-3.5 w-3.5 text-muted-foreground mr-0.5" />
          )}

          {/* Breadcrumb Link/Text */}
          {crumb.isLast ? (
            <span className="font-medium text-foreground truncate max-w-[200px]">
              {crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
