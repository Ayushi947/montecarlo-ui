"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Sparkles, ArrowRight, Rocket } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrustBadges } from "@/components/ui/trust-badges";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Success Splash Page
 *
 * Screen ID: success-splash
 *
 * Features:
 * - Animated success checkmark
 * - Personalized welcome message with user's firstName
 * - Auto-redirect countdown with progress bar
 * - "Continue to Dashboard" button
 * - Confetti-like particle animation
 * - Auth guard: redirects to login if not authenticated
 *
 * Matches Stitch UI: Simulix Success Splash
 */
export default function SuccessPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [countdown, setCountdown] = useState(5);
  const [progress, setProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  /**
   * Auth guard: redirect to login if not authenticated
   */
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [isAuthenticated, router]);

  /**
   * Navigate to dashboard
   */
  const goToDashboard = useCallback(() => {
    router.push("/dashboard");
  }, [router]);

  /**
   * Countdown timer with progress
   */
  useEffect(() => {
    if (!isAuthenticated) return;

    // Start animation
    const animationTimeout = setTimeout(() => {
      setIsAnimating(false);
    }, 1000);

    // Countdown interval
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          goToDashboard();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2; // 50 steps over 5 seconds
      });
    }, 100);

    return () => {
      clearTimeout(animationTimeout);
      clearInterval(countdownInterval);
      clearInterval(progressInterval);
    };
  }, [goToDashboard, isAuthenticated]);

  // Don't render until auth check passes
  if (!isAuthenticated) return null;

  const welcomeName = user?.firstName || "there";

  return (
    <div className="space-y-6">
      {/* Success Animation */}
      <div className="relative">
        {/* Decorative particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 rounded-full animate-ping`}
              style={{
                left: `${10 + (i % 4) * 25}%`,
                top: `${15 + Math.floor(i / 4) * 30}%`,
                animationDelay: `${i * 0.15}s`,
                animationDuration: "2s",
                backgroundColor:
                  i % 3 === 0
                    ? "rgb(34, 197, 94)"
                    : i % 3 === 1
                      ? "rgb(59, 130, 246)"
                      : "rgb(168, 85, 247)",
                opacity: 0.6,
              }}
            />
          ))}
        </div>

        {/* Main success icon */}
        <div className="text-center space-y-4">
          <div
            className={`mx-auto w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center transition-all duration-500 ${isAnimating ? "scale-0" : "scale-100"
              }`}
          >
            <div
              className={`w-20 h-20 bg-green-500 rounded-full flex items-center justify-center transition-all duration-300 delay-200 ${isAnimating ? "scale-0" : "scale-100"
                }`}
            >
              <CheckCircle
                className={`h-12 w-12 text-white transition-all duration-300 delay-300 ${isAnimating ? "scale-0 rotate-180" : "scale-100 rotate-0"
                  }`}
              />
            </div>
          </div>

          {/* Sparkle icon */}
          <Sparkles
            className={`mx-auto h-6 w-6 text-yellow-500 transition-all duration-500 delay-500 ${isAnimating ? "opacity-0 scale-0" : "opacity-100 scale-100"
              }`}
          />
        </div>
      </div>

      {/* Welcome Message */}
      <div
        className={`text-center space-y-2 transition-all duration-500 delay-300 ${isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
          }`}
      >
        <h1 className="text-2xl font-bold font-header text-foreground">
          Welcome, {welcomeName}! 🎉
        </h1>
        <p className="text-lg text-muted-foreground">
          Your account has been successfully created.
        </p>
      </div>

      {/* Info Card */}
      <Card
        className={`border-border/50 shadow-lg transition-all duration-500 delay-500 ${isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
          }`}
      >
        <CardContent className="pt-6 space-y-6">
          {/* Features List */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">
              Here&apos;s what you can do now:
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Build custom investment portfolios
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Run Monte Carlo simulations with 10,000+ scenarios
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Analyze risk-return distributions
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Compare strategy projections
              </li>
            </ul>
          </div>

          {/* Auto-redirect Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Redirecting to dashboard...
              </span>
              <span className="font-mono font-medium text-foreground">
                {countdown}s
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Continue Button */}
          <Button
            type="button"
            className="w-full h-12 text-base font-medium"
            onClick={goToDashboard}
          >
            <Rocket className="mr-2 h-5 w-5" />
            Continue to Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Trial Notice */}
      <div
        className={`text-center space-y-1 transition-all duration-500 delay-700 ${isAnimating ? "opacity-0" : "opacity-100"
          }`}
      >
        <p className="text-sm text-muted-foreground">
          You&apos;re starting with a{" "}
          <span className="font-medium text-primary">free plan</span>
        </p>
        <p className="text-xs text-muted-foreground">
          Upgrade anytime for more simulations and features
        </p>
      </div>

      <TrustBadges className="justify-center" />
    </div>

  );
}
