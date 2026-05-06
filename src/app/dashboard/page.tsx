"use client";

import * as React from "react";
import Link from "next/link";
import {
  Briefcase,
  FlaskConical,
  ArrowRight,
  Zap,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Crown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuthStore } from "@/stores/auth-store";
import { useSimulationStore } from "@/stores/simulation-store";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
  OnboardingChecklist,
  getDefaultOnboardingSteps,
} from "@/components/dashboard/onboarding-checklist";
import { Rocket } from "lucide-react";
import { toast } from "sonner";
import { getDashboardOverviewApi } from "@/services/dashboard-service";
import { mapApiPortfolioToBucket, getTopAssetLabel } from "@/lib/portfolio-utils";
import { mapApiSimulationToResult } from "@/lib/simulation-utils";
import { DashboardSkeleton } from "@/components/dashboard/skeletons";
import { cn } from "@/lib/utils";

/**
 * Time-based greeting
 */
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/**
 * Format relative time
 */
function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Format currency value compactly
 */
function formatWealth(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

/**
 * Status icon/color mapping
 */
const statusConfig = {
  completed: {
    icon: CheckCircle,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    label: "Completed",
  },
  running: {
    icon: Loader2,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    label: "Running",
  },
  pending: {
    icon: Clock,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    label: "Pending",
  },
  failed: {
    icon: XCircle,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    label: "Failed",
  },
};

/**
 * Plan display configuration
 */
const planConfig = {
  free: { label: "Free", color: "text-muted-foreground", icon: Zap },
  basic: { label: "Basic", color: "text-blue-600", icon: Zap },
  pro: { label: "Pro", color: "text-purple-600", icon: Crown },
};

/**
 * Dashboard Home Page
 *
 * Clean, focused dashboard showing:
 * 1. Usage stats (plan, portfolios, simulations, remaining)
 * 2. Recent simulations
 * 3. Recent portfolios
 *
 * All data from single /dashboard API
 */
export default function DashboardPage() {
  const { user } = useAuthStore();
  const savedBuckets = useSimulationStore((s) => s.savedBuckets);
  const simulationHistory = useSimulationStore((s) => s.simulationHistory);
  const setSavedBuckets = useSimulationStore((s) => s.setSavedBuckets);
  const portfoliosLoaded = useSimulationStore((s) => s.portfoliosLoaded);
  const setPortfoliosLoaded = useSimulationStore((s) => s.setPortfoliosLoaded);
  const simulationsLoaded = useSimulationStore((s) => s.simulationsLoaded);
  const setSimulationsLoaded = useSimulationStore((s) => s.setSimulationsLoaded);
  const setSimulationHistory = useSimulationStore((s) => s.setSimulationHistory);

  const firstName = user?.firstName || "User";
  const greeting = getGreeting();

  // Track loading state for skeleton
  const dataLoaded = portfoliosLoaded && simulationsLoaded;

  // Single API call to load both portfolios and simulations
  React.useEffect(() => {
    if (dataLoaded) return;
    let cancelled = false;

    getDashboardOverviewApi()
      .then((response) => {
        if (cancelled) return;
        if (response.success && response.data) {
          const buckets = response.data.portfolios.map(mapApiPortfolioToBucket);
          const results = response.data.simulations.map(mapApiSimulationToResult);
          setSavedBuckets(buckets);
          setSimulationHistory(results);
        }
        setPortfoliosLoaded(true);
        setSimulationsLoaded(true);
      })
      .catch(() => {
        if (cancelled) return;
        setPortfoliosLoaded(true);
        setSimulationsLoaded(true);
        toast.error("Couldn't load dashboard data", {
          description: "Using locally saved data. Check your connection.",
        });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Derived data
  const portfolioCount = savedBuckets.length;
  const portfoliosLimit = user?.portfoliosLimit ?? 3;
  const simulationsUsed = user?.simulationsUsed ?? 0;
  const simulationsLimit = user?.simulationsLimit ?? 2;
  const currentPlan = user?.plan ?? "free";
  const planInfo = planConfig[currentPlan] ?? planConfig.free;
  const PlanIcon = planInfo.icon;
  // -1 means unlimited (Pro plan)
  const isSimulationUnlimited = simulationsLimit === -1;
  const isPortfolioUnlimited = portfoliosLimit === -1;

  // Loading state — show skeleton shimmer
  if (!dataLoaded) {
    return <DashboardSkeleton />;
  }

  // Detect empty state (no real data yet)
  const isEmpty = savedBuckets.length === 0 && simulationHistory.length === 0;

  // Onboarding steps for empty state
  const onboardingSteps = getDefaultOnboardingSteps({
    hasPortfolios: savedBuckets.length > 0,
    hasSimulations: simulationHistory.length > 0,
    hasResults: simulationHistory.some((s) => s.status === "completed"),
  });

  // Empty State View
  if (isEmpty) {
    return (
      <div className="space-y-4">
        {/* Welcome Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            {greeting}, {firstName} 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Let&apos;s set up your first portfolio simulation.
          </p>
        </div>

        {/* Empty State Hero */}
        <Card className="border-border">
          <CardContent className="pt-0">
            <EmptyState
              icon={Rocket}
              title="Welcome to Simulix!"
              description="Build a portfolio, run Monte Carlo simulations, and analyze outcomes — all in one place. Follow the steps below to get started."
              size="lg"
            />
          </CardContent>
        </Card>

        {/* Onboarding Checklist */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Your Setup Checklist</CardTitle>
            <CardDescription>
              Complete these steps to unlock the full power of Simulix.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OnboardingChecklist steps={onboardingSteps} />
          </CardContent>
        </Card>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/dashboard/builder">
              <Briefcase className="mr-2 h-4 w-4" />
              Create Portfolio
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/simulate/new">
              <FlaskConical className="mr-2 h-4 w-4" />
              Run Simulation
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          {greeting}, {firstName} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s your account overview.
        </p>
      </div>

      {/* Usage Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        {/* Current Plan */}
        <Card className="border-border">
          <CardContent className="pt-5">
            <div className="flex items-center gap-3 mb-2">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                currentPlan === "pro" ? "bg-purple-100 dark:bg-purple-900/30" :
                currentPlan === "basic" ? "bg-blue-100 dark:bg-blue-900/30" :
                "bg-muted"
              )}>
                <PlanIcon className={cn("h-5 w-5", planInfo.color)} />
              </div>
            </div>
            <p className={cn("text-2xl font-bold", planInfo.color)}>
              {planInfo.label}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Current Plan</p>
          </CardContent>
        </Card>

        {/* Portfolios Created */}
        <Card className="border-border">
          <CardContent className="pt-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {portfolioCount}
              {!isPortfolioUnlimited && (
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  / {portfoliosLimit}
                </span>
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {isPortfolioUnlimited ? "Portfolios (Unlimited)" : "Portfolios Created"}
            </p>
          </CardContent>
        </Card>

        {/* Simulations Run */}
        <Card className="border-border">
          <CardContent className="pt-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <FlaskConical className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {simulationsUsed}
              {!isSimulationUnlimited && (
                <span className="text-sm font-normal text-muted-foreground ml-1">
                  / {simulationsLimit}
                </span>
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {isSimulationUnlimited ? "Simulations (Unlimited)" : "Simulations Run"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Simulations + Portfolios */}
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Recent Simulations */}
        <Card className="lg:col-span-3 border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium">
                  Recent Simulations
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Your latest Monte Carlo runs
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-xs" asChild>
                <Link href="/dashboard/simulate">
                  View All
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {simulationHistory.length > 0 ? (
              <div className="space-y-2">
                {simulationHistory.slice(0, 5).map((sim) => {
                  const statusKey = sim.status === "queued" ? "pending" : sim.status;
                  const config = statusConfig[statusKey as keyof typeof statusConfig] ?? statusConfig.pending;
                  const StatusIcon = config.icon;

                  return (
                    <Link
                      key={sim.id}
                      href={`/dashboard/simulate/${sim.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                          config.bgColor
                        )}>
                          <StatusIcon className={cn("h-4 w-4", config.color)} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {sim.name || sim.portfolioName || "Simulation"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {sim.config.yearsToProject}yr • {formatRelativeTime(sim.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        {sim.status === "completed" && sim.targetCorpus && sim.targetCorpus > 0 && (
                          <div className="text-right hidden sm:block">
                            <p className="text-xs text-muted-foreground">Target</p>
                            <p className="text-sm font-medium">{formatWealth(sim.targetCorpus)}</p>
                          </div>
                        )}
                        {sim.status === "completed" && (
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Median</p>
                            <p className="text-sm font-semibold text-foreground">
                              {formatWealth(sim.medianTerminalWealth)}
                            </p>
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <FlaskConical className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No simulations yet</p>
                <Button size="sm" className="mt-3" asChild>
                  <Link href="/dashboard/simulate/new">Run Your First</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Portfolios */}
        <Card className="lg:col-span-2 border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-medium">
                  Recent Portfolios
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Your saved allocations
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-xs" asChild>
                <Link href="/dashboard/builder">
                  Manage
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {savedBuckets.length > 0 ? (
              <div className="space-y-2">
                {savedBuckets.slice(0, 5).map((bucket) => {
                  const totalWeight = bucket.assets.reduce((sum, a) => sum + a.weight, 0);
                  const isValid = Math.abs(totalWeight - 100) < 0.01;

                  return (
                    <Link
                      key={bucket.id}
                      href={`/dashboard/builder/${bucket.id}`}
                      className="block p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/30 transition-all"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-sm font-medium text-foreground truncate">
                          {bucket.name}
                        </p>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] h-5",
                            isValid
                              ? "text-green-600 border-green-200 dark:border-green-900"
                              : "text-yellow-600 border-yellow-200 dark:border-yellow-900"
                          )}
                        >
                          {isValid ? "Valid" : "Draft"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{bucket.assets.length} assets • {getTopAssetLabel(bucket.assets)}</span>
                        <span>{formatRelativeTime(bucket.updatedAt)}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Briefcase className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No portfolios yet</p>
                <Button size="sm" className="mt-3" asChild>
                  <Link href="/dashboard/builder">Create Portfolio</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
