"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Play,
  Loader2,
  Briefcase,
  Settings2,
  Target,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth-store";
import { useSimulationStore } from "@/stores/simulation-store";
import { createSimulationApi } from "@/services/simulation-service";
import { listPortfoliosApi } from "@/services/portfolio-service";
import { mapApiPortfolioToBucket } from "@/lib/portfolio-utils";
import { nextGoalId } from "@/lib/simulation-utils";
import { SimulationFormSkeleton } from "@/components/dashboard/skeletons";
import { formatNumberWithCommas, parseFormattedNumber } from "@/lib/utils";
import { useGoalCalculator } from "@/hooks/use-goal-calculator";

/**
 * New Simulation Page
 *
 * Form to configure and launch a new Monte Carlo simulation.
 * - Portfolio selector dropdown (API-saved portfolios only)
 * - 4 parameter inputs: initial investment, monthly contribution, horizon, iterations
 * - Submit creates simulation and redirects to detail page
 */
export default function NewSimulationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Auth store for plan limits
  const { user } = useAuthStore();
  const simulationsLimit = user?.simulationsLimit ?? 5;

  // Store state
  const savedBuckets = useSimulationStore((s) => s.savedBuckets);
  const setSavedBuckets = useSimulationStore((s) => s.setSavedBuckets);
  const portfoliosLoaded = useSimulationStore((s) => s.portfoliosLoaded);
  const setPortfoliosLoaded = useSimulationStore((s) => s.setPortfoliosLoaded);
  const simulationHistory = useSimulationStore((s) => s.simulationHistory);

  // Use actual simulation count from loaded history for accurate limit check
  const simulationsUsed = simulationHistory.length;
  // -1 means unlimited (Pro plan)
  const isUnlimited = simulationsLimit === -1;
  const atLimit = !isUnlimited && simulationsUsed >= simulationsLimit;

  // Pre-fill from query params (used by "Run Again" from detail page)
  const prefillPortfolioId = searchParams.get("portfolioId") || "";
  const prefillInitial = searchParams.get("initial");
  const prefillMonthly = searchParams.get("monthly");
  const prefillHorizon = searchParams.get("horizon");
  const prefillIterations = searchParams.get("iterations");
  const prefillTarget = searchParams.get("target");
  const prefillInflation = searchParams.get("inflation");
  const prefillName = searchParams.get("name") || "";

  // Form state
  const [simulationName, setSimulationName] = React.useState(prefillName);
  const [selectedPortfolioId, setSelectedPortfolioId] = React.useState(prefillPortfolioId);
  const [initialInvestment, setInitialInvestment] = React.useState(
    prefillInitial ? Number(prefillInitial) : 100_000
  );
  const [monthlyContribution, setMonthlyContribution] = React.useState(
    prefillMonthly ? Number(prefillMonthly) : 0
  );
  const [timeHorizon, setTimeHorizon] = React.useState<number | string>(
    prefillHorizon ? Number(prefillHorizon) : 30
  );
  const [iterations, setIterations] = React.useState(
    prefillIterations ? Number(prefillIterations) : 10_000
  );
  const [targetCorpus, setTargetCorpus] = React.useState(
    prefillTarget ? Number(prefillTarget) : 0
  );
  const [inflationRate, setInflationRate] = React.useState<number | string>(
    prefillInflation ? Number(prefillInflation) : 6  // Default 6%
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // API-saved portfolios only
  const apiPortfolios = React.useMemo(
    () => savedBuckets.filter((b) => b.isFromApi),
    [savedBuckets]
  );

  // Portfolio expected return (weighted average of asset returns, as percentage)
  const portfolioExpectedReturn = React.useMemo(() => {
    const selected = savedBuckets.find((b) => b.id === selectedPortfolioId);
    if (!selected || selected.assets.length === 0) return 0;
    const totalWeight = selected.assets.reduce((sum, a) => sum + a.weight, 0);
    if (totalWeight === 0) return 0;
    return selected.assets.reduce(
      (sum, a) => sum + (a.expectedReturn ?? 10) * (a.weight / totalWeight),
      0
    );
  }, [savedBuckets, selectedPortfolioId]);

  // Real-time goal suggestion calculator
  const goal = useGoalCalculator({
    targetCorpus,
    initialInvestment,
    monthlyInvestment: monthlyContribution,
    years: Number(timeHorizon) || 0,
    inflationRate: Number(inflationRate),
    expectedReturn: portfolioExpectedReturn,
  });

  // Check simulation limit on mount — redirect if at limit
  React.useEffect(() => {
    if (atLimit) {
      toast.error("Simulation limit reached", {
        description: "Upgrade your plan to run more simulations.",
      });
      router.replace("/dashboard/simulate");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [atLimit]);

  // Fetch portfolios on mount if needed
  React.useEffect(() => {
    if (portfoliosLoaded) return;
    let cancelled = false;

    listPortfoliosApi()
      .then((response) => {
        if (cancelled) return;
        if (response.success && response.data) {
          const buckets = response.data.map(mapApiPortfolioToBucket);
          setSavedBuckets(buckets);
        }
        setPortfoliosLoaded(true);
      })
      .catch(() => {
        if (cancelled) return;
        setPortfoliosLoaded(true);
        toast.error("Couldn't load portfolios", {
          description: "Check your connection and try again.",
        });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Validation ───
  const validate = (): boolean => {
    // Check simulation limit first
    if (atLimit) {
      toast.error("Simulation limit reached", {
        description: "Upgrade your plan to run more simulations.",
      });
      return false;
    }
    if (!simulationName.trim()) {
      toast.error("Simulation name is required", {
        description: "Give your simulation a name to identify it later.",
      });
      return false;
    }
    if (!targetCorpus || targetCorpus <= 0) {
      toast.error("Target amount is required", {
        description: "Set your goal amount first, then decide on investments.",
      });
      return false;
    }
    if (!selectedPortfolioId) {
      toast.error("Select a portfolio");
      return false;
    }
    if (initialInvestment < 0) {
      toast.error("Initial investment must be non-negative");
      return false;
    }
    if (monthlyContribution < 0) {
      toast.error("Monthly contribution must be non-negative");
      return false;
    }
    const horizon = Number(timeHorizon);
    if (horizon < 1 || horizon > 30) {
      toast.error("Horizon must be between 1 and 30 years");
      return false;
    }
    if (iterations < 1000 || iterations > 100000) {
      toast.error("Iterations must be between 1K and 100K");
      return false;
    }
    const inflation = Number(inflationRate);
    if (inflation < 0 || inflation > 20) {
      toast.error("Inflation rate must be between 0% and 20%");
      return false;
    }
    return true;
  };

  // ─── Submit ───
  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // Get selected portfolio and build allocations from current state
      const selectedBucket = savedBuckets.find((b) => b.id === selectedPortfolioId);
      const allocations = selectedBucket?.assets.map((asset) => ({
        assetCode: asset.ticker,
        assetName: asset.name,
        assetClassName: asset.assetClassName || "Equity",
        targetAllocationPercentage: asset.weight,
        expectedReturn: asset.expectedReturn || 10.0,
      }));

      const response = await createSimulationApi({
        portfolioId: selectedPortfolioId,
        goalId: nextGoalId(),
        initialInvestment,
        monthlyInvestment: monthlyContribution,
        tenure: Number(timeHorizon),
        iterations,
        targetCorpus,
        inflationRate: Number(inflationRate) / 100,  // Convert percentage to decimal (6% → 0.06)
        name: simulationName.trim(),
        allocations, // Pass current allocations
      });

      if (response.success && response.data?.simulationId) {
        router.push(`/dashboard/simulate/${response.data.simulationId}`);
      } else {
        throw new Error(response.message || "Failed to create simulation");
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred.";
      toast.error("Failed to start simulation", { description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Loading State ───
  if (!portfoliosLoaded) {
    return <SimulationFormSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          New Simulation
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure and run a Monte Carlo simulation
        </p>
      </div>

      {/* Section 1: Goal (Name + Target Amount) — FIRST */}
      <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-primary" />
          <h2 className="text-base font-semibold text-foreground">
            Set Your Goal
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Define your target amount first, then configure your investment strategy to achieve it.
        </p>

        <div className="space-y-4">
          {/* Simulation Name — REQUIRED */}
          <div>
            <label className="text-xs font-medium text-foreground block mb-1.5">
              Simulation Name <span className="text-destructive">*</span>
            </label>
            <Input
              type="text"
              value={simulationName}
              onChange={(e) => setSimulationName(e.target.value)}
              placeholder="e.g. Retirement 2050, College Fund"
              className="text-lg font-semibold"
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              Give your simulation a descriptive name to identify it later.
            </p>
          </div>

          {/* Target Amount — REQUIRED */}
          <div>
            <label className="text-xs font-medium text-foreground block mb-1.5">
              Target Amount ($) <span className="text-destructive">*</span>
            </label>
            <Input
              type="text"
              inputMode="numeric"
              value={targetCorpus ? formatNumberWithCommas(targetCorpus) : ""}
              onChange={(e) => setTargetCorpus(parseFormattedNumber(e.target.value))}
              placeholder="e.g. 1,000,000"
              className="font-mono text-lg font-semibold"
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              How much do you want to accumulate? The simulation will show if your strategy can achieve this goal.
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Portfolio Selector */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Briefcase className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">
            Select Portfolio
          </h2>
        </div>

        {apiPortfolios.length > 0 ? (
          <select
            value={selectedPortfolioId}
            onChange={(e) => setSelectedPortfolioId(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">Choose a saved portfolio...</option>
            {apiPortfolios.map((portfolio) => (
              <option key={portfolio.id} value={portfolio.id}>
                {portfolio.name} — {portfolio.assets.length} assets
                {portfolio.portfolioCode ? ` (${portfolio.portfolioCode})` : ""}
              </option>
            ))}
          </select>
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              No saved portfolios found
            </p>
            <Button variant="outline" size="sm" asChild className="gap-2">
              <Link href="/dashboard/builder">
                <Briefcase className="h-4 w-4" />
                Go to Portfolio Builder
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Section 2: Parameters */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Settings2 className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold text-foreground">
            Simulation Parameters
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">
              Initial Investment ($)
            </label>
            <Input
              type="text"
              inputMode="numeric"
              value={formatNumberWithCommas(initialInvestment)}
              onChange={(e) => setInitialInvestment(parseFormattedNumber(e.target.value))}
              placeholder="100,000"
              className="font-mono"
            />
            {goal.ready && initialInvestment === 0 && monthlyContribution > 0 && goal.requiredInitial != null && !goal.onTrack && (
              <p className="text-[10px] text-primary mt-1">
                Suggested: ${goal.requiredInitial.toLocaleString()} to reach target
              </p>
            )}
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">
              Monthly Contribution ($)
            </label>
            <Input
              type="text"
              inputMode="numeric"
              value={formatNumberWithCommas(monthlyContribution)}
              onChange={(e) => setMonthlyContribution(parseFormattedNumber(e.target.value))}
              placeholder="0"
              className="font-mono"
            />
            {goal.ready && monthlyContribution === 0 && initialInvestment > 0 && goal.requiredSIP != null && !goal.onTrack && (
              <p className="text-[10px] text-primary mt-1">
                Suggested: ${goal.requiredSIP.toLocaleString()}/mo to reach target
              </p>
            )}
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">
              Time Horizon (years)
            </label>
            <Input
              type="number"
              value={timeHorizon}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "") setTimeHorizon("");
                else setTimeHorizon(Number(val));
              }}
              min={1}
              max={30}
              placeholder="30"
              className="font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">
              Iterations
            </label>
            <Input
              type="text"
              inputMode="numeric"
              value={formatNumberWithCommas(iterations)}
              onChange={(e) => setIterations(parseFormattedNumber(e.target.value))}
              placeholder="10,000"
              className="font-mono"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">
              Inflation Rate (%)
            </label>
            <Input
              type="number"
              value={inflationRate}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "") setInflationRate("");
                else setInflationRate(Number(val));
              }}
              min={0}
              max={20}
              step={0.5}
              placeholder="6"
              className="font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              Your goal will be adjusted for inflation over the time horizon.
            </p>
          </div>
        </div>

        {/* Quick estimate when both amounts are filled */}
        {goal.ready && initialInvestment > 0 && monthlyContribution > 0 && (
          <p className={`text-xs mt-3 ${goal.onTrack ? "text-green-600" : "text-amber-600"}`}>
            {goal.onTrack
              ? `Projected: $${goal.projectedValue.toLocaleString()} — on track to meet your $${goal.inflatedTarget.toLocaleString()} target`
              : `Projected: $${goal.projectedValue.toLocaleString()} — shortfall of $${goal.gap.toLocaleString()} from $${goal.inflatedTarget.toLocaleString()} target`}
          </p>
        )}
      </div>

      {/* Section 4: Submit */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !selectedPortfolioId || !targetCorpus || !simulationName.trim()}
          className="gap-2"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          {isSubmitting ? "Starting…" : "Run Simulation"}
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/dashboard/simulate">Cancel</Link>
        </Button>
      </div>
    </div>
  );
}
