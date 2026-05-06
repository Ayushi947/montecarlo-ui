"use client";

import { useRouter } from "next/navigation";
import { XCircle, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Checkout Cancel Page
 *
 * User is redirected here when they cancel the Stripe checkout.
 */
export default function CheckoutCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto">
          <XCircle className="h-8 w-8 text-amber-600" />
        </div>

        <h1 className="text-2xl font-bold text-foreground">
          Checkout Cancelled
        </h1>

        <p className="text-muted-foreground">
          No worries! Your subscription was not changed.
          You can upgrade anytime from the pricing page.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" onClick={() => router.push("/pricing")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Pricing
          </Button>
          <Button onClick={() => router.push("/dashboard")} className="gap-2">
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
