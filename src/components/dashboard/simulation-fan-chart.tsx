"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Line,
} from "recharts";
import * as React from "react";
import { cn } from "@/lib/utils";

interface FanChartDataPoint {
  year: number;
  p10: number;
  p50: number;
  p90: number;
  goalValue?: number;
}

interface SimulationFanChartProps {
  data: FanChartDataPoint[];
  goalAmount?: number;
  milestones?: Array<{
    year: number;
    label: string;
    value: number;
  }>;
  goalProbabilities?: number[];
  showProbability?: boolean;
  isReal?: boolean;
  isPostTax?: boolean;
  height?: number;
  className?: string;
  granularity?: "day" | "month" | "year";
}

/**
 * Custom tooltip for the fan chart
 */
function FanChartTooltip({
  active,
  payload,
  label,
  isReal,
  isPostTax,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: number;
  isReal?: boolean;
  isPostTax?: boolean;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const formatCurrency = (val: number) =>
    `$${val.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

  // payload comes in order: p90, p50, p10
  const p90 = payload.find((p) => p.name === "p90");
  const p50 = payload.find((p) => p.name === "p50");
  const p10 = payload.find((p) => p.name === "p10");

  return (
    <div className="bg-popover border border-border rounded-lg shadow-lg px-4 py-3 min-w-[180px]">
      <div className="text-sm font-semibold text-foreground mb-1">
        {label && label > 10000
          ? new Date(label).toLocaleDateString("en-US", { month: "short", year: "numeric" })
          : `Year ${label}`}
      </div>
      {(isPostTax || isReal) && (
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-2">
          {isPostTax ? "Post-Tax Value (Net 10%)" : "Real Value (Inflation Adj.)"}
        </div>
      )}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <span className="text-muted-foreground">High (P90)</span>
          </div>
          <span className="font-mono font-medium text-foreground">
            {p90 ? formatCurrency(p90.value) : "—"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="text-muted-foreground">Medium (P50)</span>
          </div>
          <span className="font-mono font-medium text-foreground">
            {p50 ? formatCurrency(p50.value) : "—"}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-muted-foreground">Low (P10)</span>
          </div>
          <span className="font-mono font-medium text-foreground">
            {p10 ? formatCurrency(p10.value) : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}

export function SimulationFanChart({
  data,
  goalAmount,
  milestones,
  goalProbabilities,
  showProbability = false,
  isReal,
  isPostTax,
  height = 340,
  className,
  granularity = "year",
}: SimulationFanChartProps) {
  const formatYAxis = (value: number) => {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
    return `$${value}`;
  };



  const formatXAxis = (tickItem: number) => {
    // If tick is a small number (e.g. 2024, 2025), it's a year.
    // If it's a large number (timestamp), format it.
    if (tickItem < 10000) return tickItem.toString();

    const date = new Date(tickItem);
    if (granularity === "day") {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } else if (granularity === "month") {
      return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    }
    return date.getFullYear().toString();
  };

  // Generate ticks to ensure better density than Recharts auto-calc
  const ticks = React.useMemo(() => {
    if (!data || data.length === 0) return undefined;

    // If < 20 data points, show all
    if (data.length <= 20) return data.map(d => d.year);

    // If more, roughly 12-15 ticks
    const step = Math.ceil(data.length / 15);
    return data.filter((_, i) => i % step === 0 || i === data.length - 1).map(d => d.year);
  }, [data]);

  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={data}
          margin={{ top: 20, right: 80, left: 20, bottom: 0 }}
        >
          {/* ... defs ... */}
          <defs>
            {/* ... keep existing defs ... */}
            <linearGradient id="fanGradientHigh" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.15} />
              <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="fanGradientMedium" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.25} />
              <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="fanGradientLow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0.1} />
              <stop offset="95%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            opacity={0.5}
          />

          <XAxis
            dataKey="year"
            type="number"
            domain={['dataMin', 'dataMax']}
            ticks={ticks}
            tickFormatter={formatXAxis}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={{ stroke: "hsl(var(--border))" }}
            interval={0}
            minTickGap={10}
            padding={{ left: 10, right: 20 }}
          />

          <YAxis
            tickFormatter={formatYAxis}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={false}
            width={70}
            label={{
              value: isPostTax
                ? "Post-Tax Value"
                : isReal
                  ? "Real Value (Adjusted)"
                  : "Nominal Value",
              angle: -90,
              position: "insideLeft",
              style: { textAnchor: 'middle', fill: 'hsl(var(--muted-foreground))', fontSize: 10 },
              dx: 0,
              dy: 0,
            }}
          />

          <Tooltip content={<FanChartTooltip isReal={isReal} isPostTax={isPostTax} />} />

          {/* Goal Line (Dynamic) */}
          {goalAmount && (
            <Line
              type="linear"
              dataKey="goalValue"
              stroke="hsl(38, 92%, 50%)"
              strokeDasharray="6 4"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "hsl(38, 92%, 50%)" }}
              name="Goal"
              isAnimationActive={false}
              label={(props: any) => {
                const { x, y, index } = props;
                // Only show label on the last point
                if (index === data.length - 1) {
                  return (
                    <text x={x + 10} y={y} dy={4} fill="hsl(38, 92%, 50%)" fontSize={11} fontWeight={600} textAnchor="start">
                      Goal
                    </text>
                  );
                }
                return null;
              }}
            />
          )}

          {/* Milestone Markers */}
          {milestones?.map((m, i) => {
            // Milestone year is relative (5, 10, 15, 20)
            // Need to map to actual timeline value
            let xVal = m.year;

            if (data.length > 0 && data[0].year > 10000) {
              // Data uses timestamps
              // Get the start year from first data point
              const startDate = new Date(data[0].year);
              const startYear = startDate.getFullYear();

              // Calculate absolute year (e.g., 2025 + 5 = 2030)
              const absoluteYear = startYear + m.year;

              // Convert to timestamp (Jan 1 of that year)
              xVal = new Date(absoluteYear, 0, 1).getTime();
            } else {
              // Data uses simple years, add to first year
              xVal = data[0].year + m.year;
            }

            return (
              <ReferenceLine
                key={i}
                x={xVal}
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="3 3"
                strokeOpacity={0.5}
                label={{
                  value: m.label,
                  position: "insideTop",
                  fill: "hsl(var(--muted-foreground))",
                  fontSize: 10,
                  dy: 10, // Push label down slightly from the very top edge
                }}
              />
            );
          })}

          {/* P90 — High scenario (upper band) */}
          <Area
            type="monotone"
            dataKey="p90"
            stroke="hsl(142, 71%, 45%)"
            strokeWidth={2.5}
            fill="url(#fanGradientHigh)"
            name="p90"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2 }}
          />

          {/* P50 — Medium (center line) */}
          <Area
            type="monotone"
            dataKey="p50"
            stroke="hsl(217, 91%, 60%)"
            strokeWidth={3}
            fill="url(#fanGradientMedium)"
            name="p50"
            dot={false}
            activeDot={{ r: 5, strokeWidth: 2 }}
          />

          {/* P10 — Low scenario (lower band) */}
          <Area
            type="monotone"
            dataKey="p10"
            stroke="hsl(0, 72%, 51%)"
            strokeWidth={2.5}
            fill="url(#fanGradientLow)"
            name="p10"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2 }}
          />

        </AreaChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-3">
        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground">
          <div className="w-3 h-[3px] rounded-full bg-green-500" />
          High (P90)
        </div>
        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground">
          <div className="w-3 h-[3px] rounded-full bg-primary" />
          Medium (P50)
        </div>
        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground">
          <div className="w-3 h-[3px] rounded-full bg-red-500" />
          Low (P10)
        </div>
        {goalAmount && (
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground">
            <div className="w-3 h-[3px] rounded-full bg-amber-500 border-dashed" />
            Goal
          </div>
        )}
      </div>
    </div>
  );
}
