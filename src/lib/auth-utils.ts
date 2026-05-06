import type { ApiUser, ApiSubscription, PlanTier } from "@/types";

/**
 * Auth Utilities
 *
 * Maps backend API shapes to the frontend User interface used by the auth store.
 * Single source of truth for backend ↔ frontend user translation.
 */

/** Valid plan names from the backend */
const VALID_PLANS: PlanTier[] = ["free", "basic", "pro"];

/**
 * Map backend API user + subscription → frontend User shape
 *
 * @param apiUser       - User object from signup/login/me response
 * @param subscription  - Optional subscription from GET /auth/me
 */
export function mapApiUserToUser(
  apiUser: ApiUser,
  subscription?: ApiSubscription | null,
  extra?: { phoneNumber?: string | null; emailVerified?: boolean }
) {
  const planName = subscription?.plan?.name ?? "free";
  const plan: PlanTier = VALID_PLANS.includes(planName as PlanTier)
    ? (planName as PlanTier)
    : "free";

  return {
    id: apiUser.id,
    email: apiUser.email,
    firstName: apiUser.firstName ?? "",
    lastName: apiUser.lastName ?? "",
    phoneNumber: extra?.phoneNumber ?? undefined,
    emailVerified: extra?.emailVerified ?? false,
    plan,
    simulationsUsed: 0,
    simulationsLimit: subscription?.plan?.maxSimulationsPerMonth ?? 2,
    portfoliosLimit: subscription?.plan?.maxPortfolios ?? 3,
  };
}

/**
 * Get display name from firstName + lastName
 * Falls back to "User" if both are empty.
 */
export function getDisplayName(firstName?: string, lastName?: string): string {
  const full = [firstName, lastName].filter(Boolean).join(" ");
  return full || "User";
}

/**
 * Get avatar initials from firstName + lastName
 * E.g., "John Doe" → "JD", "Alice" → "A"
 */
export function getInitials(firstName?: string, lastName?: string): string {
  const first = firstName?.[0]?.toUpperCase() ?? "";
  const last = lastName?.[0]?.toUpperCase() ?? "";
  return first + last || "U";
}

/**
 * Get human-readable plan label
 */
export function getPlanLabel(plan?: string): string {
  switch (plan) {
    case "free":
      return "Free";
    case "basic":
      return "Basic";
    case "pro":
      return "Pro";
    default:
      return "Free";
  }
}
