"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Loader2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  Target,
  Pencil,
  Check,
  X,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useSimulationStore } from "@/stores/simulation-store";
import {
  getSimulationApi,
  updateSimulationApi,
} from "@/services/simulation-service";
import { mapApiSimulationToResult } from "@/lib/simulation-utils";
import { SimulationFanChart } from "@/components/dashboard/simulation-fan-chart";
import { AllocationChart } from "@/components/dashboard/allocation-chart";
import { SimulationDetailSkeleton } from "@/components/dashboard/skeletons";
import type { SimulationResult } from "@/types";

// ─── Helpers ───

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

/**
 * Simulation Detail Page
 *
 * Clean, focused view of simulation results:
 * - Fan chart with P10/P50/P90 projection bands
 * - Key outcome metrics
 * - Goal analysis (if target was set)
 * - Recommendations
 */
export default function SimulationDetailPage() {
  const params = useParams();
  const simulationId = params.id as string;

  // Store
  const setCurrentSimulation = useSimulationStore(
    (s) => s.setCurrentSimulation,
  );
  const updateSimulationInHistory = useSimulationStore(
    (s) => s.updateSimulationInHistory,
  );

  // Local state
  const [simulation, setSimulation] = React.useState<SimulationResult | null>(
    null,
  );
  const [isLoading, setIsLoading] = React.useState(true);
  // const [showProbability, setShowProbability] = React.useState(true); // Removed
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  // Edit name state
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [editedName, setEditedName] = React.useState("");
  const [isSavingName, setIsSavingName] = React.useState(false);

  const cancelledRef = React.useRef(false);
  const pollIdRef = React.useRef(0);

  // ─── View Mode State ───
  // ... (rest of view mode state)

  // ... (useMemo filtering logic - keeping unchanged)

  // ─── Initial fetch ───
  React.useEffect(() => {
    cancelledRef.current = false;
    setIsLoading(true);

    getSimulationApi(simulationId)
      .then((response) => {
        if (cancelledRef.current) return;
        const status = response.data?.status;

        if (status === "processing" || status === "pending") {
          setIsProcessing(true);
          setIsLoading(false);
          startPolling();
        } else if (response.success && response.data) {
          const mapped = mapApiSimulationToResult(response.data);
          setSimulation(mapped);
          setCurrentSimulation(mapped);
          setIsLoading(false);
        } else {
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (cancelledRef.current) return;
        setIsLoading(false);
        toast.error("Failed to load simulation");
      });

    return () => {
      cancelledRef.current = true;
      // Invalidate any active polling on unmount
      pollIdRef.current++;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulationId]);

  // ─── Polling for processing simulations ───
  const startPolling = React.useCallback(() => {
    // Increment ID to invalidate any previous pollers
    const myPollId = ++pollIdRef.current;

    let pollCount = 0;
    const maxPolls = 100;
    const pollInterval = 3000;

    const progressTimer = setInterval(() => {
      // Check if we've been superceded
      if (myPollId !== pollIdRef.current) {
        clearInterval(progressTimer);
        return;
      }
      setProgress((prev) => (prev >= 95 ? 95 : prev + Math.random() * 8));
    }, 300);

    const poll = async () => {
      // 1. Global cancel check
      if (cancelledRef.current) {
        clearInterval(progressTimer);
        return;
      }
      // 2. Unique poller check
      if (myPollId !== pollIdRef.current) {
        clearInterval(progressTimer);
        return;
      }

      if (pollCount >= maxPolls) {
        clearInterval(progressTimer);
        toast.info("Simulation is taking longer than expected.");
        return;
      }

      try {
        const response = await getSimulationApi(simulationId);

        // Re-check after await
        if (cancelledRef.current || myPollId !== pollIdRef.current) {
          clearInterval(progressTimer);
          return;
        }

        const status = response.data?.status;
        pollCount++;

        if (status === "completed" && response.success && response.data) {
          const mapped = mapApiSimulationToResult(response.data);
          setSimulation(mapped);
          setCurrentSimulation(mapped);
          updateSimulationInHistory(mapped);
          setIsProcessing(false);
          clearInterval(progressTimer);
          setProgress(100);
          toast.success("Simulation complete");
        } else if (status === "failed") {
          setIsProcessing(false);
          clearInterval(progressTimer);
          toast.error("Simulation failed");
        } else {
          setTimeout(poll, pollInterval);
        }
      } catch {
        clearInterval(progressTimer);
        // Only show error if we are still the active poller
        if (myPollId === pollIdRef.current) {
          toast.error("Error checking simulation status");
        }
      }
    };

    poll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulationId]);
  const [viewMode, setViewMode] = React.useState<"day" | "month" | "year">("year");
  const [showReal, setShowReal] = React.useState(false);
  const [showPostTax, setShowPostTax] = React.useState(false);

  // ─── Prepare chart data (Initial Full Set) ───
  const allChartData = React.useMemo(() => {
    if (!simulation) return [];
    return simulation.timeline.map((year, i) => ({
      year,
      nominalP10: simulation.percentiles.p10[i] || 0,
      nominalP50: simulation.percentiles.p50[i] || 0,
      nominalP90: simulation.percentiles.p90[i] || 0,
      realP10: simulation.realPercentiles?.p10[i] ?? simulation.percentiles.p10[i],
      realP50: simulation.realPercentiles?.p50[i] ?? simulation.percentiles.p50[i],
      realP90: simulation.realPercentiles?.p90[i] ?? simulation.percentiles.p90[i],
      postTaxP10: simulation.postTaxPercentiles?.p10[i] ?? simulation.percentiles.p10[i],
      postTaxP50: simulation.postTaxPercentiles?.p50[i] ?? simulation.percentiles.p50[i],
      postTaxP90: simulation.postTaxPercentiles?.p90[i] ?? simulation.percentiles.p90[i],
      probability: simulation.goalProbabilities?.[i] ?? null,
    }));
  }, [simulation]);

  // ─── Filtered Chart Data ───
  const filteredChartData = React.useMemo(() => {
    if (allChartData.length === 0) return [];

    let dataToFilter = allChartData;

    if (viewMode === "month") {
      // Filter to include only the first data point of each month
      const seenMonths = new Set<string>();
      dataToFilter = allChartData.filter((point) => {
        if (point.year <= 10000) return true; // Handle non-timestamp legacy data
        const date = new Date(point.year);
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        if (seenMonths.has(key)) return false;
        seenMonths.add(key);
        return true;
      });
    } else if (viewMode === "year") {
      // Filter to include only the first data point of each year
      const seenYears = new Set<number>();
      dataToFilter = allChartData.filter((point) => {
        if (point.year <= 10000) return true;
        const date = new Date(point.year);
        const year = date.getFullYear();
        if (seenYears.has(year)) return false;
        seenYears.add(year);
        return true;
      });
    }

    // Map to the shape expected by FanChart
    return dataToFilter.map(pt => {
      let p10 = pt.nominalP10;
      let p50 = pt.nominalP50;
      let p90 = pt.nominalP90;

      if (showPostTax) {
        // Base is Nominal Post-Tax
        p10 = pt.postTaxP10;
        p50 = pt.postTaxP50;
        p90 = pt.postTaxP90;

        // If Real is also selected, adjust Post-Tax for inflation
        if (showReal) {
          // Calculate inflation factor from P50 (Real / Nominal)
          // Avoid division by zero
          const inflationFactor = pt.nominalP50 !== 0 ? (pt.realP50 / pt.nominalP50) : 1;
          p10 = p10 * inflationFactor;
          p50 = p50 * inflationFactor;
          p90 = p90 * inflationFactor;
        }
      } else if (showReal) {
        p10 = pt.realP10;
        p50 = pt.realP50;
        p90 = pt.realP90;
      }

      const goalAmount = simulation?.targetCorpus || 0;

      return {
        year: pt.year,
        p10,
        p50,
        p90,
        probability: pt.probability,
        goalValue: goalAmount, // Static goal value at target amount
      };
    });
  }, [allChartData, viewMode, showReal, showPostTax]);



  // ─── Edit Name handlers ───
  const handleStartEdit = () => {
    setEditedName(simulation?.name || "");
    setIsEditingName(true);
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setEditedName("");
  };

  const handleSaveName = async () => {
    if (!simulation || !editedName.trim()) return;
    setIsSavingName(true);

    try {
      const response = await updateSimulationApi(simulation.id, {
        name: editedName.trim(),
      });

      if (response.success) {
        const updatedSimulation = { ...simulation, name: editedName.trim() };
        setSimulation(updatedSimulation);
        updateSimulationInHistory(updatedSimulation);
        setIsEditingName(false);
        toast.success("Simulation name updated");
      } else {
        throw new Error(response.message || "Failed to update");
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "An error occurred";
      toast.error("Failed to update name", { description: msg });
    } finally {
      setIsSavingName(false);
    }
  };

  // ─── Loading State ───
  if (isLoading) {
    return <SimulationDetailSkeleton />;
  }

  // ─── Processing State ───
  if (isProcessing) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">
          Running Simulation...
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Generating Monte Carlo scenarios. This may take a moment.
        </p>
        <div className="w-64 mx-auto bg-muted rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {Math.round(progress)}%
        </p>
      </div>
    );
  }

  // ─── Not Found State ───
  if (!simulation) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">
          Simulation Not Found
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          This simulation may have been deleted or doesn&apos;t exist.
        </p>
        <Button asChild>
          <Link href="/dashboard/simulate">Back to Simulations</Link>
        </Button>
      </div>
    );
  }

  // Terminal values (based on current view: real/nominal/post-tax)
  const lastPoint = filteredChartData[filteredChartData.length - 1];
  const p10Terminal = lastPoint?.p10 || 0;
  const p50Terminal = lastPoint?.p50 || 0;
  const p90Terminal = lastPoint?.p90 || 0;

  return (
    <div className="space-y-6">
      {/* ... Header ... */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* ... (Existing header code) ... */}
        <div>
          {/* ... Title code ... */}
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                placeholder="Enter simulation name"
                className="text-xl font-bold h-9 w-64"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveName();
                  if (e.key === "Escape") handleCancelEdit();
                }}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSaveName}
                disabled={isSavingName || !editedName.trim()}
                className="h-8 w-8"
              >
                {isSavingName ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 text-green-600" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancelEdit}
                disabled={isSavingName}
                className="h-8 w-8"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          ) : (
            <h1 className="text-xl font-bold text-foreground group flex items-center gap-2">
              <span>{simulation.name || "Untitled Simulation"}</span>
              {simulation.portfolioName && (
                <span className="text-muted-foreground font-normal text-base">
                  ({simulation.portfolioName})
                </span>
              )}
              <button
                onClick={handleStartEdit}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
              >
                <Pencil className="h-4 w-4 text-muted-foreground" />
              </button>
            </h1>
          )}
          <p className="text-sm text-muted-foreground mt-1">
            {simulation.config.yearsToProject < 1
              ? `${Math.round(simulation.config.yearsToProject * 365)} day projection`
              : `${simulation.config.yearsToProject} year projection`
            } •{" "}
            {simulation.config.iterations.toLocaleString()} scenarios
          </p>
        </div>

        {/* Inflation Toggle & View Mode */}
        <div className="flex items-center gap-3">
          {/* Real vs Nominal Toggle */}
          <div className="flex bg-muted p-1 rounded-lg shrink-0">
            <button
              onClick={() => setShowReal(false)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                !showReal
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Nominal
            </button>
            <button
              onClick={() => setShowReal(true)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                showReal
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Real Value
            </button>
          </div>

          {/* Post-Tax Toggle */}
          <div className="flex bg-muted p-1 rounded-lg">
            <button
              onClick={() => setShowPostTax(!showPostTax)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                showPostTax
                  ? "bg-rose-100 text-rose-900 shadow-sm border border-rose-200"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {showPostTax ? "Post-Tax On" : "Show Post-Tax"}
            </button>
          </div>


          {/* Probability Toggle Removed */}

          <div className="h-6 w-px bg-border" />

          {/* View Mode Toggle */}
          <div className="flex bg-muted p-1 rounded-lg shrink-0">
            <button
              onClick={() => setViewMode("day")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                viewMode === "day"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Days
            </button>
            <button
              onClick={() => setViewMode("month")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                viewMode === "month"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Months
            </button>
            <button
              onClick={() => setViewMode("year")}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                viewMode === "year"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Years
            </button>
          </div>
        </div>
      </div>

      {/* Warnings for 0% rates */}
      {(showReal && (!simulation.config.inflationRate || simulation.config.inflationRate === 0)) && (
        <div className="flex items-center gap-2 p-3 mb-4 text-xs bg-amber-500/10 text-amber-700 rounded-lg border border-amber-200">
          <AlertTriangle className="h-4 w-4" />
          <span>Real Value matches Nominal because this simulation used 0% inflation. Run a <strong>New Simulation</strong> to apply default 6% inflation.</span>
        </div>
      )}
      {(showPostTax && (!simulation.config.taxRate || simulation.config.taxRate === 0)) && (
        <div className="flex items-center gap-2 p-3 mb-4 text-xs bg-amber-500/10 text-amber-700 rounded-lg border border-amber-200">
          <AlertTriangle className="h-4 w-4" />
          <span>Post-Tax Value matches Nominal because this simulation used 0% tax. Run a <strong>New Simulation</strong> to apply default 10% tax.</span>
        </div>
      )}

      {/* Fan Chart */}
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Wealth Projection
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {filteredChartData.length > 0 && (
                <>
                  {filteredChartData[0].year > 10000
                    ? `${new Date(filteredChartData[0].year).getFullYear()} – ${new Date(filteredChartData[filteredChartData.length - 1].year).getFullYear()}`
                    : `Year ${filteredChartData[0].year} – ${filteredChartData[filteredChartData.length - 1].year}`
                  }
                </>
              )}
            </p>
          </div>
          <Badge variant="outline" className="text-xs gap-1">
            <Activity className="h-3 w-3" />
            Complete
          </Badge>
        </div>
        <SimulationFanChart
          data={filteredChartData}
          goalAmount={simulation.targetCorpus}
          milestones={simulation.milestones}
          goalProbabilities={filteredChartData.map(d => d.probability !== null ? d.probability : 0)}
          showProbability={false}
          isReal={showReal}
          isPostTax={showPostTax}
          height={320}
          granularity={viewMode}
        />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {/* Target (if set) */}
        {simulation.targetCorpus && simulation.targetCorpus > 0 && (
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Target className="h-4 w-4 text-amber-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-1">Target Goal</p>
            <p className="text-xl font-bold text-foreground tabular-nums">
              {formatCurrency(simulation.targetCorpus)}
            </p>
          </div>
        )}

        {/* Medium (P50) */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-1">Projected (P50)</p>
          <p className="text-xl font-bold text-foreground tabular-nums">
            {formatCurrency(p50Terminal)}
          </p>
        </div>

        {/* Low (P10) */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <TrendingDown className="h-4 w-4 text-red-600" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-1">Low (P10)</p>
          <p className="text-xl font-bold text-foreground tabular-nums">
            {formatCurrency(p10Terminal)}
          </p>
        </div>

        {/* High (P90) */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-1">High (P90)</p>
          <p className="text-xl font-bold text-foreground tabular-nums">
            {formatCurrency(p90Terminal)}
          </p>
        </div>
      </div>

      {/* Goal Analysis — only when target was set */}
      {simulation.targetCorpus && simulation.targetCorpus > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-foreground">
              Goal Analysis
            </h3>
            <Badge
              variant={simulation.targetAchieved ? "default" : "secondary"}
              className={cn(
                "text-xs",
                simulation.targetAchieved
                  ? "bg-green-500/10 text-green-600 border-green-500/30"
                  : "bg-amber-500/10 text-amber-600 border-amber-500/30"
              )}
            >
              {simulation.targetAchieved ? "On Track" : "Needs Adjustment"}
            </Badge>
          </div>

          {/* Main Comparison: Your Goal vs Your Projection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            {/* Left: What You Need */}
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <p className="text-xs text-muted-foreground mb-1">
                {simulation.inflationRate && simulation.inflationRate > 0
                  ? "Amount Needed (Inflation-Adjusted)"
                  : "Your Goal"}
              </p>
              <p className="text-2xl font-bold font-mono text-foreground">
                ${(simulation.inflatedTargetCorpus || simulation.targetCorpus).toLocaleString()}
              </p>
              {simulation.inflationRate && simulation.inflationRate > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  ${simulation.targetCorpus.toLocaleString()} today + {(simulation.inflationRate * 100).toFixed(0)}% inflation for {simulation.config.yearsToProject} years
                </p>
              )}
            </div>

            {/* Right: What You'll Have */}
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <p className="text-xs text-muted-foreground mb-1">
                Projected Value (P50)
              </p>
              <p className={cn(
                "text-2xl font-bold font-mono",
                simulation.targetAchieved ? "text-green-600" : "text-foreground"
              )}>
                ${(simulation.currentProjection || simulation.medianTerminalWealth).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Median outcome from {simulation.config.iterations?.toLocaleString() || "10,000"} simulations
              </p>
            </div>
          </div>

          {/* Gap or Surplus */}
          {simulation.projectionGap != null && (
            <div className={cn(
              "p-4 rounded-lg border mb-5",
              simulation.targetAchieved
                ? "bg-green-500/5 border-green-500/20"
                : "bg-amber-500/5 border-amber-500/20"
            )}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {simulation.targetAchieved ? "Surplus" : "Shortfall"}
                  </p>
                  <p className={cn(
                    "text-xl font-bold font-mono",
                    simulation.targetAchieved ? "text-green-600" : "text-amber-600"
                  )}>
                    {simulation.targetAchieved ? "+" : "-"}${Math.abs(simulation.projectionGap).toLocaleString()}
                  </p>
                </div>
                {simulation.successRate != null && (
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground mb-1">Success Rate</p>
                    <p className={cn(
                      "text-xl font-bold font-mono",
                      simulation.successRate >= 70
                        ? "text-green-600"
                        : simulation.successRate >= 40
                          ? "text-amber-600"
                          : "text-red-600"
                    )}>
                      {simulation.successRate.toFixed(0)}%
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Summary Message */}
          {simulation.suggestionMessage && (
            <p className="text-sm text-muted-foreground mb-4">
              {simulation.suggestionMessage}
            </p>
          )}

          {/* Recommendations */}
          {simulation.recommendations &&
            simulation.recommendations.length > 0 && (
              <div className="border-t border-border pt-4">
                <p className="text-xs font-medium text-muted-foreground mb-3">
                  How to close the gap
                </p>
                <ul className="space-y-2">
                  {simulation.recommendations.slice(0, 3).map((rec, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-sm text-foreground"
                    >
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-semibold shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
        </div>
      )}

      {/* Portfolio Allocation */}
      {(() => {
        console.log('[Portfolio Debug] simulation.allocations:', simulation.allocations);
        console.log('[Portfolio Debug] allocations length:', simulation.allocations?.length);
        return simulation.allocations && simulation.allocations.length > 0;
      })() && (
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">
                Portfolio Allocation
              </h3>
            </div>
            <AllocationChart
              data={(simulation.allocations || []).map((asset) => ({
                ticker: asset.assetCode,
                name: asset.assetName,
                value: asset.targetAllocationPercentage,
              }))}
            />
          </div>
        )}

      {/* Parameters Summary */}
      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <p className="text-xs font-medium text-muted-foreground mb-2">
          Simulation Parameters
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2 text-sm">
          <div>
            <span className="text-muted-foreground">Initial:</span>{" "}
            <span className="font-medium text-foreground">
              {formatCurrency(simulation.config.initialInvestment)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Monthly:</span>{" "}
            <span className="font-medium text-foreground">
              {formatCurrency(simulation.config.monthlyContribution)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Horizon:</span>{" "}
            <span className="font-medium text-foreground">
              {simulation.config.yearsToProject < 1
                ? `${Math.round(simulation.config.yearsToProject * 365)} days`
                : `${simulation.config.yearsToProject} years`
              }
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Iterations:</span>{" "}
            <span className="font-medium text-foreground">
              {simulation.config.iterations.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
