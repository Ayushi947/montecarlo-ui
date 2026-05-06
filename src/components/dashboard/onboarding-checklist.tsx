"use client";

import Link from "next/link";
import {
  Briefcase,
  FlaskConical,
  BarChart3,
  CheckCircle,
  Circle,
  ArrowRight,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  completed: boolean;
}

interface OnboardingChecklistProps {
  steps: OnboardingStep[];
  className?: string;
}

/**
 * Onboarding Checklist Component
 *
 * Shows a 3-step getting started flow:
 * 1. Build your first portfolio
 * 2. Run your first simulation
 * 3. Analyze the results
 *
 * Each step is clickable and navigates to the relevant page.
 * Completed steps show a checkmark.
 *
 * Matches Stitch UI: Simulix Onboarding Flow
 */
export function OnboardingChecklist({
  steps,
  className,
}: OnboardingChecklistProps) {
  const completedCount = steps.filter((s) => s.completed).length;
  const progressPercent = (completedCount / steps.length) * 100;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Progress Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">
          Getting Started ({completedCount}/{steps.length})
        </p>
        <p className="text-xs text-muted-foreground">
          {Math.round(progressPercent)}% complete
        </p>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-500 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {steps.map((step, index) => (
          <Link
            key={step.id}
            href={step.href}
            className={cn(
              "flex items-center gap-4 p-4 rounded-lg border transition-all group",
              step.completed
                ? "border-green-200 dark:border-green-900/50 bg-green-50/50 dark:bg-green-900/10"
                : "border-border hover:border-primary/50 hover:bg-muted/50"
            )}
          >
            {/* Step Number / Check */}
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                step.completed
                  ? "bg-green-100 dark:bg-green-900/30"
                  : "bg-primary/10"
              )}
            >
              {step.completed ? (
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <step.icon className="h-5 w-5 text-primary" />
              )}
            </div>

            {/* Step Content */}
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "text-sm font-medium",
                  step.completed
                    ? "text-green-700 dark:text-green-400 line-through"
                    : "text-foreground"
                )}
              >
                {step.title}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {step.description}
              </p>
            </div>

            {/* Arrow */}
            {!step.completed && (
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

/**
 * Default onboarding steps factory
 */
export function getDefaultOnboardingSteps(options: {
  hasPortfolios: boolean;
  hasSimulations: boolean;
  hasResults: boolean;
}): OnboardingStep[] {
  return [
    {
      id: "portfolio",
      title: "Build your first portfolio",
      description: "Add ETFs, stocks, or indices and set target weights",
      href: "/dashboard/builder",
      icon: Briefcase,
      completed: options.hasPortfolios,
    },
    {
      id: "simulation",
      title: "Run a Monte Carlo simulation",
      description: "Generate 10,000+ scenarios to see possible outcomes",
      href: "/dashboard/simulate",
      icon: FlaskConical,
      completed: options.hasSimulations,
    },
    {
      id: "analyze",
      title: "Analyze the results",
      description: "Review outcome distributions and risk metrics",
      href: "/dashboard/outcomes",
      icon: BarChart3,
      completed: options.hasResults,
    },
  ];
}
