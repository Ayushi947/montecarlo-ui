"use client";

import * as React from "react";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Star,
  BarChart3,
  Landmark,
  Globe,
  Gem,
  Loader2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getDefaultTickersApi } from "@/services/portfolio-service";
import { mapDefaultTickerToSearchAsset } from "@/lib/portfolio-utils";

/**
 * Asset definition for the search catalog
 */
interface SearchAsset {
  ticker: string;
  exchange: string;
  name: string;
  price: number;
  change: number;
  category: "equity" | "bond" | "commodity" | "international" | "index";
  assetClassName?: string;
  expectedReturn?: number;
}

interface AssetSearchCommandProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (asset: {
    ticker: string;
    name: string;
    price: number;
    change: number;
    assetClassName?: string;
    expectedReturn?: number;
  }) => void;
  excludeTickers?: string[];
}

/**
 * Category icons mapping
 */
const CATEGORY_ICONS: Record<SearchAsset["category"], React.ComponentType<{ className?: string }>> = {
  equity: BarChart3,
  bond: Landmark,
  commodity: Gem,
  international: Globe,
  index: TrendingUp,
};

/**
 * Fallback asset catalog — used when the API is unavailable or as a supplement
 */
const FALLBACK_CATALOG: SearchAsset[] = [
  // US Equity ETFs
  { ticker: "SPY", exchange: "US", name: "SPDR S&P 500 ETF Trust", price: 512.34, change: 1.24, category: "equity" },
  { ticker: "QQQ", exchange: "US", name: "Invesco QQQ Trust Series I", price: 438.92, change: 1.87, category: "equity" },
  { ticker: "VTI", exchange: "US", name: "Vanguard Total Stock Market ETF", price: 267.45, change: 0.95, category: "equity" },
  { ticker: "IWM", exchange: "US", name: "iShares Russell 2000 ETF", price: 198.34, change: 1.12, category: "equity" },
  { ticker: "DIA", exchange: "US", name: "SPDR Dow Jones Industrial ETF", price: 389.56, change: 0.68, category: "equity" },
  { ticker: "VOO", exchange: "US", name: "Vanguard S&P 500 ETF", price: 470.23, change: 1.21, category: "equity" },
  { ticker: "VGT", exchange: "US", name: "Vanguard Information Technology ETF", price: 532.10, change: 2.14, category: "equity" },
  { ticker: "XLF", exchange: "US", name: "Financial Select Sector SPDR", price: 42.89, change: 0.56, category: "equity" },

  // Bond ETFs
  { ticker: "BND", exchange: "US", name: "Vanguard Total Bond Market ETF", price: 72.18, change: -0.12, category: "bond" },
  { ticker: "TLT", exchange: "US", name: "iShares 20+ Year Treasury Bond", price: 92.45, change: -0.34, category: "bond" },
  { ticker: "AGG", exchange: "US", name: "iShares Core US Aggregate Bond", price: 99.87, change: -0.08, category: "bond" },
  { ticker: "LQD", exchange: "US", name: "iShares iBoxx $ Inv Grade Corp", price: 108.34, change: -0.15, category: "bond" },
  { ticker: "HYG", exchange: "US", name: "iShares iBoxx $ High Yield Corp", price: 76.92, change: 0.22, category: "bond" },

  // Commodities
  { ticker: "GLD", exchange: "US", name: "SPDR Gold Shares", price: 198.67, change: 0.45, category: "commodity" },
  { ticker: "SLV", exchange: "US", name: "iShares Silver Trust", price: 23.45, change: 1.32, category: "commodity" },
  { ticker: "USO", exchange: "US", name: "United States Oil Fund", price: 71.23, change: -0.89, category: "commodity" },

  // International
  { ticker: "VWO", exchange: "US", name: "Vanguard FTSE Emerging Markets", price: 42.56, change: -0.78, category: "international" },
  { ticker: "IEMG", exchange: "US", name: "iShares Core MSCI Emerging Mkts", price: 51.23, change: -0.56, category: "international" },
  { ticker: "EFA", exchange: "US", name: "iShares MSCI EAFE ETF", price: 78.45, change: 0.34, category: "international" },
  { ticker: "VEA", exchange: "US", name: "Vanguard FTSE Developed Markets", price: 49.12, change: 0.28, category: "international" },

  // Real Estate & Others
  { ticker: "VNQ", exchange: "US", name: "Vanguard Real Estate ETF", price: 82.91, change: 0.67, category: "equity" },
  { ticker: "ARKK", exchange: "US", name: "ARK Innovation ETF", price: 48.67, change: 3.45, category: "equity" },
];

/**
 * Key for localStorage recent searches
 */
const RECENT_SEARCHES_KEY = "simulix-recent-searches";
const MAX_RECENT = 5;

/**
 * Asset Search Command Palette
 *
 * A ⌘K-triggered search overlay for finding and adding assets to portfolios.
 *
 * Features:
 * - Fuzzy search by ticker or name (powered by cmdk)
 * - Grouped by asset category (Equity, Bond, Commodity, International)
 * - Recent searches persisted in localStorage
 * - Ticker:Exchange format display (e.g., SPY:US)
 * - Keyboard navigation (↑↓ to navigate, Enter to select, Esc to close)
 * - Already-added assets are excluded
 * - Price + daily change shown inline
 *
 * Matches Stitch UI: Builder Search Overlay (Screen 11)
 */
export function AssetSearchCommand({
  open,
  onOpenChange,
  onSelect,
  excludeTickers = [],
}: AssetSearchCommandProps) {
  const [recentSearches, setRecentSearches] = React.useState<string[]>([]);
  const [apiAssets, setApiAssets] = React.useState<SearchAsset[]>([]);
  const [apiLoaded, setApiLoaded] = React.useState(false);
  const [apiLoading, setApiLoading] = React.useState(false);

  // Load recent searches from localStorage
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch {
      // ignore parse errors
    }
  }, [open]);

  // Fetch default tickers from API when dialog opens
  React.useEffect(() => {
    if (!open || apiLoaded) return;
    let cancelled = false;
    setApiLoading(true);

    getDefaultTickersApi()
      .then((response) => {
        if (cancelled) return;
        if (response.success && response.data) {
          const mapped = response.data.map(mapDefaultTickerToSearchAsset);
          setApiAssets(mapped);
        }
        setApiLoaded(true);
      })
      .catch(() => {
        if (cancelled) return;
        // API failed — fall back to hardcoded catalog
        setApiLoaded(true);
        toast.error("Couldn't load asset catalog", {
          description: "Showing default assets. Check your connection.",
        });
      })
      .finally(() => {
        if (!cancelled) setApiLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, apiLoaded]);

  // Merge API assets with fallback catalog (API assets take precedence by ticker)
  const fullCatalog = React.useMemo(() => {
    if (apiAssets.length === 0) return FALLBACK_CATALOG;
    const apiTickers = new Set(apiAssets.map((a) => a.ticker));
    const fallbackFiltered = FALLBACK_CATALOG.filter((a) => !apiTickers.has(a.ticker));
    return [...apiAssets, ...fallbackFiltered];
  }, [apiAssets]);

  // Filter out already-added assets
  const excludeSet = React.useMemo(() => new Set(excludeTickers), [excludeTickers]);

  const availableAssets = React.useMemo(
    () => fullCatalog.filter((a) => !excludeSet.has(a.ticker)),
    [fullCatalog, excludeSet]
  );

  // Group assets by category
  const groupedAssets = React.useMemo(() => {
    const groups: Record<string, SearchAsset[]> = {};
    for (const asset of availableAssets) {
      if (!groups[asset.category]) groups[asset.category] = [];
      groups[asset.category].push(asset);
    }
    return groups;
  }, [availableAssets]);

  // Recent assets (from stored tickers)
  const recentAssets = React.useMemo(
    () =>
      recentSearches
        .map((ticker) => fullCatalog.find((a) => a.ticker === ticker))
        .filter((a): a is SearchAsset => a !== undefined && !excludeSet.has(a.ticker)),
    [recentSearches, fullCatalog, excludeSet]
  );

  const categoryLabels: Record<string, string> = {
    equity: "Equities",
    bond: "Fixed Income",
    commodity: "Commodities",
    international: "International",
    index: "Indices",
  };

  const handleSelect = (asset: SearchAsset) => {
    // Update recent searches
    const updated = [
      asset.ticker,
      ...recentSearches.filter((t) => t !== asset.ticker),
    ].slice(0, MAX_RECENT);
    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {
      // ignore storage errors
    }

    onSelect({
      ticker: asset.ticker,
      name: asset.name,
      price: asset.price,
      change: asset.change,
      assetClassName: asset.assetClassName,
      expectedReturn: asset.expectedReturn,
    });
    onOpenChange(false);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search Assets"
      description="Search for ETFs, stocks, or indices to add to your portfolio"
      showCloseButton={false}
    >
      <CommandInput placeholder="Search by ticker or name… (e.g., SPY, Vanguard)" />
      <CommandList className="max-h-[400px]">
        <CommandEmpty>
          <div className="flex flex-col items-center gap-2 py-4">
            <BarChart3 className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              No matching assets found
            </p>
            <p className="text-xs text-muted-foreground/70">
              Try searching with a different ticker or name
            </p>
          </div>
        </CommandEmpty>

        {/* Recent Searches */}
        {recentAssets.length > 0 && (
          <>
            <CommandGroup heading="Recent">
              {recentAssets.map((asset) => (
                <AssetCommandItem
                  key={`recent-${asset.ticker}`}
                  asset={asset}
                  onSelect={handleSelect}
                  showBadge
                />
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* Loading indicator for API fetch */}
        {apiLoading && (
          <div className="flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading assets…
          </div>
        )}

        {/* Popular / Suggested */}
        {excludeTickers.length === 0 && (
          <>
            <CommandGroup heading="Popular">
              {fullCatalog.slice(0, 4).map((asset) => (
                <AssetCommandItem
                  key={`popular-${asset.ticker}`}
                  asset={asset}
                  onSelect={handleSelect}
                />
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* Grouped by Category */}
        {Object.entries(groupedAssets).map(([category, assets]) => (
          <CommandGroup
            key={category}
            heading={categoryLabels[category] ?? category}
          >
            {assets.map((asset) => (
              <AssetCommandItem
                key={asset.ticker}
                asset={asset}
                onSelect={handleSelect}
              />
            ))}
          </CommandGroup>
        ))}
      </CommandList>

      {/* Footer with keyboard hints */}
      <div className="flex items-center justify-between border-t border-border px-3 py-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <kbd className="inline-flex h-5 items-center rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium">
              ↑↓
            </kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="inline-flex h-5 items-center rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium">
              ↵
            </kbd>
            Select
          </span>
          <span className="flex items-center gap-1">
            <kbd className="inline-flex h-5 items-center rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium">
              esc
            </kbd>
            Close
          </span>
        </div>
        <span className="hidden sm:inline">
          {availableAssets.length} assets available
        </span>
      </div>
    </CommandDialog>
  );
}

/**
 * Individual asset item within the command list
 */
function AssetCommandItem({
  asset,
  onSelect,
  showBadge,
}: {
  asset: SearchAsset;
  onSelect: (asset: SearchAsset) => void;
  showBadge?: boolean;
}) {
  const isPositive = asset.change >= 0;
  const CategoryIcon = CATEGORY_ICONS[asset.category];

  return (
    <CommandItem
      value={`${asset.ticker} ${asset.name} ${asset.exchange}`}
      onSelect={() => onSelect(asset)}
      className="flex items-center gap-3 py-2.5 cursor-pointer"
    >
      {/* Category Icon */}
      <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
        <CategoryIcon className="h-4 w-4 text-primary" />
      </div>

      {/* Ticker + Name */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-foreground">
            {asset.ticker}
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">
            :{asset.exchange}
          </span>
          {showBadge && (
            <Badge
              variant="secondary"
              className="h-4 text-[9px] px-1"
            >
              <Clock className="h-2.5 w-2.5 mr-0.5" />
              Recent
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">{asset.name}</p>
      </div>

      {/* Price + Change */}
      <div className="text-right shrink-0">
        <p className="text-sm font-mono text-foreground">
          ${asset.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </p>
        <p
          className={cn(
            "text-[10px] font-mono flex items-center justify-end gap-0.5",
            isPositive ? "text-green-600" : "text-red-600"
          )}
        >
          {isPositive ? (
            <TrendingUp className="h-2.5 w-2.5" />
          ) : (
            <TrendingDown className="h-2.5 w-2.5" />
          )}
          {isPositive ? "+" : ""}
          {asset.change.toFixed(2)}%
        </p>
      </div>
    </CommandItem>
  );
}
