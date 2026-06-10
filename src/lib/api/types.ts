/** Shared API types for the Admin Panel. */

export type UserRole = "ADMIN" | "CUSTOMER";

export type AdminRole = "super_admin" | "clerk_admin";

export type User = {
  id: string;
  email: string;
  role: UserRole;
  admin_role: AdminRole | null;
  first_name: string | null;
  last_name: string | null;
  email_verified: boolean;
  is_active: boolean;
  created_at: string;
};

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
};

export type MessageResponse = {
  message: string;
};

export type ApiErrorBody = {
  detail?: string | { msg: string; type: string }[];
  message?: string;
};

export type ApiError = {
  status: number;
  message: string;
  body?: ApiErrorBody;
};

export type LoginRequest = {
  email: string;
  password: string;
  app: "admin";
};

export type RefreshTokenRequest = {
  refresh_token: string;
};

export type ForgotPasswordRequest = {
  email: string;
};

export type ResetPasswordRequest = {
  token: string;
  password: string;
};

export type LogoutRequest = {
  refresh_token: string;
};
