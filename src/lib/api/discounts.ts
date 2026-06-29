import { apiClient } from "@/lib/api/client";
import type { PaginatedResponse, ListQueryParams as PaginationParams } from "@/lib/api/pagination";

export type DiscountType = "fixed" | "percentage";
export type DiscountGrantStatus = "active" | "used" | "expired" | "revoked";
export type DiscountSource = "rule" | "manual";

export type CustomerDiscountGrant = {
  id: string;
  customer_id: string;
  discount_rule_id: string | null;
  discount_type: DiscountType;
  discount_value: string;
  source: DiscountSource;
  status: DiscountGrantStatus;
  eligibility_reason: string | null;
  earned_at: string;
  expires_at: string | null;
  used_at: string | null;
  used_on_order_id: string | null;
  revoked_at: string | null;
  revoke_reason: string | null;
  created_at: string;
  updated_at: string;
};

export type EligibleCustomerItem = {
  customer_id: string;
  customer_name: string;
  customer_email: string;
  grant_id: string;
  discount_type: DiscountType;
  discount_value: string;
  source: DiscountSource;
  earned_at: string;
  expires_at: string | null;
};

export type DiscountHistoryItem = {
  grant_id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  discount_type: DiscountType;
  discount_value: string;
  source: DiscountSource;
  status: DiscountGrantStatus;
  earned_at: string;
  expires_at: string | null;
  used_at: string | null;
  used_on_order_id: string | null;
  revoked_at: string | null;
  revoke_reason: string | null;
};

export type DiscountAuditEvent = {
  id: string;
  event_type: string;
  customer_id: string | null;
  customer_discount_grant_id: string | null;
  discount_rule_id: string | null;
  order_id: string | null;
  admin_user_id: string | null;
  payload: Record<string, unknown>;
  created_at: string;
};

export type CustomerDiscountOverride = {
  id: string;
  customer_id: string;
  discounts_enabled: boolean;
  reason: string | null;
  admin_user_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ManualGrantCreate = {
  discount_type: DiscountType;
  discount_value: number;
  eligibility_reason?: string | null;
  grant_expires_days?: number | null;
};

export type RevokeGrantRequest = {
  reason?: string | null;
};

export type DiscountOverrideSet = {
  discounts_enabled: boolean;
  reason?: string | null;
};

const BASE = "/api/v1/discounts";
const CUSTOMERS_BASE = "/api/v1/customers";

export const discountsApi = {
  listEligible: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<EligibleCustomerItem>>(`${BASE}/eligible-customers`, { params }),

  listHistory: (params?: PaginationParams & { customer_id?: string }) =>
    apiClient.get<PaginatedResponse<DiscountHistoryItem>>(`${BASE}/history`, { params }),

  listAuditEvents: (params?: PaginationParams & { customer_id?: string }) =>
    apiClient.get<PaginatedResponse<DiscountAuditEvent>>(`${BASE}/audit-events`, { params }),

  getCustomerGrants: (customerId: string) =>
    apiClient.get<CustomerDiscountGrant[]>(`${CUSTOMERS_BASE}/${customerId}/discounts/grants`),

  grantDiscount: (customerId: string, payload: ManualGrantCreate) =>
    apiClient.post<CustomerDiscountGrant>(
      `${CUSTOMERS_BASE}/${customerId}/discounts/grant`,
      payload,
    ),

  revokeGrant: (customerId: string, grantId: string, payload: RevokeGrantRequest) =>
    apiClient.post<CustomerDiscountGrant>(
      `${CUSTOMERS_BASE}/${customerId}/discounts/grants/${grantId}/revoke`,
      payload,
    ),

  getOverride: (customerId: string) =>
    apiClient.get<CustomerDiscountOverride | null>(
      `${CUSTOMERS_BASE}/${customerId}/discount-override`,
    ),

  setOverride: (customerId: string, payload: DiscountOverrideSet) =>
    apiClient.put<CustomerDiscountOverride>(
      `${CUSTOMERS_BASE}/${customerId}/discount-override`,
      payload,
    ),

  deleteOverride: (customerId: string) =>
    apiClient.delete<void>(`${CUSTOMERS_BASE}/${customerId}/discount-override`),
};
