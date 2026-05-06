import { apiClient, API_ENDPOINTS } from "@/config/api";
import type {
  PlanListResponse,
  CurrentSubscriptionResponse,
  UsageResponse,
  CheckoutSessionResponse,
  PortalSessionResponse,
  InvoiceListResponse,
  CancelSubscriptionResponse,
} from "@/types";

/**
 * Subscription Service
 *
 * API wrappers for plan, subscription, and Stripe endpoints.
 * All functions require JWT authentication (auto-injected via apiClient interceptor).
 *
 * Endpoints:
 *   GET  /plans                           — List available subscription plans
 *   GET  /subscriptions/current           — Get user's current subscription
 *   GET  /subscriptions/usage             — Get simulation/portfolio usage stats
 *   POST /stripe/create-checkout-session  — Create Stripe checkout session
 *   POST /stripe/create-portal-session    — Create Stripe billing portal session
 */

/** GET /plans — List available plans */
export async function listPlansApi(): Promise<PlanListResponse> {
  const response = await apiClient.get<PlanListResponse>(
    API_ENDPOINTS.plans.list
  );
  return response.data;
}

/** GET /subscriptions/current — Get user's current subscription */
export async function getCurrentSubscriptionApi(): Promise<CurrentSubscriptionResponse> {
  const response = await apiClient.get<CurrentSubscriptionResponse>(
    API_ENDPOINTS.user.subscription
  );
  return response.data;
}

/** GET /subscriptions/usage — Get simulation/portfolio usage stats */
export async function getUsageApi(): Promise<UsageResponse> {
  const response = await apiClient.get<UsageResponse>(
    API_ENDPOINTS.user.usage
  );
  return response.data;
}

/** POST /stripe/create-checkout-session — Create Stripe checkout for a plan */
export async function createCheckoutSessionApi(
  planName: "basic" | "pro",
  successUrl: string,
  cancelUrl: string
): Promise<CheckoutSessionResponse> {
  const response = await apiClient.post<CheckoutSessionResponse>(
    API_ENDPOINTS.stripe.createCheckoutSession,
    { planName, successUrl, cancelUrl }
  );
  return response.data;
}

/** POST /stripe/create-portal-session — Create Stripe billing portal */
export async function createPortalSessionApi(
  returnUrl: string
): Promise<PortalSessionResponse> {
  const response = await apiClient.post<PortalSessionResponse>(
    API_ENDPOINTS.stripe.createPortalSession,
    { returnUrl }
  );
  return response.data;
}

/** POST /stripe/cancel-subscription — Stop recurring payment at period end */
export async function cancelSubscriptionApi(): Promise<CancelSubscriptionResponse> {
  const response = await apiClient.post<CancelSubscriptionResponse>(
    API_ENDPOINTS.stripe.cancelSubscription
  );
  return response.data;
}

/** POST /stripe/resume-subscription — Resume a cancelled subscription */
export async function resumeSubscriptionApi(): Promise<CancelSubscriptionResponse> {
  const response = await apiClient.post<CancelSubscriptionResponse>(
    API_ENDPOINTS.stripe.resumeSubscription
  );
  return response.data;
}

/** GET /stripe/invoices — Get user's Stripe invoices (payment history) */
export async function getInvoicesApi(
  limit: number = 10
): Promise<InvoiceListResponse> {
  const response = await apiClient.get<InvoiceListResponse>(
    API_ENDPOINTS.stripe.invoices,
    { params: { limit } }
  );
  return response.data;
}
