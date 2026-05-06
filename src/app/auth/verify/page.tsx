"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { verifyEmailApi } from "@/services/auth-service";

type VerifyState = "verifying" | "success" | "error";

/**
 * Email Verification Content
 * Separated to use useSearchParams within Suspense boundary
 */
function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [state, setState] = useState<VerifyState>("verifying");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setState("error");
      setErrorMessage("Missing verification token. Please check your email link.");
      return;
    }

    verifyEmailApi({ token })
      .then(() => {
        setState("success");
      })
      .catch((error: unknown) => {
        const err = error as { response?: { data?: { message?: string } } };
        setState("error");
        setErrorMessage(
          err?.response?.data?.message || "Verification failed. The link may have expired."
        );
      });
  }, [token]);

  if (state === "verifying") {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
          <h1 className="text-2xl font-bold font-header text-foreground">Verifying your email...</h1>
          <p className="text-muted-foreground">
            Please wait while we verify your email address.
          </p>
        </div>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold font-header text-foreground">Email Verified!</h1>
          <p className="text-muted-foreground">
            Your email has been successfully verified.
          </p>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardContent className="pt-6 space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              You can now enjoy all features of your account.
            </p>
            <Link href="/dashboard" className="block">
              <Button className="w-full h-11">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
          <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-2xl font-bold font-header text-foreground">Verification Failed</h1>
        <p className="text-muted-foreground">{errorMessage}</p>
      </div>

      <Card className="border-border/50 shadow-lg">
        <CardContent className="pt-6 space-y-4">
          <Link href="/auth/login" className="block">
            <Button className="w-full h-11">
              Back to Login
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Email Verification Page
 *
 * Extracts token from URL → calls verifyEmailApi → shows verifying/success/error states.
 */
export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full animate-pulse" />
            <div className="h-8 w-48 mx-auto bg-muted rounded animate-pulse" />
            <div className="h-4 w-64 mx-auto bg-muted rounded animate-pulse" />
          </div>
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
