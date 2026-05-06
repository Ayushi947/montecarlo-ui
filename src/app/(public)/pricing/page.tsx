"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Zap, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { listPlansApi, createCheckoutSessionApi } from "@/services/subscription-service";
import { useAuthStore } from "@/stores/auth-store";
import type { ApiPlan } from "@/types";

/**
 * Pricing Page
 *
 * Fetches plans from API and displays them dynamically.
 * Logged-in users can subscribe directly via Stripe checkout.
 * Non-logged-in users are redirected to login first.
 */
export default function PricingPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<ApiPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const currentPlan = useAuthStore((s) => s.user?.plan ?? "free");

  // Fetch plans on mount
  useEffect(() => {
    listPlansApi()
      .then((response) => {
        if (response.success && response.data) {
          // Sort plans by price (free first, then by price ascending)
          const sortedPlans = [...response.data].sort((a, b) => a.price - b.price);
          setPlans(sortedPlans);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch plans:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Check if plan is the recommended one (usually Pro)
  const isRecommended = (plan: ApiPlan) => {
    return plan.name.toLowerCase() === "pro";
  };

  // Format limit display (-1 means unlimited)
  const formatLimit = (limit: number) => {
    return limit === -1 ? "Unlimited" : limit.toString();
  };

  // Handle plan subscription
  const handleSubscribe = async (plan: ApiPlan) => {
    // Free plan → go to signup/login
    if (plan.price === 0) {
      router.push("/auth/login");
      return;
    }

    // Not logged in → go to login first
    if (!isAuthenticated) {
      toast.info("Please log in first", {
        description: "You need to be logged in to subscribe to a plan.",
      });
      router.push("/auth/login");
      return;
    }

    // Already on this plan
    if (currentPlan === plan.name.toLowerCase()) {
      toast.info("You're already on this plan");
      return;
    }

    // Create Stripe checkout session
    const planName = plan.name.toLowerCase() as "basic" | "pro";
    setCheckoutLoading(plan.id);

    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const response = await createCheckoutSessionApi(
        planName,
        `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        `${appUrl}/pricing`
      );

      if (response.success && response.data.url) {
        // Redirect to Stripe Checkout
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

  // Get button label
  const getButtonLabel = (plan: ApiPlan) => {
    if (plan.price === 0) return "Get Started Free";
    if (!isAuthenticated) return "Sign Up to Subscribe";
    if (currentPlan === plan.name.toLowerCase()) return "Current Plan";
    return "Subscribe Now";
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-8 sm:py-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="outline" className="mb-4 sm:mb-6 py-1.5 px-3 sm:px-4 text-xs sm:text-sm">
              Simple Pricing
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 sm:mb-6">
              Plans that scale{" "}
              <span className="text-gradient">with your needs</span>
            </h1>
            <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
              Start free and upgrade when you need more power.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-8 sm:pb-10">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Unable to load plans. Please try again later.</p>
            </div>
          ) : (
              <div className={`grid grid-cols-1 gap-6 sm:gap-8 max-w-4xl mx-auto ${
                plans.length === 2 ? "md:grid-cols-2 max-w-3xl" :
                plans.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2 lg:grid-cols-4"
              }`}>
                {plans.map((plan) => {
                  const recommended = isRecommended(plan);
                  const isCurrent = isAuthenticated && currentPlan === plan.name.toLowerCase();
                  const isLoading = checkoutLoading === plan.id;

                  return (
                    <Card
                      key={plan.id}
                      className={`relative border-border/50 ${
                        recommended
                          ? "border-primary shadow-lg shadow-primary/10 md:scale-105"
                          : ""
                      }`}
                    >
                      {recommended && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <Badge className="bg-primary text-primary-foreground">
                            <Zap className="w-3 h-3 mr-1" />
                            Recommended
                          </Badge>
                        </div>
                      )}

                      <CardHeader className="text-center pb-4">
                        <CardTitle className="text-xl">{plan.displayName}</CardTitle>
                        <CardDescription>
                          {plan.name === "free" && "Perfect for getting started"}
                          {plan.name === "pro" && "For serious investors"}
                          {plan.name === "enterprise" && "For teams and institutions"}
                        </CardDescription>
                        <div className="pt-4">
                          <span className="text-4xl font-bold text-foreground">
                            ₹{plan.price}
                          </span>
                          <span className="text-muted-foreground">/month</span>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {plan.price === 0 ? (
                          <Button
                            className="w-full"
                            variant="outline"
                            asChild
                          >
                            <Link href="/auth/login">
                              Get Started Free
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        ) : (
                          <Button
                            className="w-full"
                            variant={recommended ? "default" : "outline"}
                            onClick={() => handleSubscribe(plan)}
                            disabled={isCurrent || isLoading || !!checkoutLoading}
                          >
                            {isLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            {getButtonLabel(plan)}
                            {!isCurrent && !isLoading && (
                              <ArrowRight className="ml-2 h-4 w-4" />
                            )}
                          </Button>
                        )}

                        <div className="space-y-3 pt-4">
                          {/* Simulations limit */}
                          <div className="flex items-start gap-3 text-sm">
                            <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                            <span className="text-foreground">
                              {formatLimit(plan.maxSimulationsPerMonth)} simulations/month
                            </span>
                          </div>

                          {/* Portfolios limit */}
                          <div className="flex items-start gap-3 text-sm">
                            <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                            <span className="text-foreground">
                              {formatLimit(plan.maxPortfolios)} portfolios
                            </span>
                          </div>

                          {/* Dynamic features from API */}
                          {plan.features.map((feature, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-3 text-sm"
                            >
                              <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                              <span className="text-foreground">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-8 sm:py-10 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
            <Badge variant="secondary" className="mb-3 sm:mb-4">
              FAQ
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              Frequently asked questions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {[
              {
                q: "What is a Monte Carlo simulation?",
                a: "It's a technique that runs thousands of random market scenarios to show you the range of possible outcomes for your portfolio, helping you understand both upside potential and downside risk.",
              },
              {
                q: "What do P10, P50, and P90 mean?",
                a: "These are percentile bands. P10 is the pessimistic scenario (10% of simulations did worse), P50 is the median (typical outcome), and P90 is optimistic (only 10% did better).",
              },
              {
                q: "Can I switch plans later?",
                a: "Yes, you can upgrade anytime. Your simulation history and portfolios are preserved.",
              },
              {
                q: "What happens when I hit my limit?",
                a: "When you reach your monthly simulation limit, you can upgrade to a higher plan for more simulations.",
              },
              {
                q: "What are allocation snapshots?",
                a: "When you run a simulation, we save the exact portfolio allocation used. Even if you later change your portfolio, past simulation results show the original allocation.",
              },
              {
                q: "How do AI recommendations work?",
                a: "When you set a goal and run a simulation, our AI analyzes the results and suggests ways to improve your chances of reaching your target—like adjusting contributions or time horizon.",
              },
            ].map((faq) => (
              <div key={faq.q} className="space-y-2">
                <h3 className="font-semibold text-foreground">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
