"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getCurrentSubscriptionApi } from "@/services/subscription-service";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Inner component that uses useSearchParams (requires Suspense boundary)
 */
function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const updateUser = useAuthStore((s) => s.updateUser);
  const [planName, setPlanName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(5);

  // Fetch updated subscription after checkout
  useEffect(() => {
    let retries = 0;
    const maxRetries = 5;

    const fetchSubscription = async () => {
      try {
        const response = await getCurrentSubscriptionApi();
        if (response.success && response.data?.plan) {
          const plan = response.data.plan;
          setPlanName(plan.displayName);
          updateUser({
            plan: plan.name as "free" | "basic" | "pro",
            simulationsLimit: plan.maxSimulationsPerMonth,
          });
          setLoading(false);
        }
      } catch {
        // Webhook may not have processed yet — retry
        retries++;
        if (retries < maxRetries) {
          setTimeout(fetchSubscription, 2000);
        } else {
          setLoading(false);
          setPlanName("your new plan");
        }
      }
    };

    fetchSubscription();
  }, [updateUser]);

  // Auto-redirect countdown
  useEffect(() => {
    if (loading) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          router.push("/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-4 text-center space-y-6">
        {loading ? (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">
              Processing your subscription...
            </h1>
            <p className="text-muted-foreground">
              Please wait while we confirm your payment.
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>

            <h1 className="text-2xl font-bold text-foreground">
              Subscription Activated!
            </h1>

            <p className="text-muted-foreground">
              You&apos;re now subscribed to <strong className="text-foreground">{planName}</strong>.
              Your upgraded limits are active immediately.
            </p>

            {sessionId && (
              <p className="text-xs text-muted-foreground font-mono">
                Session: {sessionId.slice(0, 20)}...
              </p>
            )}

            <Button onClick={() => router.push("/dashboard")} className="gap-2">
              Go to Dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>

            <p className="text-xs text-muted-foreground">
              Redirecting in {countdown} seconds...
            </p>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Checkout Success Page
 *
 * User is redirected here after completing Stripe checkout.
 * Wrapped in Suspense because useSearchParams requires it in Next.js 16+.
 */
export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
