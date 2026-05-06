"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Briefcase,
  Loader2,
  Lock,
  ArrowRight,
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
import { AllocationChart } from "@/components/dashboard/allocation-chart";
import { listPortfoliosApi } from "@/services/portfolio-service";
import { mapApiPortfolioToBucket } from "@/lib/portfolio-utils";
import { BuilderSkeleton } from "@/components/dashboard/skeletons";

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
 * Portfolio Builder — Card List Page
 *
 * Displays all saved portfolios as clickable cards.
 * Clicking a card navigates to /dashboard/builder/[id] for editing.
 */
export default function BuilderListPage() {
  const router = useRouter();

  // Auth store for plan limits
  const { user } = useAuthStore();
  const portfoliosLimit = user?.portfoliosLimit ?? 3;
  // -1 means unlimited (Pro plan)
  const isPortfolioUnlimited = portfoliosLimit === -1;

  // Store state & actions
  const savedBuckets = useSimulationStore((s) => s.savedBuckets);
  const setSavedBuckets = useSimulationStore((s) => s.setSavedBuckets);
  const setPortfoliosLoaded = useSimulationStore((s) => s.setPortfoliosLoaded);
  const portfoliosLoaded = useSimulationStore((s) => s.portfoliosLoaded);
  const setCurrentBucket = useSimulationStore((s) => s.setCurrentBucket);

  // Portfolio limit check
  const atPortfolioLimit = !isPortfolioUnlimited && savedBuckets.length >= portfoliosLimit;

  // Clear currentBucket on mount (we're on the list view)
  React.useEffect(() => {
    setCurrentBucket(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch portfolios from API on mount
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

  // ─── Handlers ───

  const handleOpenPortfolio = (bucket: typeof savedBuckets[0]) => {
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

  // ─── Loading State ───
  if (!portfoliosLoaded) {
    return <BuilderSkeleton />;
  }

  return (
    <TooltipProvider>
      <div className="space-y-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Portfolio Builder
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Construct and weight your investment portfolio
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Portfolio limit indicator */}
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {isPortfolioUnlimited
                ? `${savedBuckets.length} portfolios`
                : `${savedBuckets.length} of ${portfoliosLimit} portfolios used`}
            </span>

            {atPortfolioLimit ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" disabled className="gap-2">
                    <Lock className="h-4 w-4" />
                    New Portfolio
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Upgrade your plan to create more portfolios</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Button size="sm" onClick={handleNewPortfolio} className="gap-2">
                <Plus className="h-4 w-4" />
                New Portfolio
              </Button>
            )}
          </div>
        </div>

        {savedBuckets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {savedBuckets.map((bucket) => {
              const bucketTotalWeight = bucket.assets.reduce(
                (sum, a) => sum + a.weight,
                0
              );
              const isValid = Math.abs(bucketTotalWeight - 100) < 0.01;
              const miniChartData = bucket.assets.map((a) => ({
                name: a.name,
                ticker: a.ticker,
                value: a.weight,
              }));

              return (
                <button
                  key={bucket.id}
                  onClick={() => handleOpenPortfolio(bucket)}
                  className="group relative text-left rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 overflow-hidden"
                >
                  {/* Top section with mini chart */}
                  <div className="p-5 pb-3">
                    <div className="mb-3">
                      {bucket.assets.length > 0 ? (
                        <div className="h-[80px] w-[80px] mx-auto">
                          <AllocationChart data={miniChartData} compact className="h-[80px] w-[80px]" />
                        </div>
                      ) : (
                        <div className="h-[80px] w-[80px] mx-auto rounded-full bg-muted/30 flex items-center justify-center">
                          <Briefcase className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Portfolio info */}
                    <div className="text-center">
                      <p className="font-semibold text-foreground truncate">
                        {bucket.name}
                      </p>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <Badge variant="outline" className="text-[10px] h-5">
                          {bucket.assets.length} assets
                        </Badge>
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
                    </div>
                  </div>

                  {/* Bottom action bar */}
                  <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/20 group-hover:bg-primary/5 transition-colors">
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(bucket.updatedAt)}
                    </p>
                    <div className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Open</span>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </button>
              );
            })}

            {/* New Portfolio card */}
            {atPortfolioLimit ? (
              <Tooltip> 
                <TooltipTrigger asChild>
                  <div className="flex flex-col items-center justify-center p-5 rounded-xl border-2 border-dashed border-border bg-muted/10 opacity-60 gap-2 min-h-[200px] cursor-not-allowed">
                    <Lock className="h-6 w-6 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Limit Reached
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Upgrade to create more
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Upgrade your plan to create more portfolios</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <button
                onClick={handleNewPortfolio}
                className="flex flex-col items-center justify-center p-5 rounded-xl border-2 border-dashed border-border bg-muted/10 hover:border-primary/50 hover:bg-muted/30 transition-all gap-2 min-h-[200px]"
              >
                <Plus className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  New Portfolio
                </span>
                <span className="text-xs text-muted-foreground">
                  {isPortfolioUnlimited
                    ? "Unlimited"
                    : `${portfoliosLimit - savedBuckets.length} of ${portfoliosLimit} remaining`}
                </span>
              </button>
            )}
          </div>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-border bg-muted/20 py-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Briefcase className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              No portfolios yet
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Create your first portfolio to start running Monte Carlo simulations.
            </p>
            <Button onClick={handleNewPortfolio} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Portfolio
            </Button>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
