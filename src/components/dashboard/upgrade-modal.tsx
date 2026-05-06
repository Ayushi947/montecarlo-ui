"use client";

import * as React from "react";
import {
  Zap,
  Crown,
  CheckCircle2,
  CreditCard,
  Shield,
  Loader2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";
import { listPlansApi, createCheckoutSessionApi } from "@/services/subscription-service";
import type { ApiPlan } from "@/types";

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Upgrade Modal
 *
 * A dialog for selecting and purchasing a subscription plan.
 *
 * Features:
 * - 3-tier plan comparison (Lite/Pro/Elite)
 * - Highlighted "Popular" plan
 * - Feature checklist per plan
 * - Payment integration placeholder
 * - Current plan badge
 * - Accessible dialog with proper aria labels
 *
 * Matches Stitch UI: Upgrade Modal (Screen 20)
 */
export function UpgradeModal({ open, onOpenChange }: UpgradeModalProps) {
  const user = useAuthStore((s) => s.user);
  const [plans, setPlans] = React.useState<ApiPlan[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [checkoutLoading, setCheckoutLoading] = React.useState<string | null>(null);

  const currentPlan = user?.plan ?? "free";

  // Fetch plans when modal opens
  React.useEffect(() => {
    if (open) {
      setLoading(true);
      listPlansApi()
        .then((response) => {
          if (response.success && response.data) {
            // Sort by price ascending, exclude free plan
            const paidPlans = response.data
              .filter((p) => p.price > 0)
              .sort((a, b) => a.price - b.price);
            setPlans(paidPlans);
          }
        })
        .catch((error) => {
          console.error("Failed to fetch plans:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open]);

  const handleSelectPlan = async (planName: string) => {
    const name = planName.toLowerCase() as "basic" | "pro";
    setCheckoutLoading(planName);

    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const response = await createCheckoutSessionApi(
        name,
        `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        `${appUrl}/dashboard/settings`
      );

      if (response.success && response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error("Failed to start checkout", {
        description: err?.response?.data?.message || "Please try again.",
      });
    } finally {
      setCheckoutLoading(null);
    }
  };

  // Get plan styling based on name
  const getPlanStyle = (planName: string) => {
    const name = planName.toLowerCase();
    if (name === "pro" || name === "premium") {
      return {
        icon: Crown,
        color: "text-purple-600",
        bg: "bg-purple-50 dark:bg-purple-900/20",
        popular: true,
      };
    }
    return {
      icon: Zap,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      popular: false,
    };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Change Your Plan
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Choose the plan that fits your simulation needs.
          </DialogDescription>
        </DialogHeader>

        {/* Plan Cards */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No plans available. Please try again later.</p>
            </div>
          ) : (
            <div className={cn(
              "grid gap-4",
              plans.length === 1 ? "grid-cols-1 max-w-sm mx-auto" : "grid-cols-1 sm:grid-cols-2"
            )}>
              {plans.map((plan) => {
                const isCurrent = currentPlan === plan.name.toLowerCase();
                const style = getPlanStyle(plan.name);
                const PlanIcon = style.icon;

                return (
                  <div
                    key={plan.id}
                    className={cn(
                      "relative rounded-xl border-2 p-5 transition-all",
                      style.popular
                        ? "border-primary shadow-lg shadow-primary/10"
                        : "border-border hover:border-primary/30",
                      isCurrent && "opacity-60"
                    )}
                  >
                    {/* Popular badge */}
                    {style.popular && !isCurrent && (
                      <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] px-3">
                        Most Popular
                      </Badge>
                    )}

                    {/* Current plan badge */}
                    {isCurrent && (
                      <Badge
                        variant="outline"
                        className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] px-3 bg-card"
                      >
                        Current Plan
                      </Badge>
                    )}

                    {/* Icon + Name */}
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3", style.bg)}>
                      <PlanIcon className={cn("h-5 w-5", style.color)} />
                    </div>

                    <h3 className="text-base font-bold text-foreground">{plan.displayName}</h3>

                    {/* Price */}
                    <div className="mt-2 mb-4">
                      <span className="text-3xl font-bold text-foreground tabular-nums">
                        ${plan.price}
                      </span>
                      <span className="text-sm text-muted-foreground">/month</span>
                    </div>

                    {/* Limits */}
                    <div className="space-y-1 mb-3 text-xs text-muted-foreground">
                      <p>{plan.maxSimulationsPerMonth === -1 ? "Unlimited" : plan.maxSimulationsPerMonth} simulations/month</p>
                      <p>{plan.maxPortfolios === -1 ? "Unlimited" : plan.maxPortfolios} portfolios</p>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2 mb-5">
                      {plan.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-xs text-muted-foreground"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <Button
                      onClick={() => handleSelectPlan(plan.name)}
                      disabled={isCurrent || checkoutLoading === plan.name || !!checkoutLoading}
                      variant={style.popular ? "default" : "outline"}
                      className="w-full gap-2"
                      size="sm"
                    >
                      {isCurrent ? (
                        "Current Plan"
                      ) : checkoutLoading === plan.name ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Redirecting to checkout...
                        </>
                      ) : (
                        <>
                          <Zap className="h-3.5 w-3.5" />
                          Subscribe to {plan.displayName}
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-4 bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CreditCard className="h-3.5 w-3.5" />
              Secure payment
            </span>
            <span className="flex items-center gap-1">
              <Shield className="h-3.5 w-3.5" />
              Cancel anytime
            </span>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Maybe later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
