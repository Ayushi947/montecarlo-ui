  "use client";

import * as React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

interface AllocationData {
  name: string;
  ticker: string;
  value: number;
}

interface AllocationChartProps {
  data: AllocationData[];
  className?: string;
  /** Compact mode: hides center label and legend, uses smaller radii. For card thumbnails. */
  compact?: boolean;
}

/**
 * Color palette for pie chart segments
 * Matches Stitch UI chart colors
 */
export const CHART_COLORS = [
  "hsl(217, 91%, 60%)",  // Blue (primary)
  "hsl(142, 71%, 45%)",  // Green
  "hsl(38, 92%, 50%)",   // Amber
  "hsl(263, 70%, 50%)",  // Purple
  "hsl(340, 82%, 52%)",  // Rose
  "hsl(190, 90%, 50%)",  // Cyan
  "hsl(25, 95%, 53%)",   // Orange
  "hsl(160, 60%, 45%)",  // Teal
  "hsl(280, 65%, 60%)",  // Violet
  "hsl(0, 72%, 51%)",    // Red
];

/**
 * Portfolio Allocation Pie Chart
 *
 * Features:
 * - Donut chart with center label
 * - Color-coded segments
 * - Hover tooltips (Replaced by Dynamic Center Label)
 * - Legend with asset names
 * - Responsive sizing
 *
 * Matches Stitch UI: Portfolio Builder allocation visualization
 */
export function AllocationChart({ data, className, compact = false }: AllocationChartProps) {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

  const totalWeight = data.reduce((sum, d) => sum + d.value, 0);
  const isValid = Math.abs(totalWeight - 100) < 0.01;

  // Filter out zero-weight assets for the chart
  const chartData = data.filter((d) => d.value > 0);

  if (chartData.length === 0) {
    if (compact) {
      return (
        <div className={cn("flex items-center justify-center", className)}>
          <div className="w-full h-full rounded-full border-2 border-dashed border-muted flex items-center justify-center">
            <span className="text-xs text-muted-foreground">0%</span>
          </div>
        </div>
      );
    }

    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center text-center py-8",
          className
        )}
      >
        <div className="w-32 h-32 rounded-full border-4 border-dashed border-muted flex items-center justify-center mb-4">
          <span className="text-2xl text-muted-foreground">0%</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Add assets to see allocation
        </p>
      </div>
    );
  }

  // Compact mode: small donut for card thumbnails — no label, no legend, no tooltip
  if (compact) {
    return (
      <div className={cn("relative", className)}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius="45%"
              outerRadius="90%"
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              strokeWidth={0}
              isAnimationActive={false}
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Derived state for center label
  const activeItem = activeIndex !== null ? chartData[activeIndex] : null;
  const centerValue = activeItem ? activeItem.value : totalWeight;
  const centerLabel = activeItem ? activeItem.ticker : (isValid ? "Allocated" : "Invalid");

  // Dynamic color for center value
  const centerColorClass = activeItem
    ? "text-primary"
    : isValid
      ? "text-foreground"
      : "text-destructive";

  return (
    <div className={cn("space-y-4 overflow-visible", className)}>
      {/* Pie Chart */}
      <div className="relative h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              strokeWidth={0}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                  // Slight opacity fade for non-active items if one is active
                  fillOpacity={activeIndex !== null && activeIndex !== index ? 0.3 : 1}
                  className="transition-all duration-300 ease-in-out cursor-pointer"
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-200">
          <span
            className={cn(
              "text-2xl font-bold transition-colors duration-200",
              centerColorClass
            )}
          >
            {centerValue.toFixed(activeItem ? 1 : 0)}%
          </span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            {centerLabel}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-1.5 w-full overflow-visible">
        {chartData.map((item, index) => (
          <div
            key={item.ticker}
            className={cn(
              "flex items-center gap-2 text-sm transition-opacity duration-200 cursor-pointer",
              activeIndex !== null && activeIndex !== index ? "opacity-40" : "opacity-100"
            )}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <div
              className="w-3 h-3 rounded-sm shrink-0"
              style={{
                backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
              }}
            />
            <span className="flex-1 text-muted-foreground truncate min-w-0 mr-2">
              {item.ticker}
            </span>
            <span
              className="font-semibold text-foreground tabular-nums shrink-0 text-right text-sm"
              style={{ minWidth: '72px', whiteSpace: 'nowrap', display: 'inline-block', paddingLeft: '8px' }}
            >
              {item.value.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
