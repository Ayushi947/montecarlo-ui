import { apiClient, API_ENDPOINTS } from "@/config/api";
import type {
  CreatePortfolioRequest,
  UpdatePortfolioRequest,
  PortfolioListResponse,
  PortfolioResponse,
  DeletePortfolioResponse,
  DefaultTickersResponse,
} from "@/types";

/**
 * Portfolio API Service
 *
 * CRUD operations for portfolios + default tickers.
 * All endpoints require JWT auth (auto-injected by apiClient interceptor).
 */

/** GET /portfolios — List all user portfolios */
export async function listPortfoliosApi(): Promise<PortfolioListResponse> {
  const response = await apiClient.get<PortfolioListResponse>(
    API_ENDPOINTS.portfolios.list
  );
  return response.data;
}

/** GET /portfolios/:id — Get single portfolio */
export async function getPortfolioApi(id: string): Promise<PortfolioResponse> {
  const response = await apiClient.get<PortfolioResponse>(
    API_ENDPOINTS.portfolios.get(id)
  );
  return response.data;
}

/** POST /portfolios — Create new portfolio */
export async function createPortfolioApi(
  data: CreatePortfolioRequest
): Promise<PortfolioResponse> {
  const response = await apiClient.post<PortfolioResponse>(
    API_ENDPOINTS.portfolios.create,
    data
  );
  return response.data;
}

/** PUT /portfolios/:id — Update portfolio */
export async function updatePortfolioApi(
  id: string,
  data: UpdatePortfolioRequest
): Promise<PortfolioResponse> {
  const response = await apiClient.put<PortfolioResponse>(
    API_ENDPOINTS.portfolios.update(id),
    data
  );
  return response.data;
}

/** DELETE /portfolios/:id — Delete portfolio */
export async function deletePortfolioApi(
  id: string
): Promise<DeletePortfolioResponse> {
  const response = await apiClient.delete<DeletePortfolioResponse>(
    API_ENDPOINTS.portfolios.delete(id)
  );
  return response.data;
}

/** GET /portfolios/tickers/default — Get default tickers catalog */
export async function getDefaultTickersApi(): Promise<DefaultTickersResponse> {
  const response = await apiClient.get<DefaultTickersResponse>(
    API_ENDPOINTS.portfolios.defaultTickers
  );
  return response.data;
}
