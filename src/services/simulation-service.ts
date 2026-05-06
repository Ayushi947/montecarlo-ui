import { apiClient, API_ENDPOINTS } from "@/config/api";
import type {
  CreateSimulationRequest,
  CreateSimulationResponse,
  UpdateSimulationRequest,
  UpdateSimulationResponse,
  SimulationListResponse,
  SimulationDetailResponse,
  DeleteSimulationResponse,
} from "@/types";

/**
 * Simulation Service
 *
 * API wrappers for the Monte Carlo simulation endpoints.
 * All functions require JWT authentication (auto-injected via apiClient interceptor).
 *
 * Endpoints:
 *   POST   /simulations      — Create a new simulation (returns pending status)
 *   GET    /simulations      — List all user simulations
 *   GET    /simulations/:id  — Get simulation by ID (includes results when completed)
 *   DELETE /simulations/:id  — Delete a simulation
 */

/** POST /simulations — Create a new simulation */
export async function createSimulationApi(
  data: CreateSimulationRequest
): Promise<CreateSimulationResponse> {
  const response = await apiClient.post<CreateSimulationResponse>(
    API_ENDPOINTS.simulations.create,
    data
  );
  return response.data;
}

/** GET /simulations — List all user simulations */
export async function listSimulationsApi(): Promise<SimulationListResponse> {
  const response = await apiClient.get<SimulationListResponse>(
    API_ENDPOINTS.simulations.list
  );
  return response.data;
}

/** GET /simulations/:id — Get simulation by ID (poll for status + results) */
export async function getSimulationApi(
  id: string
): Promise<SimulationDetailResponse> {
  const response = await apiClient.get<SimulationDetailResponse>(
    API_ENDPOINTS.simulations.get(id)
  );
  return response.data;
}

/** PATCH /simulations/:id — Update a simulation (name) */
export async function updateSimulationApi(
  id: string,
  data: UpdateSimulationRequest
): Promise<UpdateSimulationResponse> {
  const response = await apiClient.patch<UpdateSimulationResponse>(
    API_ENDPOINTS.simulations.update(id),
    data
  );
  return response.data;
}

/** DELETE /simulations/:id — Delete a simulation */
export async function deleteSimulationApi(
  id: string
): Promise<DeleteSimulationResponse> {
  const response = await apiClient.delete<DeleteSimulationResponse>(
    API_ENDPOINTS.simulations.delete(id)
  );
  return response.data;
}

/** POST /simulations/:id/rerun — Rerun a failed simulation */
export async function rerunSimulationApi(
  id: string
): Promise<CreateSimulationResponse> {
  const response = await apiClient.post<CreateSimulationResponse>(
    API_ENDPOINTS.simulations.rerun(id),
    {}
  );
  return response.data;
}
