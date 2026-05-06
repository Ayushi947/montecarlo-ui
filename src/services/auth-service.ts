import { apiClient, API_ENDPOINTS } from "@/config/api";
import type {
  SignupRequest,
  LoginRequest,
  AuthApiResponse,
  MeApiResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  DeleteAccountRequest,
  DeleteAccountResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
  SendVerificationResponse,
} from "@/types";

/**
 * Auth Service
 *
 * API call functions for authentication endpoints.
 * Uses the shared apiClient (with JWT interceptor) from config/api.ts.
 *
 * Backend endpoints:
 * - POST /api/auth/signup  → register + get JWT
 * - POST /api/auth/login   → authenticate + get JWT
 * - GET  /api/auth/me      → fetch profile (requires Bearer token)
 * - POST /api/auth/logout   → server-side logout (client clears token)
 */

/** Register a new user */
export async function signupApi(data: SignupRequest): Promise<AuthApiResponse> {
  const response = await apiClient.post<AuthApiResponse>(
    API_ENDPOINTS.auth.signup,
    data
  );
  return response.data;
}

/** Log in with email + password */
export async function loginApi(data: LoginRequest): Promise<AuthApiResponse> {
  const response = await apiClient.post<AuthApiResponse>(
    API_ENDPOINTS.auth.login,
    data
  );
  return response.data;
}

/** Fetch the authenticated user's profile + subscription */
export async function getMeApi(): Promise<MeApiResponse> {
  const response = await apiClient.get<MeApiResponse>(
    API_ENDPOINTS.auth.me
  );
  return response.data;
}

/** Logout (server-side is a no-op; client removes the JWT) */
export async function logoutApi(): Promise<void> {
  await apiClient.post(API_ENDPOINTS.auth.logout);
}

/** Request password reset email */
export async function forgotPasswordApi(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
  const response = await apiClient.post<ForgotPasswordResponse>(
    API_ENDPOINTS.auth.forgotPassword,
    data
  );
  return response.data;
}

/** Reset password using token */
export async function resetPasswordApi(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
  const response = await apiClient.post<ResetPasswordResponse>(
    API_ENDPOINTS.auth.resetPassword,
    data
  );
  return response.data;
}

/** Change password for authenticated user */
export async function changePasswordApi(data: ChangePasswordRequest): Promise<ChangePasswordResponse> {
  const response = await apiClient.post<ChangePasswordResponse>(
    API_ENDPOINTS.auth.changePassword,
    data
  );
  return response.data;
}

/** Update user profile */
export async function updateProfileApi(data: UpdateProfileRequest): Promise<UpdateProfileResponse> {
  const response = await apiClient.put<UpdateProfileResponse>(
    API_ENDPOINTS.auth.profile,
    data
  );
  return response.data;
}

/** Delete user account */
export async function deleteAccountApi(data: DeleteAccountRequest): Promise<DeleteAccountResponse> {
  const response = await apiClient.delete<DeleteAccountResponse>(
    API_ENDPOINTS.auth.deleteAccount,
    { data }
  );
  return response.data;
}

/** Send email verification link */
export async function sendVerificationApi(): Promise<SendVerificationResponse> {
  const response = await apiClient.post<SendVerificationResponse>(
    API_ENDPOINTS.auth.sendVerification
  );
  return response.data;
}

/** Verify email with token */
export async function verifyEmailApi(data: VerifyEmailRequest): Promise<VerifyEmailResponse> {
  const response = await apiClient.post<VerifyEmailResponse>(
    API_ENDPOINTS.auth.verifyEmail,
    data
  );
  return response.data;
}
