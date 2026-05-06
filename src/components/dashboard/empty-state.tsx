"use client";

import Link from "next/link";
import { type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EmptyStateAction {
  label: string;
  href: string;
  icon?: LucideIcon;
  variant?: "default" | "outline" | "ghost";
}

interface EmptyStateProps {
  /** Icon displayed in the circle */
  icon: LucideIcon;
  /** Primary heading */
  title: string;
  /** Supporting description */
  description: string;
  /** Primary action button */
  action?: EmptyStateAction;
  /** Secondary action button */
  secondaryAction?: EmptyStateAction;
  /** Optional children for custom content */
  children?: React.ReactNode;
  /** Additional class names */
  className?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
}

/**
 * Reusable Empty State Component
 *
 * Used across the dashboard when no data is available:
 * - Dashboard Home (no portfolios/simulations)
 * - Portfolio Builder (no assets added)
 * - Simulation Lab (no simulations run)
 * - Outcomes (no results yet)
 *
 * Matches Stitch UI: Simulix Empty State
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  children,
  className,
  size = "md",
}: EmptyStateProps) {
  const sizes = {
    sm: {
      wrapper: "py-8",
      iconWrapper: "w-12 h-12",
      icon: "h-6 w-6",
      title: "text-base",
      description: "text-sm max-w-xs",
    },
    md: {
      wrapper: "py-12",
      iconWrapper: "w-16 h-16",
      icon: "h-8 w-8",
      title: "text-xl",
      description: "text-sm max-w-sm",
    },
    lg: {
      wrapper: "py-20",
      iconWrapper: "w-20 h-20",
      icon: "h-10 w-10",
      title: "text-2xl",
      description: "text-base max-w-md",
    },
  };

  const s = sizes[size];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        s.wrapper,
        className
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "rounded-full bg-muted flex items-center justify-center mb-4",
          s.iconWrapper
        )}
      >
        <Icon className={cn("text-muted-foreground", s.icon)} />
      </div>

      {/* Title */}
      <h3 className={cn("font-semibold text-foreground mb-2", s.title)}>
        {title}
      </h3>

      {/* Description */}
      <p
        className={cn(
          "text-muted-foreground mx-auto mb-6",
          s.description
        )}
      >
        {description}
      </p>

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3">
          {action && (
            <Button variant={action.variant || "default"} asChild>
              <Link href={action.href}>
                {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                {action.label}
              </Link>
            </Button>
          )}
          {secondaryAction && (
            <Button variant={secondaryAction.variant || "outline"} asChild>
              <Link href={secondaryAction.href}>
                {secondaryAction.icon && (
                  <secondaryAction.icon className="mr-2 h-4 w-4" />
                )}
                {secondaryAction.label}
              </Link>
            </Button>
          )}
        </div>
      )}

      {/* Custom Content */}
      {children && <div className="mt-6 w-full">{children}</div>}
    </div>
  );
}
