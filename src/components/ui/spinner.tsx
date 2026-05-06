import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface SpinnerProps {
  /** Size of the spinner */
  size?: "sm" | "md" | "lg" | "xl";
  /** Additional className */
  className?: string;
}

/**
 * Loading Spinner Component
 *
 * Consistent loading indicator across the app.
 * Uses Lucide Loader2 icon with rotation animation.
 */
export function Spinner({ size = "md", className }: SpinnerProps) {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  return (
    <Loader2
      className={cn("animate-spin text-primary", sizes[size], className)}
    />
  );
}

/**
 * Full Page Loading State
 */
export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="xl" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

/**
 * Section Loading State
 */
export function SectionLoader({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center py-12",
        className
      )}
    >
      <Spinner size="lg" />
    </div>
  );
}

/**
 * Button Loading State
 */
export function ButtonLoader({ className }: { className?: string }) {
  return <Spinner size="sm" className={cn("mr-2", className)} />;
}

/**
 * Inline Loading State
 */
export function InlineLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-muted-foreground">
      <Spinner size="sm" />
      <span className="text-sm">{text}</span>
    </span>
  );
}
