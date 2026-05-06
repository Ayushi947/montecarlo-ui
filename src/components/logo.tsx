import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Simulix Logo Mark SVG — "Probability Path"
 *
 * A bell curve (normal distribution) intersected by a diagonal vector line,
 * symbolizing "turning probability into certainty" — the core concept of
 * Monte Carlo simulation. Extracted from Stitch UI Logo Concept #3.
 *
 * viewBox: 0 0 24 24 (small variant)
 */
function SimulixMark({ className }: { className?: string }) {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Bell curve (normal distribution) */}
      <path
        d="M3 18C3 18 6 18 8 16C10 14 11 6 11 6C11 6 12 14 14 16C16 18 19 18 19 18"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      {/* Vector path (cutting through — probability → certainty) */}
      <path
        d="M5 20L17 4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeOpacity="0.8"
        strokeWidth="2"
      />
    </svg>
  );
}

/**
 * Simulix Logo Mark SVG — Large Hero Version
 *
 * Higher-fidelity version with thicker strokes and data-point circles.
 * Used for hero sections, loading screens, and standalone display.
 *
 * viewBox: 0 0 200 200
 */
function SimulixMarkHero({ className }: { className?: string }) {
  return (
    <svg
      fill="none"
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Bell Curve (Normal Distribution) */}
      <path
        d="M20 160C20 160 50 160 70 140C90 120 100 40 100 40C100 40 110 120 130 140C150 160 180 160 180 160"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="8"
      />
      {/* Vector Path (Cutting Through) */}
      <path
        d="M40 180L160 20"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="8"
        opacity="0.8"
      />
      {/* Data Points */}
      <circle cx="40" cy="180" fill="currentColor" r="6" />
      <circle cx="160" cy="20" fill="currentColor" r="6" />
    </svg>
  );
}

interface LogoProps {
  /** Show text alongside icon */
  showText?: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Additional className */
  className?: string;
  /** Link destination (default: /) */
  href?: string;
  /** Whether to wrap in Link component */
  asLink?: boolean;
}

/**
 * Simulix Logo Component
 *
 * Consistent branding across the application.
 * Uses the "Probability Path" mark from Stitch UI —
 * a bell curve intersected by a vector line on a primary-blue rounded square.
 *
 * Usage:
 * - Navbar: <Logo showText size="md" asLink />
 * - Footer: <Logo showText size="sm" />
 * - Auth:   <Logo showText size="lg" asLink={false} />
 */
export function Logo({
  showText = true,
  size = "md",
  className,
  href = "/",
  asLink = true,
}: LogoProps) {
  const sizes = {
    sm: {
      container: "w-7 h-7",
      icon: "w-4 h-4",
      text: "text-lg",
      gap: "gap-1.5",
    },
    md: {
      container: "w-9 h-9",
      icon: "w-5 h-5",
      text: "text-xl",
      gap: "gap-2",
    },
    lg: {
      container: "w-12 h-12",
      icon: "w-7 h-7",
      text: "text-2xl",
      gap: "gap-3",
    },
  };

  const { container, icon, text, gap } = sizes[size];

  const content = (
    <div className={cn("flex items-center text-foreground", gap, className)}>
      {/* Icon Container — Blue rounded square with Probability Path mark */}
      <div
        className={cn(
          "bg-primary rounded-lg flex items-center justify-center",
          "shadow-sm",
          container,
        )}
      >
        <SimulixMark className={cn("text-primary-foreground", icon)} />
      </div>

      {/* Wordmark - inherits text color from parent or uses foreground as default */}
      {showText && (
        <span className={cn("font-bold tracking-tight", text)}>
          Simulix
        </span>
      )}
    </div>
  );

  if (asLink) {
    return (
      <Link
        href={href}
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
      >
        {content}
      </Link>
    );
  }

  return content;
}

/**
 * Logo Icon Only (for favicon, loading states)
 */
export function LogoIcon({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md",
        className,
      )}
    >
      <SimulixMark className="w-6 h-6 text-primary-foreground" />
    </div>
  );
}

/**
 * Animated Logo (for loading screens)
 */
export function LogoAnimated({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg animate-pulse">
        <SimulixMark className="w-7 h-7 text-primary-foreground" />
      </div>
      <div className="space-y-1">
        <span className="text-2xl font-bold text-foreground">Simulix</span>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
        </div>
      </div>
    </div>
  );
}

/**
 * Large Hero Logo (for marketing / auth pages)
 * Shows the high-fidelity 200×200 mark with glow effect
 */
export function LogoHero({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {/* Glow effect behind icon */}
      <div className="relative">
        <div className="absolute inset-0 bg-primary blur-[60px] opacity-20 rounded-full" />
        <div className="relative w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-2xl">
          <SimulixMarkHero className="w-14 h-14 text-primary-foreground" />
        </div>
      </div>
      {/* Wordmark */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground tracking-tight">
          Simulix
        </h1>
        <p className="text-xs font-mono tracking-[0.2em] uppercase text-primary/60 mt-1">
          Financial Simulation
        </p>
      </div>
    </div>
  );
}
