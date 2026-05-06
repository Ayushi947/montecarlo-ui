"use client";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Dashboard Skeleton Loaders
 *
 * Reusable skeleton primitives for loading states across the dashboard.
 * Each skeleton matches the layout of its corresponding live component
 * to minimize layout shift (CLS) during data fetches.
 *
 * Components:
 * - DashboardSkeleton: Full dashboard home page
 * - ChartSkeleton: Pie/bar/area chart placeholder
 * - StatsCardSkeleton: Metric card with icon + value
 * - TableSkeleton: Data table rows
 * - AssetRowSkeleton: Portfolio builder asset row
 * - SimulationSkeleton: Simulation lab page
 * - FormSkeleton: Settings form fields
 *
 * All use Tailwind `animate-pulse` via shadcn's Skeleton primitive.
 *
 * Matches Stitch UI: Performance Skeleton Loader (Screen 21)
 */

// ─── Primitive Skeletons ───

export function StatsCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-5", className)}>
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function ChartSkeleton({
  className,
  height = 200,
  type = "area",
}: {
  className?: string;
  height?: number;
  type?: "area" | "pie" | "bar";
}) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-5", className)}>
      {/* Chart header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <Skeleton className="h-4 w-36 mb-1.5" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>

      {/* Chart area */}
      {type === "pie" ? (
        <div className="flex flex-col items-center gap-4">
          <Skeleton
            className="rounded-full"
            style={{ width: height, height }}
          />
          {/* Legend */}
          <div className="flex gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-1.5">
                <Skeleton className="h-3 w-3 rounded-sm" />
                <Skeleton className="h-3 w-12" />
              </div>
            ))}
          </div>
        </div>
      ) : type === "bar" ? (
        <div className="flex items-end gap-2 justify-center" style={{ height }}>
          {[40, 65, 80, 55, 90, 70, 45, 85, 60, 75].map((h, i) => (
            <Skeleton
              key={i}
              className="w-6 rounded-t-md"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      ) : (
        <div className="relative" style={{ height }}>
          {/* Fake area chart using layered skeletons */}
          <div className="absolute inset-0 flex items-end">
            <Skeleton className="w-full h-[60%] rounded-lg opacity-20" />
          </div>
          <div className="absolute inset-0 flex items-end">
            <Skeleton className="w-full h-[40%] rounded-lg opacity-30" />
          </div>
          {/* X-axis ticks */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-2.5 w-8" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  className,
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-border bg-card overflow-hidden", className)}>
      {/* Header */}
      <div className="border-b border-border bg-muted/50 px-4 py-3 flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn("h-3", i === 0 ? "w-20" : i === columns - 1 ? "w-16" : "w-24")}
          />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, row) => (
        <div
          key={row}
          className="px-4 py-3 flex gap-4 border-b border-border last:border-0"
        >
          {Array.from({ length: columns }).map((_, col) => (
            <Skeleton
              key={col}
              className={cn(
                "h-4",
                col === 0 ? "w-20" : col === columns - 1 ? "w-16" : "w-28"
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function AssetRowSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50">
      <Skeleton className="h-4 w-4 rounded" />
      <Skeleton className="w-3 h-8 rounded-full" />
      <div className="flex-1 min-w-0">
        <Skeleton className="h-4 w-16 mb-1" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="w-28 h-2 rounded-full" />
      <Skeleton className="w-16 h-8 rounded-md" />
      <Skeleton className="h-8 w-8 rounded-md" />
    </div>
  );
}

export function GaugeSkeleton({ size = 160 }: { size?: number }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <Skeleton className="rounded-full" style={{ width: size, height: size }} />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

export function FormFieldSkeleton() {
  return (
    <div>
      <Skeleton className="h-3 w-20 mb-1.5" />
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
  );
}

// ─── Composite Skeletons ───

/**
 * Full Dashboard Home skeleton
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Skeleton className="h-7 w-56 mb-2" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table */}
        <div className="lg:col-span-2">
          <TableSkeleton rows={4} columns={5} />
        </div>
        {/* Sidebar */}
        <div className="space-y-4">
          <ChartSkeleton type="pie" height={150} />
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-28 mb-1" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Portfolio Builder skeleton
 */
export function BuilderSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between">
        <div>
          <Skeleton className="h-7 w-44 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32 rounded-md" />
          <Skeleton className="h-9 w-36 rounded-md" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Name card */}
          <div className="rounded-xl border border-border bg-card p-4">
            <Skeleton className="h-3 w-24 mb-2" />
            <Skeleton className="h-7 w-64" />
          </div>
          {/* Status bar */}
          <Skeleton className="h-11 w-full rounded-lg" />
          {/* Asset rows */}
          {[1, 2, 3].map((i) => (
            <AssetRowSkeleton key={i} />
          ))}
          {/* Add button */}
          <Skeleton className="h-12 w-full rounded-xl border-dashed" />
        </div>
        <div className="space-y-4">
          <ChartSkeleton type="pie" height={150} />
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Simulation Lab skeleton
 */
export function SimulationSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between">
        <div>
          <Skeleton className="h-7 w-40 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-36 rounded-md" />
      </div>

      {/* Parameters */}
      <div className="rounded-xl border border-border bg-card p-5">
        <Skeleton className="h-4 w-40 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <FormFieldSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Chart + Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <ChartSkeleton type="area" height={320} />
        </div>
        <div className="rounded-xl border border-border bg-card p-5 flex flex-col items-center">
          <Skeleton className="h-4 w-28 mb-6 self-start" />
          <GaugeSkeleton />
          <div className="mt-6 w-full space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/**
 * Settings page skeleton
 */
/**
 * Outcomes Distribution skeleton
 */
export function OutcomesSkeleton() {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex justify-between">
        <div>
          <Skeleton className="h-7 w-52 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
      </div>

      {/* Histogram + Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <ChartSkeleton type="bar" height={280} />
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 flex flex-col items-center">
            <Skeleton className="h-4 w-32 mb-4 self-start" />
            <GaugeSkeleton size={140} />
            <div className="mt-5 w-full space-y-2.5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-3 w-12 mb-1" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>

      {/* Interpretation */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-start gap-3">
          <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Projections page skeleton
 */
export function ProjectionsSkeleton() {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex justify-between">
        <div>
          <Skeleton className="h-7 w-36 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>

      {/* Disclaimer */}
      <Skeleton className="h-10 w-full rounded-lg" />

      {/* Age control */}
      <Skeleton className="h-12 w-full rounded-lg" />

      {/* Table */}
      <TableSkeleton rows={8} columns={7} />
    </div>
  );
}


/**
 * Simulation List skeleton — card grid matching the list page
 */
export function SimulationListSkeleton() {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="h-7 w-40 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-48 hidden sm:block" />
          <Skeleton className="h-9 w-36 rounded-md" />
        </div>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <Skeleton className="h-3 w-12 mb-1" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div>
                  <Skeleton className="h-3 w-14 mb-1" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <div>
                  <Skeleton className="h-3 w-12 mb-1" />
                  <Skeleton className="h-4 w-14" />
                </div>
                <div>
                  <Skeleton className="h-3 w-16 mb-1" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/20">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
        ))}
        {/* New card skeleton */}
        <div className="flex flex-col items-center justify-center p-5 rounded-xl border-2 border-dashed border-border bg-muted/10 gap-2 min-h-[200px]">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

/**
 * Simulation Form skeleton — new simulation form
 */
export function SimulationFormSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Skeleton className="h-7 w-44 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Portfolio selector card */}
      <div className="rounded-xl border border-border bg-card p-5">
        <Skeleton className="h-4 w-32 mb-3" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>

      {/* Parameters card */}
      <div className="rounded-xl border border-border bg-card p-5">
        <Skeleton className="h-4 w-36 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <FormFieldSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Submit button */}
      <Skeleton className="h-10 w-40 rounded-md" />
    </div>
  );
}

/**
 * Simulation Detail skeleton — results page with tabs
 */
export function SimulationDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header + actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="h-7 w-56 mb-2" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-20 rounded-md" />
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-9 w-28 rounded-md" />
        ))}
      </div>

      {/* Chart */}
      <ChartSkeleton type="area" height={320} />

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function SettingsSkeleton() {
  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <Skeleton className="h-7 w-28 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Profile section */}
      <div className="rounded-xl border border-border bg-card p-6">
        <Skeleton className="h-5 w-20 mb-5" />
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div>
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-3 w-36" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <FormFieldSkeleton key={i} />
          ))}
        </div>
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>

      {/* Subscription */}
      <div className="rounded-xl border border-border bg-card p-6">
        <Skeleton className="h-5 w-28 mb-5" />
        <Skeleton className="h-20 w-full rounded-lg mb-4" />
        <Skeleton className="h-2 w-full rounded-full mb-4" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32 rounded-md" />
          <Skeleton className="h-9 w-32 rounded-md" />
        </div>
      </div>

      {/* Theme */}
      <div className="rounded-xl border border-border bg-card p-6">
        <Skeleton className="h-5 w-16 mb-5" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
