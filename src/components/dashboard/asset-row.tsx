"use client";

import { Trash2, GripVertical, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface AssetRowProps {
  ticker: string;
  name: string;
  price: number;
  change: number;
  weight: number;
  onWeightChange: (weight: number) => void;
  onRemove: () => void;
  color: string;
}

/**
 * Asset Row Component
 *
 * Displays a single asset in the portfolio builder with:
 * - Ticker + name
 * - Current price + daily change
 * - Weight slider + input
 * - Remove button
 * - Color indicator matching pie chart
 *
 * Matches Stitch UI: Portfolio Builder asset list item
 */
export function AssetRow({
  ticker,
  name,
  price,
  change,
  weight,
  onWeightChange,
  onRemove,
  color,
}: AssetRowProps) {
  const isPositive = change >= 0;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-border transition-colors group">
      {/* Drag Handle */}
      <GripVertical className="h-4 w-4 text-muted-foreground/30 cursor-grab shrink-0 hidden sm:block" />

      {/* Color Indicator */}
      <div
        className="w-3 h-8 rounded-full shrink-0"
        style={{ backgroundColor: color }}
      />

      {/* Asset Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-foreground">
            {ticker}
          </span>
          <span className="text-xs text-muted-foreground truncate hidden sm:inline">
            {name}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground font-mono">
            ${price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
          <Badge
            variant="outline"
            className={cn(
              "h-5 text-[10px] px-1.5 font-mono",
              isPositive
                ? "text-green-600 border-green-200 dark:border-green-900"
                : "text-red-600 border-red-200 dark:border-red-900"
            )}
          >
            {isPositive ? (
              <TrendingUp className="h-2.5 w-2.5 mr-0.5" />
            ) : (
              <TrendingDown className="h-2.5 w-2.5 mr-0.5" />
            )}
            {isPositive ? "+" : ""}
            {change.toFixed(2)}%
          </Badge>
        </div>
      </div>

      {/* Weight Slider */}
      <div className="flex items-center gap-2 shrink-0">
        <input
          type="range"
          min="0"
          max="100"
          step="0.5"
          value={weight}
          onChange={(e) => onWeightChange(parseFloat(e.target.value))}
          className="w-20 sm:w-28 h-2 accent-primary"
        />
        <div className="relative w-16">
          <Input
            type="number"
            min={0}
            max={100}
            step={0.5}
            value={weight}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val) && val >= 0 && val <= 100) {
                onWeightChange(val);
              }
            }}
            className="h-8 text-xs text-center pr-5 font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            %
          </span>
        </div>
      </div>

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        onClick={onRemove}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
