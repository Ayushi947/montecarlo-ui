import { apiClient, API_ENDPOINTS } from "@/config/api";
import type { DashboardOverviewResponse } from "@/types";

/**
 * Dashboard Service
 *
 * Single aggregated API call for the dashboard overview page.
 * Returns portfolios + simulations in one response.
 */

/** GET /dashboard — Fetch aggregated dashboard data */
export async function getDashboardOverviewApi(): Promise<DashboardOverviewResponse> {
  const response = await apiClient.get<DashboardOverviewResponse>(
    API_ENDPOINTS.dashboard.overview
  );
  return response.data;
}
