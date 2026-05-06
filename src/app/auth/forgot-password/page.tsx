"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Mail, Loader2, CheckCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrustBadges } from "@/components/ui/trust-badges";
import { forgotPasswordApi } from "@/services/auth-service";

/**
 * Forgot Password Form Schema
 */
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/**
 * Forgot Password Page
 *
 * Screen ID: b3497a45f2ba45d8bff29ab8ca10a07f
 *
 * Features:
 * - Email input for password reset
 * - "Send Reset Link" button
 * - Success state with confirmation
 * - Back to login link
 * - Form validation
 *
 * Matches Stitch UI: Simulix Forgot Password
 */
export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  /**
   * Handle form submission
   */
  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);

    try {
      await forgotPasswordApi({ email: data.email });

      // Show success state (always succeeds to prevent email enumeration)
      setSubmittedEmail(data.email);
      setIsSuccess(true);
      toast.success("Reset link sent", {
        description: "Check your email for the password reset link.",
      });
    } catch {
      // Even on error, show success to prevent email enumeration
      setSubmittedEmail(data.email);
      setIsSuccess(true);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Mask email for display
   */
  const maskEmail = (email: string) => {
    const [username, domain] = email.split("@");
    if (!username || !domain) return email;
    const maskedUsername =
      username.length > 3
        ? `${username.slice(0, 2)}${"*".repeat(username.length - 3)}${username.slice(-1)}`
        : username;
    return `${maskedUsername}@${domain}`;
  };

  // Success State
  if (isSuccess) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold font-header text-foreground">Check your email</h1>
          <p className="text-muted-foreground">
            We&apos;ve sent a password reset link to
          </p>
          <p className="font-medium text-foreground">{maskEmail(submittedEmail)}</p>
        </div>

        {/* Instructions Card */}
        <Card className="border-border/50 shadow-lg">
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                Click the link in the email to reset your password. The link will
                expire in <span className="font-medium text-foreground">24 hours</span>.
              </p>
              <p>
                If you don&apos;t see the email, check your spam folder or make
                sure you entered the correct email address.
              </p>
            </div>

            {/* Open Email Button */}
            <Button
              type="button"
              className="w-full h-11"
              onClick={() => window.open("https://mail.google.com", "_blank")}
            >
              <Mail className="mr-2 h-4 w-4" />
              Open Email App
            </Button>

            {/* Resend Link */}
            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsSuccess(false)}
                className="text-primary hover:text-primary/80"
              >
                Didn&apos;t receive the email? Try again
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Back to Login */}
        <div className="text-center">
          <Link
            href="/auth/login"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  // Form State
  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/auth/login"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to login
      </Link>

      {/* Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold font-header text-foreground">Forgot password?</h1>
        <p className="text-muted-foreground">
          No worries, we&apos;ll send you reset instructions.
        </p>
      </div>

      {/* Form Card */}
      <Card className="border-border/50 shadow-lg">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-lg">Reset your password</CardTitle>
          <CardDescription>
            Enter the email associated with your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  className="pl-10 h-11"
                  disabled={isLoading}
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 text-base font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  Send Reset Link
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

    

      {/* Trust Badges */ }
  <TrustBadges className="justify-center" />

  {/* Help Text */ }
  <p className="text-xs text-center text-muted-foreground">
    Remember your password?{" "}
    <Link
      href="/auth/login"
      className="font-medium text-primary hover:underline"
    >
      Sign in
    </Link>
  </p>
    </div >
  );
}
