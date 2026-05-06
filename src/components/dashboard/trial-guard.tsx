"use client";

import * as React from "react";
import {
  Lock,
  ShieldAlert,
  Zap,
  CheckCircle2,
  Database,
  Crown,
  ArrowRight,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSimulationStore, useTrialLimitReached } from "@/stores/simulation-store";
import { useAuthStore } from "@/stores/auth-store";

interface TrialGuardProps {
  onUpgrade: () => void;
}

/**
 * Trial Guard Overlay
 *
 * A paywall overlay triggered after the user exhausts their free trial
 * simulation limit (3 runs). Displays:
 * - Lock icon with animated pulse
 * - Usage counter (3/3 runs)
 * - "Professional Upgrade Required" heading
 * - Data preservation assurance
 * - Feature comparison (Free vs Pro)
 * - Primary "Upgrade Now" CTA
 *
 * The overlay renders on top of the last simulation results (visible
 * in the blurred background) to create urgency.
 *
 * Matches Stitch UI: Trial Guard Active State (Screen 19)
 */
export function TrialGuard({ onUpgrade }: TrialGuardProps) {
  const isLimitReached = useTrialLimitReached();
  const sessionCount = useSimulationStore((s) => s.sessionSimulationCount);
  const trialLimit = useSimulationStore((s) => s.trialLimit);
  const user = useAuthStore((s) => s.user);

  const [dismissed, setDismissed] = React.useState(false);

  // Only show for trial users who have hit the limit
  const isTrial = !user || user.plan === "free";
  if (!isLimitReached || !isTrial || dismissed) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

      {/* Modal Card - slides up on mobile like a bottom sheet */}
      <div className="relative w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        {/* Dismiss button */}
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-4 right-4 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors z-10"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Top gradient bar */}
        <div className="h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />

        <div className="p-5 sm:p-8 text-center">
          {/* Lock Icon */}
          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4 sm:mb-5 relative">
            <Lock className="h-7 w-7 sm:h-9 sm:w-9 text-amber-600" />
            <div className="absolute -top-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] sm:text-xs font-bold shadow-lg">
              !
            </div>
          </div>

          {/* Usage Counter */}
          <Badge
            variant="outline"
            className="text-sm font-mono text-amber-600 border-amber-200 dark:border-amber-800 mb-4 px-3 py-1"
          >
            <ShieldAlert className="h-3.5 w-3.5 mr-1.5" />
            {sessionCount}/{trialLimit} free runs used
          </Badge>

          {/* Heading */}
          <h2 className="text-lg sm:text-xl font-bold text-foreground mb-2">
            Professional Upgrade Required
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto mb-4 sm:mb-6">
            You&apos;ve reached the limit of the free trial. Upgrade to continue
            running unlimited Monte Carlo simulations.
          </p>

          {/* Data Safety Notice */}
          <div className="flex items-center justify-center gap-2 text-xs text-green-600 dark:text-green-400 mb-6">
            <Database className="h-3.5 w-3.5" />
            <span className="font-medium">
              Your previous simulation data is safe and will be preserved
            </span>
          </div>

          {/* Feature Comparison */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-6 sm:mb-8 text-left">
            {/* Free */}
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Free Trial
              </p>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                  3 simulation runs
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                  1 portfolio
                </li>
                <li className="flex items-center gap-2">
                  <X className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                  <span className="line-through opacity-50">Unlimited runs</span>
                </li>
                <li className="flex items-center gap-2">
                  <X className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                  <span className="line-through opacity-50">CSV/PDF export</span>
                </li>
              </ul>
            </div>

            {/* Pro */}
            <div className="rounded-xl border-2 border-primary bg-primary/5 p-4 relative">
              <Badge className="absolute -top-2.5 right-3 bg-primary text-primary-foreground text-[10px] px-2">
                Recommended
              </Badge>
              <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3 flex items-center gap-1">
                <Crown className="h-3 w-3" />
                Pro
              </p>
              <ul className="space-y-2 text-xs text-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                  <span className="font-medium">1,000 simulation runs</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                  Unlimited portfolios
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                  CSV &amp; PDF export
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                  Priority support
                </li>
              </ul>
            </div>
          </div>

          {/* CTAs */}
          <div className="space-y-3">
            <Button
              onClick={onUpgrade}
              className="w-full gap-2 h-11 text-base"
              size="lg"
            >
              <Zap className="h-5 w-5" />
              Upgrade Now — $249/month
              <ArrowRight className="h-4 w-4" />
            </Button>
            <button
              onClick={() => setDismissed(true)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Maybe later — continue with limited access
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
