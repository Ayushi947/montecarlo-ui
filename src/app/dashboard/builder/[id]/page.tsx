"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Plus,
  Save,
  Play,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  Search,
  Loader2,
  ChevronDown,
  FolderOpen,
} from "lucide-react";
import { toast } from "sonner";

import { cn, formatNumberWithCommas, parseFormattedNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useAuthStore } from "@/stores/auth-store";
import { useSimulationStore, useTotalWeight, useWeightsValid } from "@/stores/simulation-store";
import { AllocationChart, CHART_COLORS } from "@/components/dashboard/allocation-chart";
import { AssetRow } from "@/components/dashboard/asset-row";
import { AssetSearchCommand } from "@/components/dashboard/asset-search-command";
import {
  listPortfoliosApi,
  createPortfolioApi,
  updatePortfolioApi,
} from "@/services/portfolio-service";
import { createSimulationApi } from "@/services/simulation-service";
import { nextGoalId } from "@/lib/simulation-utils";
import {
  mapApiPortfolioToBucket,
  mapBucketToCreateRequest,
  mapBucketToUpdateRequest,
} from "@/lib/portfolio-utils";
import { BuilderSkeleton } from "@/components/dashboard/skeletons";
import { useGoalCalculator } from "@/hooks/use-goal-calculator";

/**
 * Portfolio Editor Page — /dashboard/builder/[id]
 *
 * Full-featured portfolio editing interface:
 * - Named portfolio with editable title
 * - Asset list with weight sliders + numeric inputs
 * - Live allocation pie chart
 * - Weight validation (must sum to 100%)
 * - Quick-add assets from catalog (⌘K command palette)
 * - Equal-weight distribution helper
 * - Save & Run Simulation actions
 * - API-backed CRUD (create, update, delete)
 * - Portfolio selector dropdown to switch between portfolios
 */
export default function BuilderEditorPage() {
  const router = useRouter();
  const params = useParams();
  const portfolioId = params.id as string;

  // Auth store for plan limits
  const { user } = useAuthStore();
  const portfoliosLimit = user?.portfoliosLimit ?? 3;
  const simulationsLimit = user?.simulationsLimit ?? 5;
  // -1 means unlimited (Pro plan)
  const isSimulationUnlimited = simulationsLimit === -1;
  const isPortfolioUnlimited = portfoliosLimit === -1;

  // Store state & actions
  const currentBucket = useSimulationStore((s) => s.currentBucket);
  const savedBuckets = useSimulationStore((s) => s.savedBuckets);
  const setCurrentBucket = useSimulationStore((s) => s.setCurrentBucket);
  const saveBucket = useSimulationStore((s) => s.saveBucket);
  const deleteBucket = useSimulationStore((s) => s.deleteBucket);
  const setSavedBuckets = useSimulationStore((s) => s.setSavedBuckets);
  const setPortfoliosLoaded = useSimulationStore((s) => s.setPortfoliosLoaded);
  const portfoliosLoaded = useSimulationStore((s) => s.portfoliosLoaded);
  const addAsset = useSimulationStore((s) => s.addAsset);
  const removeAsset = useSimulationStore((s) => s.removeAsset);
  const updateAssetWeight = useSimulationStore((s) => s.updateAssetWeight);
  const simulationHistory = useSimulationStore((s) => s.simulationHistory);

  // Use actual simulation count from loaded history for accurate limit check
  const simulationsUsed = simulationHistory.length;
  const atSimulationLimit = !isSimulationUnlimited && simulationsUsed >= simulationsLimit;

  const totalWeight = useTotalWeight();
  const weightsValid = useWeightsValid();

  // Local UI state
  const [portfolioName, setPortfolioName] = React.useState("");
  const [commandOpen, setCommandOpen] = React.useState(false);
  const [saveStatus, setSaveStatus] = React.useState<"idle" | "saving" | "saved">("idle");
  const [isRunning, setIsRunning] = React.useState(false);
  const [simDialogOpen, setSimDialogOpen] = React.useState(false);

  // Simulation parameters (set in dialog, used by handleRunSimulation)
  const [simulationName, setSimulationName] = React.useState("");
  const [initialInvestment, setInitialInvestment] = React.useState(100_000);
  const [monthlyContribution, setMonthlyContribution] = React.useState(0);
  const [timeHorizon, setTimeHorizon] = React.useState(30);
  const [iterations, setIterations] = React.useState(10_000);
  const [targetCorpus, setTargetCorpus] = React.useState(0);
  const [inflationRate, setInflationRate] = React.useState(6);  // Default 6%

  // Portfolio expected return (weighted average of asset returns)
  const portfolioExpectedReturn = React.useMemo(() => {
    if (!currentBucket || currentBucket.assets.length === 0) return 0;
    const totalWeight = currentBucket.assets.reduce((sum, a) => sum + a.weight, 0);
    if (totalWeight === 0) return 0;
    return currentBucket.assets.reduce(
      (sum, a) => sum + (a.expectedReturn ?? 10) * (a.weight / totalWeight),
      0
    );
  }, [currentBucket]);

  // Real-time goal suggestion calculator
  const goal = useGoalCalculator({
    targetCorpus,
    initialInvestment,
    monthlyInvestment: monthlyContribution,
    years: timeHorizon,
    inflationRate,
    expectedReturn: portfolioExpectedReturn,
  });

  // Portfolio limit check
  const atPortfolioLimit = !isPortfolioUnlimited && savedBuckets.length >= portfoliosLimit;

  // Fetch portfolios from API on mount (if not already loaded)
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
          description: "Using locally saved data. Check your connection.",
        });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load the correct portfolio from the URL :id param
  React.useEffect(() => {
    if (!portfoliosLoaded) return;

    // Check if the portfolio is already loaded as currentBucket
    if (currentBucket?.id === portfolioId) return;

    // Try to find it in savedBuckets
    const matched = savedBuckets.find((b) => b.id === portfolioId);
    if (matched) {
      setCurrentBucket(matched);
      return;
    }

    // It's a new (unsaved) portfolio — create a blank one with this ID
    setCurrentBucket({
      id: portfolioId,
      name: "New Portfolio",
      assets: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }, [portfoliosLoaded, portfolioId, savedBuckets, currentBucket?.id, setCurrentBucket]);

  // Sync portfolio name from bucket
  React.useEffect(() => {
    if (currentBucket?.name) {
      setPortfolioName(currentBucket.name);
    }
  }, [currentBucket?.name]);

  // Tickers already in the portfolio (for excluding from search)
  const addedTickers = React.useMemo(
    () => (currentBucket?.assets ?? []).map((a) => a.ticker),
    [currentBucket?.assets]
  );

  // Chart data derived from current assets
  const chartData = React.useMemo(
    () =>
      (currentBucket?.assets ?? []).map((a) => ({
        name: a.name,
        ticker: a.ticker,
        value: a.weight,
      })),
    [currentBucket?.assets]
  );

  const assets = currentBucket?.assets ?? [];
  const assetCount = assets.length;
  const weightDelta = Math.abs(totalWeight - 100);

  // ─── Handlers ───

  const handleAddAsset = (asset: {
    ticker: string;
    name: string;
    price: number;
    change: number;
    assetClassName?: string;
    expectedReturn?: number;
  }) => {
    addAsset({
      ...asset,
      weight: 0,
      assetClassName: asset.assetClassName,
      expectedReturn: asset.expectedReturn,
    });
  };

  const handleEqualWeight = () => {
    if (assetCount === 0) return;
    const equalWeight = Math.round((100 / assetCount) * 100) / 100;
    assets.forEach((a) => updateAssetWeight(a.ticker, equalWeight));
    const remainder = 100 - equalWeight * (assetCount - 1);
    if (assets.length > 0) {
      updateAssetWeight(assets[assets.length - 1].ticker, Math.round(remainder * 100) / 100);
    }
  };

  const handleSave = async () => {
    if (!currentBucket) return;

    const name = (portfolioName || "").trim();
    if (name.length < 3) {
      toast.error("Portfolio name too short", {
        description: "Name must be at least 3 characters.",
      });
      return;
    }
    if (name.length > 100) {
      toast.error("Portfolio name too long", {
        description: "Name must be 100 characters or fewer.",
      });
      return;
    }
    if (assetCount === 0) {
      toast.error("No assets added", {
        description: "Add at least one asset before saving.",
      });
      return;
    }
    if (!weightsValid) {
      toast.error("Weights must total 100%", {
        description: `Current total is ${totalWeight.toFixed(1)}%. Adjust weights before saving.`,
      });
      return;
    }

    setSaveStatus("saving");

    const updatedBucket = {
      ...currentBucket,
      name: name,
      updatedAt: new Date().toISOString(),
    };

    try {
      if (currentBucket.isFromApi) {
        const response = await updatePortfolioApi(
          currentBucket.id,
          mapBucketToUpdateRequest(updatedBucket)
        );
        if (response.success) {
          const refreshed = mapApiPortfolioToBucket(response.data);
          setCurrentBucket(refreshed);
          saveBucket(refreshed);
          // If the API returned a different ID, update the URL
          if (refreshed.id !== portfolioId) {
            router.replace(`/dashboard/builder/${refreshed.id}`);
          }
          toast.success("Portfolio updated", {
            description: `"${refreshed.name}" saved successfully.`,
          });
        }
      } else {
        const response = await createPortfolioApi(
          mapBucketToCreateRequest(updatedBucket)
        );
        if (response.success) {
          const created = mapApiPortfolioToBucket(response.data);
          deleteBucket(currentBucket.id);
          setCurrentBucket(created);
          saveBucket(created);
          // Navigate to the new API-backed ID
          router.replace(`/dashboard/builder/${created.id}`);
          toast.success("Portfolio created", {
            description: `"${created.name}" saved to your account.`,
          });
        }
      }
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string; error?: { message?: string } } } };
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        "Failed to save portfolio. Please try again.";
      toast.error("Save failed", { description: msg });
      setSaveStatus("idle");
    }
  };

  const handleSwitchPortfolio = (bucket: typeof savedBuckets[0]) => {
    setCurrentBucket(bucket);
    router.push(`/dashboard/builder/${bucket.id}`);
  };

  const handleNewPortfolio = () => {
    if (atPortfolioLimit) {
      toast.error("Portfolio limit reached", {
        description: "Upgrade your plan to create more portfolios.",
      });
      return;
    }
    const newId = crypto.randomUUID();
    setCurrentBucket({
      id: newId,
      name: "New Portfolio",
      assets: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    router.push(`/dashboard/builder/${newId}`);
  };

  const handleRunSimulation = async () => {
    if (!currentBucket) return;

    // Check simulation limit first
    if (atSimulationLimit) {
      toast.error("Simulation limit reached", {
        description: "Upgrade your plan to run more simulations.",
      });
      return;
    }

    const name = (portfolioName || "").trim();
    if (name.length < 3) {
      toast.error("Portfolio name too short", { description: "Name must be at least 3 characters." });
      return;
    }
    if (assetCount === 0) {
      toast.error("No assets added", { description: "Add at least one asset before running." });
      return;
    }
    if (!weightsValid) {
      toast.error("Weights must total 100%", { description: `Current total is ${totalWeight.toFixed(1)}%.` });
      return;
    }

    setIsRunning(true);
    try {
      let portfolioId = currentBucket.id;

      // Save portfolio to API if not already saved
      if (!currentBucket.isFromApi) {
        const saveResp = await createPortfolioApi(
          mapBucketToCreateRequest({ ...currentBucket, name: name })
        );
        if (!saveResp.success) throw new Error("Failed to save portfolio");
        const created = mapApiPortfolioToBucket(saveResp.data);
        deleteBucket(currentBucket.id);
        setCurrentBucket(created);
        saveBucket(created);
        portfolioId = created.id;
      }

      // Build current allocations from UI (captures unsaved changes)
      const currentAllocations = currentBucket.assets.map((asset) => ({
        assetCode: asset.ticker,
        assetName: asset.name,
        assetClassName: asset.assetClassName || "Equity",
        targetAllocationPercentage: asset.weight,
        expectedReturn: asset.expectedReturn || 10.0,
      }));

      // Create simulation with user-configured params + current allocations
      const simResp = await createSimulationApi({
        portfolioId,
        goalId: nextGoalId(),
        initialInvestment,
        monthlyInvestment: monthlyContribution,
        tenure: timeHorizon,
        iterations,
        targetCorpus,
        inflationRate: inflationRate / 100,  // Convert percentage to decimal (6% → 0.06)
        name: simulationName.trim(),
        allocations: currentAllocations, // Pass current UI allocations (even if unsaved)
      });
      if (simResp.success && simResp.data?.simulationId) {
        toast.success("Simulation started");
        router.push(`/dashboard/simulate/${simResp.data.simulationId}`);
      } else {
        throw new Error(simResp.message || "Failed to create simulation");
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "An unexpected error occurred.";
      toast.error("Failed to run simulation", { description: msg });
    } finally {
      setIsRunning(false);
    }
  };

  const handleNameChange = (name: string) => {
    setPortfolioName(name);
    if (currentBucket) {
      setCurrentBucket({
        ...currentBucket,
        name,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  // ─── Loading State ───
  if (!portfoliosLoaded || !currentBucket) {
    return <BuilderSkeleton />;
  }

  return (
    <TooltipProvider>
      <div className="space-y-3">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Portfolio Builder
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isPortfolioUnlimited
                ? `${savedBuckets.length} portfolios`
                : `${savedBuckets.length} of ${portfoliosLimit} portfolios used`}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Portfolio Selector */}
            {savedBuckets.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <FolderOpen className="h-4 w-4" />
                    <span className="hidden sm:inline">Switch</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Your Portfolios</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {savedBuckets.map((bucket) => (
                    <DropdownMenuItem
                      key={bucket.id}
                      onClick={() => handleSwitchPortfolio(bucket)}
                      className="cursor-pointer"
                    >
                      <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="flex-1 truncate">{bucket.name}</span>
                      {bucket.id === currentBucket?.id && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500 ml-2" />
                      )}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleNewPortfolio}
                    className="cursor-pointer"
                    disabled={atPortfolioLimit}
                  >
                    <Plus className="mr-2 h-4 w-4 text-primary" />
                    <span className={cn("font-medium", atPortfolioLimit ? "text-muted-foreground" : "text-primary")}>
                      {atPortfolioLimit ? "Limit Reached" : "New Portfolio"}
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              disabled={saveStatus === "saving" || assetCount === 0 || !weightsValid || portfolioName.trim().length < 3}
              className="gap-2"
            >
              {saveStatus === "saving" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : saveStatus === "saved" ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saveStatus === "saving"
                ? "Saving…"
                : saveStatus === "saved"
                  ? "Saved"
                  : "Save Portfolio"}
            </Button>
            <Button
              size="sm"
              onClick={() => {
                if (atSimulationLimit) {
                  toast.error("Simulation limit reached", {
                    description: "Upgrade your plan to run more simulations.",
                  });
                  return;
                }
                setSimDialogOpen(true);
              }}
              disabled={!weightsValid || assetCount === 0}
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              Run Simulation
            </Button>
          </div>
        </div>

        {/* Main Grid: Asset List + Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Panel: Asset List (2/3 width on desktop) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Portfolio Name Card */}
            <div className="rounded-xl border border-border bg-card p-4">
              <label
                htmlFor="portfolio-name"
                className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
              >
                Portfolio Name
              </label>
              <Input
                id="portfolio-name"
                value={portfolioName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g., Aggressive Growth, Retirement 2050"
                className="mt-1.5 text-lg font-semibold border-0 bg-transparent px-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            {/* Weight Status Bar */}
            <div
              className={cn(
                "flex items-center justify-between rounded-lg border px-4 py-2.5 text-sm transition-colors",
                assetCount === 0
                  ? "border-border bg-muted/30 text-muted-foreground"
                  : weightsValid
                    ? "border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/30 text-green-700 dark:text-green-400"
                    : "border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400"
              )}
            >
              <div className="flex items-center gap-2">
                {assetCount === 0 ? (
                  <Briefcase className="h-4 w-4" />
                ) : weightsValid ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                <span className="font-medium">
                  {assetCount === 0
                    ? "No assets added yet"
                    : weightsValid
                      ? "Allocation is valid — ready to simulate"
                      : `Allocation is ${totalWeight.toFixed(1)}% — ${totalWeight < 100
                        ? `add ${weightDelta.toFixed(1)}% more`
                        : `remove ${weightDelta.toFixed(1)}%`
                      }`}
                </span>
              </div>
              {assetCount > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEqualWeight}
                  className="h-7 text-xs gap-1.5"
                >
                  <RotateCcw className="h-3 w-3" />
                  Equal Weight
                </Button>
              )}
            </div>

            {/* Asset List */}
            {assetCount > 0 ? (
              <div className="space-y-2">
                {assets.map((asset, index) => (
                  <AssetRow
                    key={asset.ticker}
                    ticker={asset.ticker}
                    name={asset.name}
                    price={asset.price}
                    change={asset.change}
                    weight={asset.weight}
                    onWeightChange={(w) => updateAssetWeight(asset.ticker, w)}
                    onRemove={() => removeAsset(asset.ticker)}
                    color={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border-2 border-dashed border-border bg-muted/20 py-12 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Briefcase className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  Start building your portfolio
                </h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                  Add ETFs, stocks, or indices from the catalog below, then adjust
                  weights to define your target allocation.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setCommandOpen(true)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Your First Asset
                </Button>
                <p className="text-xs text-muted-foreground mt-3">
                  Search the catalog to find ETFs, stocks, and indices
                </p>
              </div>
            )}

            {/* Add Asset Button */}
            <button
              onClick={() => setCommandOpen(true)}
              className="flex items-center justify-between w-full rounded-xl border border-dashed border-border bg-card px-4 py-3 text-sm text-muted-foreground hover:border-primary/50 hover:text-foreground hover:bg-muted/30 transition-all group"
            >
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4 text-primary" />
                <span className="font-medium">Add Asset</span>
              </div>
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>

          {/* Right Panel: Allocation Chart + Info (1/3 width) */}
          <div className="space-y-4">
            {/* Allocation Chart Card */}
            <div className="rounded-xl border border-border bg-card p-5 overflow-visible">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-foreground">
                  Allocation
                </h2>
                {assetCount > 0 && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      weightsValid
                        ? "text-green-600 border-green-200 dark:border-green-900"
                        : "text-amber-600 border-amber-200 dark:border-amber-900"
                    )}
                  >
                    {totalWeight.toFixed(1)}%
                  </Badge>
                )}
              </div>

              <AllocationChart data={chartData} />
            </div>

            {/* Portfolio Summary Card */}
            {assetCount > 0 && (
              <div className="rounded-xl border border-border bg-card p-5">
                <h2 className="text-sm font-semibold text-foreground mb-3">
                  Summary
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Assets</span>
                    <span className="font-medium text-foreground">
                      {assetCount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Allocated</span>
                    <span
                      className={cn(
                        "font-medium font-mono",
                        weightsValid ? "text-green-600" : "text-amber-600"
                      )}
                    >
                      {totalWeight.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Remaining</span>
                    <span
                      className={cn(
                        "font-medium font-mono",
                        totalWeight <= 100
                          ? "text-foreground"
                          : "text-destructive"
                      )}
                    >
                      {Math.max(0, 100 - totalWeight).toFixed(1)}%
                    </span>
                  </div>
                  {currentBucket.portfolioCode && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Code</span>
                      <span className="font-mono text-xs text-foreground">
                        {currentBucket.portfolioCode}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-border pt-3 flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    {weightsValid ? (
                      <span className="flex items-center gap-1.5 text-green-600 font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Valid
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-amber-600 font-medium">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Incomplete
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Pro Tip Card */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    Pro Tip
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Diversify across asset classes for better risk-adjusted returns.
                    A mix of equities, bonds, and alternatives can smooth your
                    portfolio&apos;s ride through market cycles.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ⌘K Asset Search Command Palette */}
        <AssetSearchCommand
          open={commandOpen}
          onOpenChange={setCommandOpen}
          onSelect={handleAddAsset}
          excludeTickers={addedTickers}
        />

        {/* Run Simulation Dialog — asks for parameters before running */}
        <AlertDialog open={simDialogOpen} onOpenChange={setSimDialogOpen}>
          <AlertDialogContent className="sm:max-w-lg">
            <AlertDialogHeader>
              <AlertDialogTitle>Run Simulation</AlertDialogTitle>
              <AlertDialogDescription>
                Set your goal first, then configure investment parameters for &quot;{currentBucket?.name}&quot;.
              </AlertDialogDescription>
            </AlertDialogHeader>

            {/* Goal Section — FIRST */}
            <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-4 mb-4">
              <p className="text-xs font-semibold text-primary mb-3">📎 Set Your Goal</p>
              <div className="space-y-3">
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
                    Give your simulation a descriptive name.
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
                    How much do you want to accumulate?
                  </p>
                </div>
              </div>
            </div>

            {/* Investment Parameters */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                  Initial Investment ($)
                </label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={formatNumberWithCommas(initialInvestment)}
                  onChange={(e) => setInitialInvestment(parseFormattedNumber(e.target.value))}
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
                  onChange={(e) => setTimeHorizon(Number(e.target.value))}
                  min={1}
                  max={30}
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
                  onChange={(e) => setInflationRate(Number(e.target.value))}
                  min={0}
                  max={20}
                  step={0.5}
                  className="font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Goal adjusted for inflation
                </p>
              </div>
            </div>

            {/* Quick estimate when both amounts are filled */}
            {goal.ready && initialInvestment > 0 && monthlyContribution > 0 && (
              <p className={`text-xs ${goal.onTrack ? "text-green-600" : "text-amber-600"}`}>
                {goal.onTrack
                  ? `Projected: $${goal.projectedValue.toLocaleString()} — on track to meet your $${goal.inflatedTarget.toLocaleString()} target`
                  : `Projected: $${goal.projectedValue.toLocaleString()} — shortfall of $${goal.gap.toLocaleString()} from $${goal.inflatedTarget.toLocaleString()} target`}
              </p>
            )}

            <AlertDialogFooter className="mt-4">
              <AlertDialogCancel disabled={isRunning}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRunSimulation}
                disabled={isRunning || !targetCorpus || !simulationName.trim()}
                className="gap-2"
              >
                {isRunning ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {isRunning ? "Starting…" : "Run Simulation"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
