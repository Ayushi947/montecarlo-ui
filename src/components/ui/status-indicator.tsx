import { cn } from "@/lib/utils";
import { CheckCircle, AlertTriangle, XCircle, Clock } from "lucide-react";

type Status = "success" | "warning" | "error" | "pending" | "info";

interface StatusIndicatorProps {
  /** Status type */
  status: Status;
  /** Label text */
  label?: string;
  /** Show icon */
  showIcon?: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Additional className */
  className?: string;
}

/**
 * Status Indicator Component
 *
 * Visual status indicator matching Stitch UI.
 * Used for: Goal tracking (On Track/At Risk/Critical),
 * Simulation status, Order status, etc.
 */
export function StatusIndicator({
  status,
  label,
  showIcon = true,
  size = "md",
  className,
}: StatusIndicatorProps) {
  const config = {
    success: {
      icon: CheckCircle,
      bg: "bg-green-500/10",
      text: "text-green-600 dark:text-green-400",
      dot: "bg-green-500",
      defaultLabel: "Success",
    },
    warning: {
      icon: AlertTriangle,
      bg: "bg-amber-500/10",
      text: "text-amber-600 dark:text-amber-400",
      dot: "bg-amber-500",
      defaultLabel: "Warning",
    },
    error: {
      icon: XCircle,
      bg: "bg-red-500/10",
      text: "text-red-600 dark:text-red-400",
      dot: "bg-red-500",
      defaultLabel: "Error",
    },
    pending: {
      icon: Clock,
      bg: "bg-blue-500/10",
      text: "text-blue-600 dark:text-blue-400",
      dot: "bg-blue-500",
      defaultLabel: "Pending",
    },
    info: {
      icon: CheckCircle,
      bg: "bg-primary/10",
      text: "text-primary",
      dot: "bg-primary",
      defaultLabel: "Info",
    },
  };

  const { icon: Icon, bg, text, dot, defaultLabel } = config[status];
  const displayLabel = label ?? defaultLabel;

  const sizes = {
    sm: {
      container: "px-2 py-0.5 text-xs gap-1",
      icon: "h-3 w-3",
      dot: "h-1.5 w-1.5",
    },
    md: {
      container: "px-2.5 py-1 text-sm gap-1.5",
      icon: "h-4 w-4",
      dot: "h-2 w-2",
    },
    lg: {
      container: "px-3 py-1.5 text-base gap-2",
      icon: "h-5 w-5",
      dot: "h-2.5 w-2.5",
    },
  };

  const sizeConfig = sizes[size];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        bg,
        text,
        sizeConfig.container,
        className
      )}
    >
      {showIcon && <Icon className={sizeConfig.icon} />}
      <span>{displayLabel}</span>
    </span>
  );
}

/**
 * Status Dot (minimal indicator)
 */
export function StatusDot({
  status,
  className,
}: {
  status: Status;
  className?: string;
}) {
  const colors = {
    success: "bg-green-500",
    warning: "bg-amber-500",
    error: "bg-red-500",
    pending: "bg-blue-500",
    info: "bg-primary",
  };

  return (
    <span
      className={cn(
        "inline-block h-2 w-2 rounded-full",
        colors[status],
        className
      )}
    />
  );
}

/**
 * Goal Status Indicator
 *
 * Special variant for goal tracking gauges.
 * Shows: On Track (green), At Risk (yellow), Critical (red)
 */
export function GoalStatusIndicator({
  probabilityOfSuccess,
  className,
}: {
  probabilityOfSuccess: number;
  className?: string;
}) {
  let status: Status;
  let label: string;

  if (probabilityOfSuccess >= 80) {
    status = "success";
    label = "On Track";
  } else if (probabilityOfSuccess >= 50) {
    status = "warning";
    label = "At Risk";
  } else {
    status = "error";
    label = "Critical";
  }

  return (
    <StatusIndicator
      status={status}
      label={label}
      size="lg"
      className={className}
    />
  );
}

/**
 * Simulation Status Indicator
 */
export function SimulationStatusIndicator({
  status,
  className,
}: {
  status: "pending" | "queued" | "running" | "completed" | "failed";
  className?: string;
}) {
  const statusMap: Record<string, { status: Status; label: string }> = {
    pending: { status: "pending", label: "Pending" },
    queued: { status: "pending", label: "Queued" },
    running: { status: "info", label: "Running" },
    completed: { status: "success", label: "Completed" },
    failed: { status: "error", label: "Failed" },
  };

  const config = statusMap[status] ?? { status: "info", label: status };

  return (
    <StatusIndicator
      status={config.status}
      label={config.label}
      className={className}
    />
  );
}
