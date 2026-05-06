"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  XCircle,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrustBadges } from "@/components/ui/trust-badges";
import { resetPasswordApi } from "@/services/auth-service";

/**
 * Password Requirements
 */
const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  hasUppercase: /[A-Z]/,
  hasLowercase: /[a-z]/,
  hasNumber: /\d/,
  hasSpecial: /[!@#$%^&*(),.?":{}|<>]/,
};

/**
 * Reset Password Form Schema
 */
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/\d/, "Password must contain at least one number")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

/**
 * Password Requirement Item
 */
function PasswordRequirement({
  met,
  label,
}: {
  met: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {met ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : (
        <XCircle className="h-4 w-4 text-muted-foreground" />
      )}
      <span className={met ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
        {label}
      </span>
    </div>
  );
}

/**
 * Loading Skeleton for Reset Password Page
 */
function ResetPasswordSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-4 w-24 bg-muted rounded" />
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-muted rounded-full" />
        <div className="h-8 w-48 mx-auto bg-muted rounded" />
        <div className="h-4 w-64 mx-auto bg-muted rounded" />
      </div>
      <Card className="border-border/50 shadow-lg">
        <CardHeader className="space-y-1 pb-4">
          <div className="h-6 w-40 bg-muted rounded" />
          <div className="h-4 w-56 bg-muted rounded" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-11 bg-muted rounded" />
          <div className="h-11 bg-muted rounded" />
          <div className="h-11 bg-muted rounded" />
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Reset Password Form Component
 * Separated to use useSearchParams within Suspense boundary
 */
function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
  });

  const password = watch("password", "");

  /**
   * Password strength calculations
   */
  const passwordStrength = useMemo(() => {
    const checks = {
      minLength: password.length >= PASSWORD_REQUIREMENTS.minLength,
      hasUppercase: PASSWORD_REQUIREMENTS.hasUppercase.test(password),
      hasLowercase: PASSWORD_REQUIREMENTS.hasLowercase.test(password),
      hasNumber: PASSWORD_REQUIREMENTS.hasNumber.test(password),
      hasSpecial: PASSWORD_REQUIREMENTS.hasSpecial.test(password),
    };

    const score = Object.values(checks).filter(Boolean).length;
    const percentage = (score / 5) * 100;

    let label = "Weak";
    let color = "bg-red-500";

    if (score >= 5) {
      label = "Strong";
      color = "bg-green-500";
    } else if (score >= 3) {
      label = "Medium";
      color = "bg-yellow-500";
    }

    return { checks, score, percentage, label, color };
  }, [password]);

  /**
   * Validate token on mount
   */
  useEffect(() => {
    if (!token) {
      setTokenError("Invalid or missing reset token. Please request a new password reset link.");
    }
  }, [token]);

  /**
   * Handle form submission
   */
  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token || tokenError) return;

    setIsLoading(true);

    try {
      await resetPasswordApi({ token, password: data.password });

      setIsSuccess(true);
      toast.success("Password reset!", {
        description: "Your password has been successfully reset. Redirecting to login...",
      });

      // Redirect to login after delay
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const msg = err?.response?.data?.message || "Failed to reset password. The link may have expired.";
      setTokenError(msg);
      toast.error("Reset failed", { description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  // Token Error State
  if (tokenError) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold font-header text-foreground">Link Expired</h1>
          <p className="text-muted-foreground">{tokenError}</p>
        </div>

        {/* Action Card */}
        <Card className="border-border/50 shadow-lg">
          <CardContent className="pt-6 space-y-4">
            <Button
              type="button"
              className="w-full h-11"
              onClick={() => router.push("/auth/forgot-password")}
            >
              Request New Reset Link
            </Button>

            <div className="text-center">
              <Link
                href="/auth/login"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success State
  if (isSuccess) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold font-header text-foreground">Password Reset!</h1>
          <p className="text-muted-foreground">
            Your password has been successfully reset.
          </p>
        </div>

        {/* Success Card */}
        <Card className="border-border/50 shadow-lg">
          <CardContent className="pt-6 space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              You will be redirected to the login page in a few seconds...
            </p>

            <Button
              type="button"
              className="w-full h-11"
              onClick={() => router.push("/auth/login")}
            >
              Continue to Login
            </Button>
          </CardContent>
        </Card>
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
          <ShieldCheck className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold font-header text-foreground">Create new password</h1>
        <p className="text-muted-foreground">
          Your new password must be different from previously used passwords.
        </p>
      </div>

      {/* Form Card */}
      <Card className="border-border/50 shadow-lg">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-lg">Reset your password</CardTitle>
          <CardDescription>
            Choose a strong password to protect your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* New Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  className="pl-10 pr-10 h-11"
                  disabled={isLoading}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div className="space-y-3">
                {/* Strength Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Password strength</span>
                    <span
                      className={`font-medium ${passwordStrength.label === "Strong"
                        ? "text-green-600"
                        : passwordStrength.label === "Medium"
                          ? "text-yellow-600"
                          : "text-red-600"
                        }`}
                    >
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${passwordStrength.percentage}%` }}
                    />
                  </div>
                </div>

                {/* Requirements Checklist */}
                <div className="grid grid-cols-2 gap-2">
                  <PasswordRequirement
                    met={passwordStrength.checks.minLength}
                    label="8+ characters"
                  />
                  <PasswordRequirement
                    met={passwordStrength.checks.hasUppercase}
                    label="Uppercase letter"
                  />
                  <PasswordRequirement
                    met={passwordStrength.checks.hasLowercase}
                    label="Lowercase letter"
                  />
                  <PasswordRequirement
                    met={passwordStrength.checks.hasNumber}
                    label="Number"
                  />
                  <PasswordRequirement
                    met={passwordStrength.checks.hasSpecial}
                    label="Special character"
                  />
                </div>
              </div>
            )}

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  className="pl-10 pr-10 h-11"
                  disabled={isLoading}
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 text-base font-medium"
              disabled={isLoading || passwordStrength.score < 5}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

    

      {/* Trust Badges */ }
  <TrustBadges className="justify-center" />

  {/* Security Note */ }
  <p className="text-xs text-center text-muted-foreground">
    Your password is encrypted and stored securely. We never store
    plain-text passwords.
  </p>
    </div >
  );
}

/**
 * Reset Password Page
 *
 * Screen ID: 6810cf12cd7a4f01ad49fa01c0b3d4ec
 *
 * Features:
 * - New password input with visibility toggle
 * - Confirm password input
 * - Real-time password strength indicator
 * - Token validation from URL params
 * - Success state with redirect
 *
 * Matches Stitch UI: Simulix Reset Password
 */
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordSkeleton />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
