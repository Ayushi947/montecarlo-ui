import type {
  ApiPortfolio,
  ApiDefaultTicker,
  CreatePortfolioRequest,
  UpdatePortfolioRequest,
} from "@/types";

/**
 * Portfolio Utility Functions
 *
 * Maps between backend API shapes and frontend store shapes.
 *
 * Backend:  Portfolio → allocations[] { assetCode, assetName, targetAllocationPercentage, expectedReturn }
 * Frontend: PortfolioBucket → assets[] { ticker, name, weight, price, change }
 */

/** Store-level Asset type (matches simulation-store.ts) */
interface StoreAsset {
  ticker: string;
  name: string;
  price: number;
  change: number;
  weight: number;
  assetClassName?: string;
  expectedReturn?: number;
}

/** Store-level PortfolioBucket type (matches simulation-store.ts) */
interface StoreBucket {
  id: string;
  name: string;
  description?: string;
  assets: StoreAsset[];
  createdAt: string;
  updatedAt: string;
  isFromApi?: boolean;
  portfolioCode?: string;
}

/**
 * Map backend ApiPortfolio → frontend PortfolioBucket
 *
 * Converts allocation-based shape to asset-based shape.
 * Price/change are set to 0 (backend doesn't provide market data).
 */
export function mapApiPortfolioToBucket(api: ApiPortfolio): StoreBucket {
  return {
    id: api.id,
    name: api.portfolioName,
    description: api.description || undefined,
    assets: api.allocations.map((a) => ({
      ticker: a.assetCode,
      name: a.assetName,
      price: 0,
      change: 0,
      weight: a.targetAllocationPercentage,
      assetClassName: a.assetClassName,
      expectedReturn: a.expectedReturn,
    })),
    createdAt: api.createdAt,
    updatedAt: api.updatedAt,
    isFromApi: true,
    portfolioCode: api.portfolioCode,
  };
}

/**
 * Map frontend PortfolioBucket → backend CreatePortfolioRequest
 *
 * Converts asset-based shape to allocation-based shape.
 * Defaults: assetClassName → "Equity", expectedReturn → 10.0
 */
export function mapBucketToCreateRequest(
  bucket: StoreBucket
): CreatePortfolioRequest {
  return {
    portfolioName: bucket.name,
    description: bucket.description,
    allocations: bucket.assets.map((a, index) => ({
      assetCode: a.ticker.toUpperCase(),
      assetName: a.name,
      assetClassName: a.assetClassName || "Equity",
      targetAllocationPercentage: a.weight,
      expectedReturn: a.expectedReturn ?? 10.0,
      sortOrder: index + 1,
    })),
  };
}

/**
 * Map frontend PortfolioBucket → backend UpdatePortfolioRequest
 */
export function mapBucketToUpdateRequest(
  bucket: StoreBucket
): UpdatePortfolioRequest {
  return {
    portfolioName: bucket.name,
    description: bucket.description,
    allocations: bucket.assets.map((a, index) => ({
      assetCode: a.ticker.toUpperCase(),
      assetName: a.name,
      assetClassName: a.assetClassName || "Equity",
      targetAllocationPercentage: a.weight,
      expectedReturn: a.expectedReturn ?? 10.0,
      sortOrder: index + 1,
    })),
  };
}

/**
 * Map backend DefaultTicker → format for AssetSearchCommand
 *
 * Converts DefaultTicker to the shape the command palette expects.
 */
export function mapDefaultTickerToSearchAsset(ticker: ApiDefaultTicker) {
  return {
    ticker: ticker.assetCode,
    exchange: "US",
    name: ticker.assetName,
    price: 0,
    change: 0,
    category: mapAssetClassToCategory(ticker.assetClassName),
    assetClassName: ticker.assetClassName,
    expectedReturn: ticker.expectedReturn,
  };
}

/**
 * Map backend assetClassName → frontend search category
 */
function mapAssetClassToCategory(
  assetClassName: string
): "equity" | "bond" | "commodity" | "international" | "index" {
  const lower = assetClassName.toLowerCase();
  if (lower.includes("debt") || lower.includes("bond") || lower.includes("fixed"))
    return "bond";
  if (lower.includes("gold") || lower.includes("commodity"))
    return "commodity";
  if (lower.includes("international") || lower.includes("emerging"))
    return "international";
  return "equity";
}

/**
 * Get the top asset string for dashboard cards (e.g. "NVDA (25%)")
 */
export function getTopAssetLabel(
  assets: StoreAsset[]
): string {
  if (assets.length === 0) return "—";
  const sorted = [...assets].sort((a, b) => b.weight - a.weight);
  return `${sorted[0].ticker} (${sorted[0].weight.toFixed(0)}%)`;
}
