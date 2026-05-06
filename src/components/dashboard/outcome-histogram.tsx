"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";

interface HistogramBin {
  range: string;
  rangeStart: number;
  rangeEnd: number;
  frequency: number;
  probability: number;
}

interface OutcomeHistogramProps {
  data: HistogramBin[];
  median: number;
  mean: number;
  goalAmount?: number;
  height?: number;
  className?: string;
}

/**
 * Custom tooltip for the histogram
 */
function HistogramTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    payload: HistogramBin;
  }>;
}) {
  if (!active || !payload || !payload[0]) return null;

  const bin = payload[0].payload;
  const formatCurrency = (val: number) => {
    if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
    if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
    return `$${val}`;
  };

  return (
    <div className="bg-popover border border-border rounded-lg shadow-lg px-4 py-3 min-w-[180px]">
      <p className="text-sm font-semibold text-foreground mb-1">
        {formatCurrency(bin.rangeStart)} – {formatCurrency(bin.rangeEnd)}
      </p>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4 text-xs">
          <span className="text-muted-foreground">Probability</span>
          <span className="font-mono font-medium text-foreground">
            {bin.probability.toFixed(1)}%
          </span>
        </div>
        <div className="flex items-center justify-between gap-4 text-xs">
          <span className="text-muted-foreground">Scenarios</span>
          <span className="font-mono font-medium text-foreground">
            {bin.frequency.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Outcome Distribution Histogram
 *
 * Displays the probability distribution of terminal wealth outcomes
 * from a Monte Carlo simulation as a bar chart (histogram).
 *
 * Features:
 * - Bins colored by whether they exceed the goal amount
 * - Reference lines for Medium, Mean, and Goal target
 * - Probability (%) on Y-axis, corpus value ($) on X-axis
 * - Custom tooltip with range, probability, and scenario count
 *
 * Matches Stitch UI: Outcome Distribution Lab chart
 */
export function OutcomeHistogram({
  data,
  median,
  mean,
  goalAmount,
  height = 340,
  className,
}: OutcomeHistogramProps) {
  const formatXAxis = (value: number) => {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
    return `$${value}`;
  };

  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          barCategoryGap="8%"
        >
          <defs>
            <linearGradient id="barGradientSuccess" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.9} />
              <stop offset="100%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.6} />
            </linearGradient>
            <linearGradient id="barGradientFail" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.4} />
              <stop offset="100%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.2} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            opacity={0.5}
            vertical={false}
          />

          <XAxis
            dataKey="rangeStart"
            tickFormatter={formatXAxis}
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={{ stroke: "hsl(var(--border))" }}
            interval={1}
          />

          <YAxis
            tickFormatter={(v: number) => `${v.toFixed(0)}%`}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={false}
            width={45}
          />

          <Tooltip content={<HistogramTooltip />} cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }} />

          {/* Goal Reference Line — only shown when goal is set */}
          {goalAmount && goalAmount > 0 && (
            <ReferenceLine
              x={goalAmount}
              stroke="hsl(38, 92%, 50%)"
              strokeDasharray="6 4"
              strokeWidth={2}
              label={{
                value: "Goal",
                position: "top",
                fill: "hsl(38, 92%, 50%)",
                fontSize: 11,
                fontWeight: 600,
              }}
            />
          )}

          {/* Medium Reference Line */}
          <ReferenceLine
            x={median}
            stroke="hsl(217, 91%, 60%)"
            strokeDasharray="4 3"
            strokeWidth={1.5}
            label={{
              value: "Medium",
              position: "top",
              fill: "hsl(217, 91%, 60%)",
              fontSize: 10,
              fontWeight: 500,
            }}
          />

          {/* Mean Reference Line */}
          <ReferenceLine
            x={mean}
            stroke="hsl(142, 71%, 45%)"
            strokeDasharray="4 3"
            strokeWidth={1.5}
            label={{
              value: "Mean",
              position: "top",
              fill: "hsl(142, 71%, 45%)",
              fontSize: 10,
              fontWeight: 500,
            }}
          />

          <Bar dataKey="probability" radius={[4, 4, 0, 0]} maxBarSize={40}>
            {data.map((bin, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  goalAmount && goalAmount > 0 && bin.rangeStart >= goalAmount
                    ? "url(#barGradientSuccess)"
                    : goalAmount && goalAmount > 0
                    ? "url(#barGradientFail)"
                    : "url(#barGradientSuccess)"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-3">
        {goalAmount && goalAmount > 0 && (
          <>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="w-3 h-3 rounded-sm bg-primary/70" />
              Above Goal
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="w-3 h-3 rounded-sm bg-muted-foreground/30" />
              Below Goal
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="w-3 h-[3px] rounded-full bg-amber-500" />
              Goal Target
            </div>
          </>
        )}
        {!goalAmount && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="w-3 h-3 rounded-sm bg-primary/70" />
            Probability
          </div>
        )}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="w-3 h-[3px] rounded-full bg-primary" />
          Medium
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="w-3 h-[3px] rounded-full bg-green-500" />
          Mean
        </div>
      </div>
    </div>
  );
}

/**
 * Generate histogram bins from a log-normal distribution
 *
 * Monte Carlo terminal wealth follows a log-normal distribution because
 * returns are multiplicative. This function creates realistic bins by
 * sampling from the distribution defined by the simulation percentiles.
 */
export function generateHistogramData(options: {
  p10: number;
  p50: number;
  p90: number;
  iterations: number;
  binCount?: number;
}): {
  bins: HistogramBin[];
  mean: number;
  standardDeviation: number;
  skewness: number;
  kurtosis: number;
} {
  const { p10, p50, p90, iterations, binCount = 16 } = options;

  // Derive log-normal parameters from percentiles
  // For log-normal: ln(X) ~ N(mu, sigma)
  // P50 = exp(mu) => mu = ln(P50)
  // P10 = exp(mu - 1.2816 * sigma) => sigma = (mu - ln(P10)) / 1.2816
  const mu = Math.log(p50);
  const sigma = (mu - Math.log(p10)) / 1.2816;

  // Generate bin ranges
  const minValue = Math.max(0, p10 * 0.5);
  const maxValue = p90 * 1.5;
  const binWidth = (maxValue - minValue) / binCount;

  const bins: HistogramBin[] = [];
  let totalFrequency = 0;

  for (let i = 0; i < binCount; i++) {
    const rangeStart = minValue + i * binWidth;
    const rangeEnd = rangeStart + binWidth;

    // Log-normal CDF approximation for each bin
    const cdfStart = logNormalCDF(rangeStart, mu, sigma);
    const cdfEnd = logNormalCDF(rangeEnd, mu, sigma);
    const probability = (cdfEnd - cdfStart) * 100;
    const frequency = Math.round(probability * iterations / 100);

    bins.push({
      range: `${formatBinValue(rangeStart)}-${formatBinValue(rangeEnd)}`,
      rangeStart: Math.round(rangeStart),
      rangeEnd: Math.round(rangeEnd),
      frequency,
      probability: Math.round(probability * 10) / 10,
    });

    totalFrequency += frequency;
  }

  // Log-normal statistics
  const mean = Math.exp(mu + (sigma * sigma) / 2);
  const variance = (Math.exp(sigma * sigma) - 1) * Math.exp(2 * mu + sigma * sigma);
  const standardDeviation = Math.sqrt(variance);
  const skewness = (Math.exp(sigma * sigma) + 2) * Math.sqrt(Math.exp(sigma * sigma) - 1);
  const kurtosis = Math.exp(4 * sigma * sigma) + 2 * Math.exp(3 * sigma * sigma) +
    3 * Math.exp(2 * sigma * sigma) - 6;

  return { bins, mean, standardDeviation, skewness, kurtosis };
}

/**
 * Log-normal cumulative distribution function
 */
function logNormalCDF(x: number, mu: number, sigma: number): number {
  if (x <= 0) return 0;
  return normalCDF((Math.log(x) - mu) / sigma);
}

/**
 * Standard normal CDF (using error function approximation)
 */
function normalCDF(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return 0.5 * (1.0 + sign * y);
}

function formatBinValue(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${Math.round(value)}`;
}
