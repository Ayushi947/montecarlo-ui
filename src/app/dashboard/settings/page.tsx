"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  User,
  Mail,
  Phone,
  CreditCard,
  Zap,
  Sun,
  Moon,
  Monitor,
  Lock,
  Eye,
  EyeOff,
  Trash2,
  Save,
  CheckCircle2,
  AlertTriangle,
  Crown,
  Loader2,
  ShieldAlert,
  Sparkles,
  Receipt,
  Download,
  ExternalLink,
  Clock,
  XCircle,
} from "lucide-react";

import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuthStore } from "@/stores/auth-store";
import {
  updateProfileApi,
  changePasswordApi,
  deleteAccountApi,
  sendVerificationApi,
} from "@/services/auth-service";
import { getUsageApi, createPortalSessionApi, getCurrentSubscriptionApi, getInvoicesApi, cancelSubscriptionApi, resumeSubscriptionApi } from "@/services/subscription-service";
import type { ApiInvoice } from "@/types";
import { UpgradeModal } from "@/components/dashboard/upgrade-modal";

/**
 * Plan details mapping
 */
const PLAN_DETAILS: Record<
  string,
  { name: string; price: string; color: string; icon: React.ReactNode }
> = {
  free: {
    name: "Free Plan",
    price: "$0/month",
    color: "text-muted-foreground",
    icon: <Zap className="h-4 w-4" />,
  },
  basic: {
    name: "Simulix Basic",
    price: "$49/month",
    color: "text-blue-600",
    icon: <Zap className="h-4 w-4" />,
  },
  pro: {
    name: "Simulix Pro",
    price: "$249/month",
    color: "text-purple-600",
    icon: <Crown className="h-4 w-4" />,
  },
};

/**
 * User Settings Page
 *
 * Sections:
 * - Profile Management: name, email (read-only), phone, email verification banner
 * - Subscription Overview: plan, usage, billing
 * - Theme Preferences: Light/Dark/System
 * - Change Password
 * - Delete Account (with password confirmation dialog)
 */
export default function SettingsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const logout = useAuthStore((s) => s.logout);
  const { theme, setTheme } = useTheme();

  // Subscription state
  const [subscriptionLoading, setSubscriptionLoading] = React.useState(true);
  const [usage, setUsage] = React.useState<{ simulationsUsed: number; simulationsLimit: number } | null>(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = React.useState(false);
  const [hasStripeSubscription, setHasStripeSubscription] = React.useState(false);
  const [portalLoading, setPortalLoading] = React.useState(false);

  // Invoice / billing history state
  const [invoices, setInvoices] = React.useState<ApiInvoice[]>([]);
  const [invoicesLoading, setInvoicesLoading] = React.useState(true);

  // Cancel subscription state
  const [cancelPending, setCancelPending] = React.useState(false); // cancel_at_period_end = true
  const [cancelLoading, setCancelLoading] = React.useState(false);
  const [periodEnd, setPeriodEnd] = React.useState<string | null>(null);

  // Profile form state
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [profileSaving, setProfileSaving] = React.useState(false);
  const [profileSaved, setProfileSaved] = React.useState(false);

  // Change password state
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmNewPassword, setConfirmNewPassword] = React.useState("");
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [passwordChanging, setPasswordChanging] = React.useState(false);

  // Delete account state
  const [deletePassword, setDeletePassword] = React.useState("");
  const [deleting, setDeleting] = React.useState(false);

  // Verification state
  const [sendingVerification, setSendingVerification] = React.useState(false);

  // Initialize form from user
  React.useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? "");
      setLastName(user.lastName ?? "");
      setPhoneNumber(user.phoneNumber ?? "");
    }
  }, [user]);

  // Fetch usage data, subscription status, and invoices on mount
  React.useEffect(() => {
    Promise.all([
      getUsageApi(),
      getCurrentSubscriptionApi().catch(() => null),
    ])
      .then(([usageResponse, subResponse]) => {
        if (usageResponse.success && usageResponse.data) {
          setUsage({
            simulationsUsed: usageResponse.data.simulationsRun ?? 0,
            simulationsLimit: usageResponse.data.maxSimulations ?? 5,
          });
        }
        // Check if the user has a Stripe-linked subscription (stripeCustomerId exists)
        if (subResponse?.success && subResponse.data) {
          const sub = subResponse.data as {
            stripeCustomerId?: string | null;
            autoRenew?: boolean;
            endDate?: string;
          };
          const hasStripe = !!sub.stripeCustomerId;

          // Detect if subscription is scheduled for cancellation
          if (hasStripe && sub.autoRenew === false) {
            setCancelPending(true);
            if (sub.endDate) {
              setPeriodEnd(new Date(sub.endDate).toLocaleDateString("en-US", {
                month: "long", day: "numeric", year: "numeric",
              }));
            }
          }
          setHasStripeSubscription(hasStripe);

          // Fetch invoices only if user has a Stripe subscription
          if (hasStripe) {
            getInvoicesApi(20)
              .then((invoiceRes) => {
                if (invoiceRes.success && invoiceRes.data?.invoices) {
                  setInvoices(invoiceRes.data.invoices);
                }
              })
              .catch(() => {
                // Silently fail — invoices are non-critical
              })
              .finally(() => setInvoicesLoading(false));
          } else {
            setInvoicesLoading(false);
          }
        } else {
          setInvoicesLoading(false);
        }
      })
      .finally(() => setSubscriptionLoading(false));
  }, []);

  const currentPlan = user?.plan ?? "free";
  // Use API usage data if available, otherwise fallback to auth store
  const simulationsUsed = usage?.simulationsUsed ?? user?.simulationsUsed ?? 0;
  const simulationsLimit = usage?.simulationsLimit ?? user?.simulationsLimit ?? 2;

  const planInfo = PLAN_DETAILS[currentPlan] ?? PLAN_DETAILS.free;
  // -1 means unlimited (Pro plan)
  const isUnlimited = simulationsLimit === -1;
  const usagePercent = isUnlimited ? 0 : Math.min(
    (simulationsUsed / simulationsLimit) * 100,
    100
  );

  // Password validation
  const passwordValid =
    newPassword.length >= 8 &&
    /[A-Z]/.test(newPassword) &&
    /\d/.test(newPassword) &&
    /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const passwordsMatch = newPassword === confirmNewPassword && confirmNewPassword.length > 0;

  // Save profile
  const handleSaveProfile = async () => {
    setProfileSaving(true);
    try {
      const response = await updateProfileApi({
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        phoneNumber: phoneNumber || undefined,
      });

      if (response.success) {
        updateUser({
          firstName: response.data.firstName ?? "",
          lastName: response.data.lastName ?? "",
          phoneNumber: response.data.phoneNumber ?? undefined,
        });
        setProfileSaved(true);
        toast.success("Profile updated", {
          description: "Your changes have been saved.",
        });
        setTimeout(() => setProfileSaved(false), 2000);
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error("Failed to save profile", {
        description: err?.response?.data?.message || "Please try again.",
      });
    } finally {
      setProfileSaving(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    if (!passwordValid || !passwordsMatch) return;

    setPasswordChanging(true);
    try {
      await changePasswordApi({
        currentPassword,
        newPassword,
      });

      toast.success("Password changed", {
        description: "Your password has been updated successfully.",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error("Failed to change password", {
        description: err?.response?.data?.message || "Please check your current password.",
      });
    } finally {
      setPasswordChanging(false);
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (!deletePassword) return;

    setDeleting(true);
    try {
      await deleteAccountApi({ password: deletePassword });

      logout();
      toast.success("Account deleted", {
        description: "Your account has been permanently deleted.",
      });
      router.push("/");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error("Failed to delete account", {
        description: err?.response?.data?.message || "Please check your password.",
      });
    } finally {
      setDeleting(false);
      setDeletePassword("");
    }
  };

  // Send verification email
  const handleSendVerification = async () => {
    setSendingVerification(true);
    try {
      await sendVerificationApi();
      toast.success("Verification email sent", {
        description: "Check your inbox for the verification link.",
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error("Failed to send verification", {
        description: err?.response?.data?.message || "Please try again.",
      });
    } finally {
      setSendingVerification(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account, preferences, and subscription
        </p>
      </div>

      {/* ─── Email Verification Banner ─── */}
      {user && !user.emailVerified && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Email not verified
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Please verify your email address to secure your account.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSendVerification}
            disabled={sendingVerification}
            className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/40"
          >
            {sendingVerification ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            ) : (
              <Mail className="h-4 w-4 mr-1" />
            )}
            {sendingVerification ? "Sending..." : "Verify Email"}
          </Button>
        </div>
      )}

      {/* ─── Profile Section ─── */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold text-foreground mb-5 flex items-center gap-2">
          <User className="h-4.5 w-4.5 text-muted-foreground" />
          Profile
        </h2>

        {/* Avatar (initials-only, no upload) */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
            {firstName ? firstName[0]?.toUpperCase() : "U"}
            {lastName ? lastName[0]?.toUpperCase() : ""}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {firstName || lastName
                ? `${firstName} ${lastName}`.trim()
                : "User"}
            </p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">
              First Name
            </label>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="John"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">
              Last Name
            </label>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Doe"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">
              <Mail className="h-3 w-3 inline mr-1" />
              Email Address
            </label>
            <Input
              type="email"
              value={user?.email ?? ""}
              disabled
              className="bg-muted/50 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">
              <Phone className="h-3 w-3 inline mr-1" />
              Phone Number
            </label>
            <Input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>

        <Button
          onClick={handleSaveProfile}
          disabled={profileSaving}
          className="gap-2"
          size="sm"
        >
          {profileSaved ? (
            <CheckCircle2 className="h-4 w-4 text-green-300" />
          ) : profileSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {profileSaving
            ? "Saving…"
            : profileSaved
            ? "Saved"
            : "Save Changes"}
        </Button>
      </section>

      {/* ─── Subscription Section ─── */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold text-foreground mb-5 flex items-center gap-2">
          <CreditCard className="h-4.5 w-4.5 text-muted-foreground" />
          Subscription
        </h2>

        {/* Current Plan */}
        <div className="flex items-center justify-between mb-4 p-4 rounded-lg bg-muted/30 border border-border">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                currentPlan === "pro"
                  ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600"
                  : currentPlan === "basic"
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {planInfo.icon}
            </div>
            <div>
              <p className={cn("text-sm font-semibold", planInfo.color)}>
                {planInfo.name}
              </p>
              <p className="text-xs text-muted-foreground">{planInfo.price}</p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "text-xs",
              currentPlan === "free"
                ? "text-amber-600 border-amber-200"
                : cancelPending
                ? "text-amber-600 border-amber-200"
                : "text-green-600 border-green-200"
            )}
          >
            {currentPlan === "free" ? "Free" : cancelPending ? "Cancelling" : "Active"}
          </Badge>
        </div>

        {/* Usage Meter */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Simulation Usage
            </span>
            <span className="text-xs font-mono text-foreground">
              {isUnlimited ? `${simulationsUsed} (Unlimited)` : `${simulationsUsed} / ${simulationsLimit}`}
            </span>
          </div>
          {!isUnlimited && (
            <Progress
              value={usagePercent}
              className="h-2"
            />
          )}
          <p className="text-[10px] text-muted-foreground mt-1">
            {isUnlimited
              ? "Unlimited simulations on your plan"
              : `${simulationsLimit - simulationsUsed} simulations remaining this billing cycle`}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => setUpgradeModalOpen(true)} className="gap-2 text-xs">
            <Sparkles className="h-3.5 w-3.5" />
            {currentPlan === "free" ? "Upgrade Plan" : "Change Plan"}
          </Button>
          {hasStripeSubscription && (
            <Button
              size="sm"
              variant="outline"
              className="gap-2 text-xs"
              disabled={portalLoading}
              onClick={async () => {
                setPortalLoading(true);
                try {
                  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
                  const response = await createPortalSessionApi(`${appUrl}/dashboard/settings`);
                  if (response.success && response.data.url) {
                    window.location.href = response.data.url;
                  }
                } catch (error: unknown) {
                  const err = error as { response?: { data?: { message?: string } } };
                  toast.error("Failed to open billing portal", {
                    description: err?.response?.data?.message || "Please try again.",
                  });
                } finally {
                  setPortalLoading(false);
                }
              }}
            >
              {portalLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CreditCard className="h-3.5 w-3.5" />
              )}
              Manage Subscription
            </Button>
          )}
          {hasStripeSubscription && currentPlan !== "free" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                {cancelPending ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2 text-xs text-green-600 border-green-200 hover:bg-green-50 dark:hover:bg-green-900/20"
                    disabled={cancelLoading}
                  >
                    {cancelLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    )}
                    Resume Subscription
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                    disabled={cancelLoading}
                  >
                    {cancelLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5" />
                    )}
                    Cancel Subscription
                  </Button>
                )}
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {cancelPending ? "Resume your subscription?" : "Cancel your subscription?"}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {cancelPending
                      ? "Your subscription is scheduled to end. Resuming will continue your plan and billing as normal."
                      : "Your subscription will remain active until the end of your current billing period. After that, you'll be downgraded to the free plan. You can resume anytime before the period ends."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Current</AlertDialogCancel>
                  <AlertDialogAction
                    disabled={cancelLoading}
                    className={cancelPending ? "" : "bg-destructive text-destructive-foreground hover:bg-destructive/90"}
                    onClick={async () => {
                      setCancelLoading(true);
                      try {
                        if (cancelPending) {
                          const res = await resumeSubscriptionApi();
                          if (res.success) {
                            setCancelPending(false);
                            setPeriodEnd(null);
                            toast.success("Subscription resumed", {
                              description: "Your subscription will continue as normal.",
                            });
                          }
                        } else {
                          const res = await cancelSubscriptionApi();
                          if (res.success) {
                            setCancelPending(true);
                            const endDate = new Date(res.data.currentPeriodEnd * 1000);
                            setPeriodEnd(endDate.toLocaleDateString("en-US", {
                              month: "long", day: "numeric", year: "numeric",
                            }));
                            toast.success("Subscription cancelled", {
                              description: `You'll have access until ${endDate.toLocaleDateString()}.`,
                            });
                          }
                        }
                      } catch (error: unknown) {
                        const err = error as { response?: { data?: { message?: string } } };
                        toast.error(cancelPending ? "Failed to resume" : "Failed to cancel", {
                          description: err?.response?.data?.message || "Please try again.",
                        });
                      } finally {
                        setCancelLoading(false);
                      }
                    }}
                  >
                    {cancelLoading && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                    {cancelPending ? "Yes, Resume" : "Yes, Cancel"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {/* Cancellation Notice */}
        {cancelPending && periodEnd && (
          <div className="mt-4 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-3 flex items-center gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <p className="text-xs text-amber-800 dark:text-amber-200">
              Your subscription is set to cancel on <strong>{periodEnd}</strong>. You&apos;ll keep access until then.
            </p>
          </div>
        )}
      </section>

      {/* ─── Billing History Section ─── */}
      {hasStripeSubscription && (
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-base font-semibold text-foreground mb-5 flex items-center gap-2">
            <Receipt className="h-4.5 w-4.5 text-muted-foreground" />
            Billing History
          </h2>

          {invoicesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg border border-border animate-pulse"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-muted" />
                    <div className="space-y-1.5">
                      <div className="w-32 h-3.5 rounded bg-muted" />
                      <div className="w-20 h-3 rounded bg-muted" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-5 rounded-full bg-muted" />
                    <div className="w-14 h-3.5 rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No invoices yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Your payment history will appear here after your first billing cycle.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {invoices.map((invoice) => {
                const date = new Date(invoice.created * 1000);
                const formattedDate = date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });

                // Amount in smallest unit (cents/paise) → display
                const amount = (invoice.amountPaid / 100).toFixed(2);
                const currencySymbol = invoice.currency === "inr" ? "₹" : "$";

                // Status badge styling
                const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
                  paid: {
                    label: "Paid",
                    className: "text-green-600 border-green-200 bg-green-50 dark:bg-green-900/20",
                    icon: <CheckCircle2 className="h-3 w-3" />,
                  },
                  open: {
                    label: "Pending",
                    className: "text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-900/20",
                    icon: <Clock className="h-3 w-3" />,
                  },
                  uncollectible: {
                    label: "Failed",
                    className: "text-red-600 border-red-200 bg-red-50 dark:bg-red-900/20",
                    icon: <XCircle className="h-3 w-3" />,
                  },
                  void: {
                    label: "Void",
                    className: "text-muted-foreground border-border",
                    icon: <XCircle className="h-3 w-3" />,
                  },
                  draft: {
                    label: "Draft",
                    className: "text-muted-foreground border-border",
                    icon: <Clock className="h-3 w-3" />,
                  },
                };

                const status = statusConfig[invoice.status || ""] || {
                  label: invoice.status || "Unknown",
                  className: "text-muted-foreground border-border",
                  icon: <Clock className="h-3 w-3" />,
                };

                return (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/30 transition-colors"
                  >
                    {/* Left: Icon + Details */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                        invoice.status === "paid"
                          ? "bg-green-50 dark:bg-green-900/20 text-green-600"
                          : "bg-muted text-muted-foreground"
                      )}>
                        <Receipt className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {invoice.planName || `Invoice ${invoice.number || invoice.id.slice(-8)}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formattedDate}
                          {invoice.number && (
                            <span className="ml-2 font-mono text-[10px]">#{invoice.number}</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Right: Status + Amount + Actions */}
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge
                        variant="outline"
                        className={cn("text-[10px] gap-1 px-2", status.className)}
                      >
                        {status.icon}
                        {status.label}
                      </Badge>
                      <span className="text-sm font-semibold text-foreground tabular-nums w-20 text-right">
                        {currencySymbol}{amount}
                      </span>
                      <div className="flex items-center gap-1">
                        {invoice.invoicePdfUrl && (
                          <a
                            href={invoice.invoicePdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                            title="Download PDF"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {invoice.hostedInvoiceUrl && (
                          <a
                            href={invoice.hostedInvoiceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                            title="View on Stripe"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ─── Theme Section ─── */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold text-foreground mb-5 flex items-center gap-2">
          <Sun className="h-4.5 w-4.5 text-muted-foreground" />
          Theme
        </h2>

        <div className="grid grid-cols-3 gap-3">
          {[
            { key: "light", label: "Light", icon: Sun, desc: "Bright interface" },
            { key: "dark", label: "Dark", icon: Moon, desc: "Easy on the eyes" },
            { key: "system", label: "System", icon: Monitor, desc: "Match OS setting" },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => setTheme(opt.key)}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                theme === opt.key
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/30 hover:bg-muted/30"
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  theme === opt.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <opt.icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-foreground">
                {opt.label}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {opt.desc}
              </span>
              {theme === opt.key && (
                <CheckCircle2 className="h-4 w-4 text-primary" />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* ─── Change Password Section ─── */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold text-foreground mb-5 flex items-center gap-2">
          <Lock className="h-4.5 w-4.5 text-muted-foreground" />
          Change Password
        </h2>

        <div className="space-y-4 max-w-md">
          {/* Current Password */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">
              Current Password
            </label>
            <div className="relative">
              <Input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">
              New Password
            </label>
            <div className="relative">
              <Input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 chars, uppercase, number, special"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {newPassword && !passwordValid && (
              <p className="text-xs text-muted-foreground mt-1">
                Must be 8+ chars with uppercase, number, and special character
              </p>
            )}
            {newPassword && passwordValid && (
              <p className="text-xs text-green-600 mt-1">
                Password meets requirements
              </p>
            )}
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">
              Confirm New Password
            </label>
            <Input
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="Re-enter new password"
            />
            {confirmNewPassword && !passwordsMatch && (
              <p className="text-xs text-destructive mt-1">
                Passwords do not match
              </p>
            )}
          </div>

          <Button
            onClick={handleChangePassword}
            disabled={!currentPassword || !passwordValid || !passwordsMatch || passwordChanging}
            className="gap-2"
            size="sm"
          >
            {passwordChanging ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Lock className="h-4 w-4" />
            )}
            {passwordChanging ? "Changing…" : "Change Password"}
          </Button>
        </div>
      </section>

      {/* ─── Delete Account ─── */}
      <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
        <h2 className="text-base font-semibold text-destructive mb-2 flex items-center gap-2">
          <AlertTriangle className="h-4.5 w-4.5" />
          Danger Zone
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          Permanently delete your account and all associated data. This action
          cannot be undone.
        </p>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete your account?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete your account, portfolios, simulations, and all associated data. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-2">
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                Enter your password to confirm
              </label>
              <Input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeletePassword("")}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                disabled={!deletePassword || deleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-1" />
                )}
                {deleting ? "Deleting…" : "Delete Account"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>

      {/* Upgrade Modal */}
      <UpgradeModal open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen} />
    </div>
  );
}
