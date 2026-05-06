"use client";

import { cn } from "@/lib/utils";

interface GoalGaugeProps {
  probabilityOfSuccess: number; // 0-100
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Determine gauge status based on probability of success
 */
function getGaugeStatus(probability: number): {
  label: string;
  color: string;
  strokeColor: string;
  bgColor: string;
} {
  if (probability >= 75) {
    return {
      label: "Safe",
      color: "text-green-600 dark:text-green-400",
      strokeColor: "hsl(142, 71%, 45%)",
      bgColor: "bg-green-50 dark:bg-green-950/30",
    };
  }
  if (probability >= 50) {
    return {
      label: "Moderate",
      color: "text-amber-600 dark:text-amber-400",
      strokeColor: "hsl(38, 92%, 50%)",
      bgColor: "bg-amber-50 dark:bg-amber-950/30",
    };
  }
  if (probability >= 25) {
    return {
      label: "At Risk",
      color: "text-orange-600 dark:text-orange-400",
      strokeColor: "hsl(25, 95%, 53%)",
      bgColor: "bg-orange-50 dark:bg-orange-950/30",
    };
  }
  return {
    label: "Critical",
    color: "text-red-600 dark:text-red-400",
    strokeColor: "hsl(0, 72%, 51%)",
    bgColor: "bg-red-50 dark:bg-red-950/30",
  };
}

const SIZE_CONFIG = {
  sm: { svgSize: 120, strokeWidth: 8, radius: 48, fontSize: "text-xl", labelSize: "text-[10px]" },
  md: { svgSize: 160, strokeWidth: 10, radius: 65, fontSize: "text-3xl", labelSize: "text-xs" },
  lg: { svgSize: 200, strokeWidth: 12, radius: 82, fontSize: "text-4xl", labelSize: "text-sm" },
};

/**
 * Goal Tracking Gauge
 *
 * A circular SVG gauge that shows the probability of successfully
 * reaching the financial goal based on Monte Carlo simulation results.
 *
 * Visual states:
 * - >= 75%: Green "Safe"
 * - >= 50%: Amber "Moderate"
 * - >= 25%: Orange "At Risk"
 * - < 25%:  Red "Critical"
 *
 * Uses an SVG semicircle arc with stroke-dasharray animation.
 *
 * Matches Stitch UI: Simulation Lab goal tracking gauge
 */
export function GoalGauge({
  probabilityOfSuccess,
  size = "md",
  className,
}: GoalGaugeProps) {
  const status = getGaugeStatus(probabilityOfSuccess);
  const config = SIZE_CONFIG[size];

  // SVG arc calculations (semicircle from 180° to 360°)
  const circumference = 2 * Math.PI * config.radius;
  // We use 75% of the circle (270 degrees arc)
  const arcLength = circumference * 0.75;
  const filledLength = (probabilityOfSuccess / 100) * arcLength;
  const dashOffset = arcLength - filledLength;

  const center = config.svgSize / 2;

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative">
        <svg
          width={config.svgSize}
          height={config.svgSize}
          viewBox={`0 0 ${config.svgSize} ${config.svgSize}`}
          className="transform -rotate-[135deg]"
        >
          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={config.radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={config.strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
            opacity={0.3}
          />

          {/* Filled arc */}
          <circle
            cx={center}
            cy={center}
            r={config.radius}
            fill="none"
            stroke={status.strokeColor}
            strokeWidth={config.strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn(config.fontSize, "font-bold tabular-nums", status.color)}>
            {probabilityOfSuccess.toFixed(0)}%
          </span>
          <span className={cn(config.labelSize, "font-medium", status.color)}>
            {status.label}
          </span>
        </div>
      </div>

      {/* Label below */}
      <p className="text-xs text-muted-foreground mt-1 text-center">
        Probability of Success
      </p>
    </div>
  );
}
