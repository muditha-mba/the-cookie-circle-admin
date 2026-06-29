import { apiClient } from "@/lib/api/client";
import type {
  ForgotPasswordRequest,
  LoginRequest,
  LogoutRequest,
  MessageResponse,
  ResetPasswordRequest,
  TokenResponse,
  User,
} from "@/lib/api/types";

export const authApi = {
  login: (payload: LoginRequest) =>
    apiClient.post<TokenResponse>("/api/v1/auth/login", payload, {
      skipAuth: true,
    }),

  logout: (payload: LogoutRequest) =>
    apiClient.post<MessageResponse>("/api/v1/auth/logout", payload),

  forgotPassword: (payload: ForgotPasswordRequest) =>
    apiClient.post<MessageResponse>("/api/v1/auth/forgot-password", payload, {
      skipAuth: true,
    }),

  resetPassword: (payload: ResetPasswordRequest) =>
    apiClient.post<MessageResponse>("/api/v1/auth/reset-password", payload, {
      skipAuth: true,
    }),

  me: () => apiClient.get<User>("/api/v1/auth/me"),
};
