
import { apiClient, API_ENDPOINTS } from "@/config/api";
import { CreateSimulationRequest, CreateSimulationResponse } from "@/types";

/**
 * Guest Sandbox Service
 * 
 * Public API endpoints for guest usage.
 * Passes fingerprint and guestId via headers.
 */

export async function guestSimulateApi(
    data: CreateSimulationRequest,
    guestId: string,
    fingerprint: string | null
): Promise<CreateSimulationResponse> {
    const response = await apiClient.post<CreateSimulationResponse>(
        API_ENDPOINTS.public.simulate,
        data,
        {
            headers: {
                "x-guest-id": guestId,
                "x-device-fingerprint": fingerprint || "",
            }
        }
    );
    return response.data;
}

export async function guestGetSimulationApi(
    simulationId: string,
    guestId: string,
    fingerprint: string | null
): Promise<any> { // Typing as any for now or SimulationDetailResponse
    const response = await apiClient.get<any>(
        `/public/simulate/${simulationId}`,
        {
            headers: {
                "x-guest-id": guestId,
                "x-device-fingerprint": fingerprint || "",
            }
        }
    );
    return response.data;
}

export async function guestSearchAssetsApi(query: string = ""): Promise<any[]> {
    const response = await apiClient.get<any>(
        API_ENDPOINTS.public.searchAssets,
        {
            params: { query }
        }
    );
    return response.data.data; // Assuming wrapper { success: true, data: [...] }
}
