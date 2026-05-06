"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  FlaskConical,
  Loader2,
  Lock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  RotateCw,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuthStore } from "@/stores/auth-store";
import { useSimulationStore } from "@/stores/simulation-store";
import { listSimulationsApi } from "@/services/simulation-service";
import { mapApiSimulationToResult } from "@/lib/simulation-utils";
import { SimulationListSkeleton } from "@/components/dashboard/skeletons";
import type { SimulationResult } from "@/types";

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
 * Format currency with abbreviated suffixes
 */
function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString("en-US")}`;
}

/**
 * Simulation List Page
 *
 * Card grid of past simulations with create, view, and delete actions.
 * Pattern matches Portfolio Builder list page.
 */
export default function SimulateListPage() {
  const router = useRouter();

  // Auth store for plan limits
  const { user } = useAuthStore();
  const simulationsLimit = user?.simulationsLimit ?? 5;

  // Store state & actions
  const simulationHistory = useSimulationStore((s) => s.simulationHistory);
  const setSimulationHistory = useSimulationStore((s) => s.setSimulationHistory);
  const setSimulationsLoaded = useSimulationStore((s) => s.setSimulationsLoaded);
  const simulationsLoaded = useSimulationStore((s) => s.simulationsLoaded);
  const setCurrentSimulation = useSimulationStore((s) => s.setCurrentSimulation);

  // Use actual simulation count from loaded history for accurate limit check
  const simulationsUsed = simulationHistory.length;

  // Limit check (-1 means unlimited for Pro plan)
  const isUnlimited = simulationsLimit === -1;
  const atLimit = !isUnlimited && simulationsUsed >= simulationsLimit;

  // Clear currentSimulation on mount (we're on the list view)
  React.useEffect(() => {
    setCurrentSimulation(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch simulations from API on mount
  React.useEffect(() => {
    if (simulationsLoaded) return;
    let cancelled = false;

    listSimulationsApi()
      .then((response) => {
        if (cancelled) return;
        if (response.success && response.data) {
          const mapped = response.data.map(mapApiSimulationToResult);
          setSimulationHistory(mapped);
        }
        setSimulationsLoaded(true);
      })
      .catch(() => {
        if (cancelled) return;
        setSimulationsLoaded(true);
        toast.error("Couldn't load simulations", {
          description: "Using locally saved data. Check your connection.",
        });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Handlers ───

  // New handler for rerunning simulations
  const handleRerunSimulation = async (e: React.MouseEvent, sim: SimulationResult) => {
    e.stopPropagation(); // Prevent opening the detail view

    // Optimistic UI update: mark as pending immediately
    const previousHistory = [...simulationHistory];
    const updatedHistory = simulationHistory.map(s =>
      s.id === sim.id
        ? { ...s, status: "pending" as const } // Cast needed for union type
        : s
    );
    setSimulationHistory(updatedHistory);

    try {
      // Import dynamically to avoid circular dependencies if any
      const { rerunSimulationApi } = await import("@/services/simulation-service");
      await rerunSimulationApi(sim.id);

      toast.success("Simulation queued", {
        description: "Redirecting to tracking page...",
      });

      // Redirect to detail page to watch progress
      router.push(`/dashboard/simulate/${sim.id}`);

    } catch (error) {
      // Revert on failure
      setSimulationHistory(previousHistory);
      toast.error("Failed to rerun", {
        description: "Could not restart the simulation. Please try again.",
      });
    }
  };

  const handleOpenSimulation = (sim: SimulationResult) => {
    setCurrentSimulation(sim);
    router.push(`/dashboard/simulate/${sim.id}`);
  };

  const handleNewSimulation = () => {
    if (atLimit) {
      toast.error("Simulation limit reached", {
        description: "Upgrade your plan to run more simulations.",
      });
      return;
    }
    router.push("/dashboard/simulate/new");
  };

  // ─── Status Badge ───
  const getStatusBadge = (status: SimulationResult["status"]) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="outline" className="text-[10px] h-5 gap-1 text-green-600 border-green-200 dark:border-green-900">
            <CheckCircle2 className="h-3 w-3" />
            Completed
          </Badge>
        );
      case "running":
      case "pending":
      case "queued":
        return (
          <Badge variant="outline" className="text-[10px] h-5 gap-1 text-amber-600 border-amber-200 dark:border-amber-900">
            <Loader2 className="h-3 w-3 animate-spin" />
            Processing
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="outline" className="text-[10px] h-5 gap-1 text-red-600 border-red-200 dark:border-red-900">
            <XCircle className="h-3 w-3" />
            Failed
          </Badge>
        );
      default:
        return null;
    }
  };

  // ─── Loading State ───
  if (!simulationsLoaded) {
    return <SimulationListSkeleton />;
  }

  return (
    <TooltipProvider>
      <div className="space-y-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Simulation Lab
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Run Monte Carlo simulations on your portfolios
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {isUnlimited
                ? `${simulationsUsed} simulations this month`
                : `${simulationsUsed} of ${simulationsLimit} simulations this month`}
            </span>

            {atLimit ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" disabled className="gap-2">
                    <Lock className="h-4 w-4" />
                    New Simulation
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Upgrade your plan to run more simulations</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Button size="sm" onClick={handleNewSimulation} className="gap-2">
                <Plus className="h-4 w-4" />
                New Simulation
              </Button>
            )}
          </div>
        </div>

        {simulationHistory.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {simulationHistory.map((sim) => (
              <button
                key={sim.id}
                onClick={() => handleOpenSimulation(sim)}
                className="group relative text-left rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 overflow-hidden"
              >
                {/* Card content */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="truncate mr-2">
                      <p className="font-semibold text-foreground truncate">
                        {sim.name || "Untitled Simulation"}
                        {sim.portfolioName && (
                          <span className="text-muted-foreground font-normal text-xs ml-1">
                            ({sim.portfolioName})
                          </span>
                        )}
                      </p>
                    </div>
                    {getStatusBadge(sim.status)}
                  </div>

                  {/* Parameters grid */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-3">
                    <div>
                      <p className="text-[10px] text-muted-foreground">Initial</p>
                      <p className="text-xs font-mono font-medium text-foreground">
                        {formatCurrency(sim.config.initialInvestment)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Monthly</p>
                      <p className="text-xs font-mono font-medium text-foreground">
                        {formatCurrency(sim.config.monthlyContribution)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Horizon</p>
                      <p className="text-xs font-mono font-medium text-foreground">
                        {sim.config.yearsToProject} yrs
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Iterations</p>
                      <p className="text-xs font-mono font-medium text-foreground">
                        {sim.config.iterations.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Medium result for completed */}
                  {sim.status === "completed" && sim.medianTerminalWealth > 0 && (
                    <p className="text-sm font-semibold text-primary tabular-nums">
                      Medium: {formatCurrency(sim.medianTerminalWealth)}
                    </p>
                  )}

                  {/* RERUN BUTTON FOR FAILED SIMULATIONS */}
                  {sim.status === "failed" && (
                    <div
                      onClick={(e) => handleRerunSimulation(e, sim)}
                      className="mt-2 inline-flex items-center justify-center rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-7 px-3 w-full"
                    >
                      <RotateCw className="mr-2 h-3.5 w-3.5" />
                      Run Again
                    </div>
                  )}
                </div>

                {/* Bottom bar */}
                <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/20 group-hover:bg-primary/5 transition-colors">
                  <p className="text-xs text-muted-foreground">
                    {formatRelativeTime(sim.createdAt)}
                  </p>
                  <div className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Open</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </button>
            ))}

            {/* New Simulation card */}
            {atLimit ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center justify-center p-5 rounded-xl border-2 border-dashed border-border bg-muted/10 opacity-60 gap-2 min-h-[200px] cursor-not-allowed">
                    <Lock className="h-6 w-6 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Limit Reached
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Upgrade to run more
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Upgrade your plan to run more simulations</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <button
                onClick={handleNewSimulation}
                className="flex flex-col items-center justify-center p-5 rounded-xl border-2 border-dashed border-border bg-muted/10 hover:border-primary/50 hover:bg-muted/30 transition-all gap-2 min-h-[200px]"
              >
                <Plus className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  New Simulation
                </span>
                <span className="text-xs text-muted-foreground">
                  {isUnlimited
                    ? "Unlimited"
                    : `${Math.max(0, simulationsLimit - simulationsUsed)} remaining this month`}
                </span>
              </button>
            )}
          </div>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-border bg-muted/20 py-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <FlaskConical className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              No simulations yet
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Run your first Monte Carlo simulation to project portfolio outcomes
              across thousands of scenarios.
            </p>
            <Button onClick={handleNewSimulation} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Simulation
            </Button>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
