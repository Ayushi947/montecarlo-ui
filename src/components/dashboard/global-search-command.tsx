"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  FlaskConical,
  BarChart3,
  LineChart,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  TrendingUp,
  Landmark,
  Gem,
  Globe,
} from "lucide-react";

import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { useSimulationStore } from "@/stores/simulation-store";
import { getDefaultTickersApi } from "@/services/portfolio-service";
import { mapDefaultTickerToSearchAsset } from "@/lib/portfolio-utils";

interface GlobalSearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Static list of dashboard pages */
const PAGES = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Portfolio Builder", href: "/dashboard/builder", icon: Briefcase },
  { name: "Simulation Lab", href: "/dashboard/simulate", icon: FlaskConical },
  { name: "Outcomes", href: "/dashboard/outcomes", icon: BarChart3 },
  { name: "Projections", href: "/dashboard/projections", icon: LineChart },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

/** Status icon mapping */
const statusIcons = {
  completed: CheckCircle,
  failed: XCircle,
  pending: Clock,
  queued: Clock,
  running: Loader2,
};

/** Category icon mapping for assets */
const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  equity: BarChart3,
  bond: Landmark,
  commodity: Gem,
  international: Globe,
  index: TrendingUp,
};

/** Fallback asset catalog for search */
const FALLBACK_ASSETS = [
  { ticker: "SPY", name: "SPDR S&P 500 ETF Trust", category: "equity" },
  { ticker: "QQQ", name: "Invesco QQQ Trust Series I", category: "equity" },
  { ticker: "VTI", name: "Vanguard Total Stock Market ETF", category: "equity" },
  { ticker: "VOO", name: "Vanguard S&P 500 ETF", category: "equity" },
  { ticker: "IWM", name: "iShares Russell 2000 ETF", category: "equity" },
  { ticker: "VGT", name: "Vanguard Information Technology ETF", category: "equity" },
  { ticker: "BND", name: "Vanguard Total Bond Market ETF", category: "bond" },
  { ticker: "TLT", name: "iShares 20+ Year Treasury Bond", category: "bond" },
  { ticker: "AGG", name: "iShares Core US Aggregate Bond", category: "bond" },
  { ticker: "GLD", name: "SPDR Gold Shares", category: "commodity" },
  { ticker: "SLV", name: "iShares Silver Trust", category: "commodity" },
  { ticker: "VWO", name: "Vanguard FTSE Emerging Markets", category: "international" },
  { ticker: "EFA", name: "iShares MSCI EAFE ETF", category: "international" },
  { ticker: "VNQ", name: "Vanguard Real Estate ETF", category: "equity" },
];

interface SearchableAsset {
  ticker: string;
  name: string;
  category: string;
}

/**
 * GlobalSearchCommand
 *
 * A universal ⌘K search palette that searches across:
 * 1. Dashboard pages (static routes)
 * 2. Saved portfolios (from simulation store)
 * 3. Assets / ETFs (from API + fallback catalog)
 * 4. Simulation history (from simulation store)
 *
 * Uses cmdk via the shadcn CommandDialog component.
 */
export function GlobalSearchCommand({
  open,
  onOpenChange,
}: GlobalSearchCommandProps) {
  const router = useRouter();
  const savedBuckets = useSimulationStore((s) => s.savedBuckets);
  const simulationHistory = useSimulationStore((s) => s.simulationHistory);

  const [assets, setAssets] = React.useState<SearchableAsset[]>(FALLBACK_ASSETS);
  const [assetsLoaded, setAssetsLoaded] = React.useState(false);

  // Fetch asset catalog when the dialog first opens
  React.useEffect(() => {
    if (!open || assetsLoaded) return;
    let cancelled = false;

    getDefaultTickersApi()
      .then((response) => {
        if (cancelled) return;
        if (response.success && response.data) {
          const mapped = response.data.map(mapDefaultTickerToSearchAsset);
          const apiTickers = new Set(mapped.map((a) => a.ticker));
          const fallback = FALLBACK_ASSETS.filter(
            (a) => !apiTickers.has(a.ticker)
          );
          setAssets([
            ...mapped.map((a) => ({
              ticker: a.ticker,
              name: a.name,
              category: a.category,
            })),
            ...fallback,
          ]);
        }
        setAssetsLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setAssetsLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, [open, assetsLoaded]);

  const handleSelect = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Global Search"
      description="Search pages, portfolios, assets, and simulations"
    >
      <CommandInput placeholder="Search anything — pages, assets, portfolios..." />
      <CommandList className="max-h-[360px]">
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Pages */}
        <CommandGroup heading="Pages">
          {PAGES.map((page) => (
            <CommandItem
              key={page.href}
              value={`page ${page.name}`}
              onSelect={() => handleSelect(page.href)}
              className="cursor-pointer"
            >
              <page.icon className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{page.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        {/* Portfolios */}
        {savedBuckets.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Portfolios">
              {savedBuckets.map((bucket) => (
                <CommandItem
                  key={bucket.id}
                  value={`portfolio ${bucket.name} ${bucket.portfolioCode ?? ""}`}
                  onSelect={() =>
                    handleSelect(`/dashboard/builder?portfolio=${bucket.id}`)
                  }
                  className="cursor-pointer"
                >
                  <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 truncate">{bucket.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {bucket.assets.length} assets
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {/* Assets */}
        <CommandSeparator />
        <CommandGroup heading="Assets">
          {assets.map((asset) => {
            const CategoryIcon = categoryIcons[asset.category] ?? BarChart3;
            return (
              <CommandItem
                key={asset.ticker}
                value={`asset ${asset.ticker} ${asset.name} ${asset.category}`}
                onSelect={() => handleSelect("/dashboard/builder")}
                className="cursor-pointer"
              >
                <CategoryIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">{asset.ticker}</span>
                <span className="text-xs text-muted-foreground ml-1.5 truncate flex-1">
                  {asset.name}
                </span>
              </CommandItem>
            );
          })}
        </CommandGroup>

        {/* Simulations */}
        {simulationHistory.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Simulations">
              {simulationHistory.slice(0, 8).map((sim) => {
                const portfolio = savedBuckets.find(
                  (b) => b.id === sim.bucketId
                );
                const statusKey =
                  sim.status === "queued" ? "pending" : sim.status;
                const StatusIcon =
                  statusIcons[statusKey as keyof typeof statusIcons] ??
                  Clock;

                return (
                  <CommandItem
                    key={sim.id}
                    value={`simulation ${portfolio?.name ?? "portfolio"} ${sim.status} ${sim.probabilityOfSuccess ?? ""}`}
                    onSelect={() => handleSelect("/dashboard/outcomes")}
                    className="cursor-pointer"
                  >
                    <StatusIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 truncate">
                      {portfolio?.name ?? "Portfolio"} — {sim.status}
                    </span>
                    {sim.status === "completed" && sim.probabilityOfSuccess != null && (
                      <span className="text-xs font-medium text-green-600 ml-2">
                        {sim.probabilityOfSuccess.toFixed(1)}%
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
