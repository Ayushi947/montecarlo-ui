import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { toast } from "sonner";
import { siteConfig } from "./site";

/**
 * Axios API Client for Simulix
 *
 * Configured with:
 * - Base URL from environment
 * - Request/response interceptors
 * - Error handling
 * - Auth token injection
 */

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: siteConfig.api.baseUrl,
  timeout: siteConfig.api.timeout,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage (set by auth store)
    if (typeof window !== "undefined") {
      const authData = localStorage.getItem("simulix-auth");
      if (authData) {
        try {
          const { state } = JSON.parse(authData);
          if (state?.token) {
            config.headers.Authorization = `Bearer ${state.token}`;
          }
        } catch {
          // Invalid auth data, ignore
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle specific error codes
    if (error.response) {
      const status = error.response.status;

      switch (status) {
        case 401:
          // Unauthorized - Clear auth and redirect to login
          // Note: session-expired toast is shown by dashboard layout
          if (typeof window !== "undefined") {
            localStorage.removeItem("simulix-auth");
            // Only redirect if not already on an auth page
            if (!window.location.pathname.startsWith("/auth")) {
              window.location.href = "/auth/login";
            }
          }
          break;

        case 403:
          // Forbidden - User doesn't have permission
          // If it's a Guest Limit error, do NOT show toast (UI handles it with modal)
          const errData = error.response.data as any;
          if (errData?.error && (errData.error === 'LIMIT_REACHED_DEVICE' || errData.error === 'LIMIT_REACHED_IP')) {
            // Suppress global toast
            break;
          }

          toast.error("Access denied", {
            description: "You don't have permission to perform this action.",
          });
          break;

        case 429:
          // Rate limited
          toast.error("Too many requests", {
            description: "Please wait a moment before trying again.",
          });
          break;

        case 500:
          // Server error
          toast.error("Server error", {
            description: "Something went wrong. Please try again later.",
          });
          break;
      }
    } else if (error.request) {
      // Network error — server unreachable
      toast.error("Connection failed", {
        description: "Unable to reach the server. Check your internet connection.",
      });
    }

    return Promise.reject(error);
  }
);

/**
 * Type-safe API request helper
 */
export async function apiRequest<T>(
  config: AxiosRequestConfig
): Promise<T> {
  const response = await apiClient.request<T>(config);
  return response.data;
}

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  // Auth (email + password JWT flow)
  auth: {
    signup: "/auth/signup",
    login: "/auth/login",
    me: "/auth/me",
    logout: "/auth/logout",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    changePassword: "/auth/change-password",
    profile: "/auth/profile",
    deleteAccount: "/auth/account",
    sendVerification: "/auth/send-verification",
    verifyEmail: "/auth/verify-email",
  },

  // Dashboard (aggregated)
  dashboard: {
    overview: "/dashboard",
  },

  // Simulations
  simulations: {
    create: "/simulations",
    list: "/simulations",
    get: (id: string) => `/simulations/${id}`,
    update: (id: string) => `/simulations/${id}`,
    delete: (id: string) => `/simulations/${id}`,
    rerun: (id: string) => `/simulations/${id}/rerun`,
  },

  public: {
    simulate: "/public/simulate",
    searchAssets: "/public/assets/search",
  },

  // Portfolios
  portfolios: {
    create: "/portfolios",
    list: "/portfolios",
    get: (id: string) => `/portfolios/${id}`,
    update: (id: string) => `/portfolios/${id}`,
    delete: (id: string) => `/portfolios/${id}`,
    defaultTickers: "/portfolios/tickers/default",
  },

  // Plans
  plans: {
    list: "/plans",
  },

  // Stripe
  stripe: {
    createCheckoutSession: "/stripe/create-checkout-session",
    createPortalSession: "/stripe/create-portal-session",
    cancelSubscription: "/stripe/cancel-subscription",
    resumeSubscription: "/stripe/resume-subscription",
    invoices: "/stripe/invoices",
  },

  // User & Subscription
  user: {
    profile: "/auth/me",
    subscription: "/subscriptions/current",
    usage: "/subscriptions/usage",
  },
};
