import { apiClient } from "@/lib/api/client";
import type { PaginatedResponse, ListQueryParams as PaginationParams } from "@/lib/api/pagination";

export type DiscountRuleType = "order_frequency_in_window";

export type OrderFrequencyInWindowConfig = {
  required_order_count: number;
  window_days: number;
  discount_type: "fixed" | "percentage";
  discount_value: number;
  image_url: string;
  grant_expires_days?: number | null;
};

export type DiscountRule = {
  id: string;
  name: string;
  description: string | null;
  rule_type: DiscountRuleType;
  config: Record<string, unknown>;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type DiscountRuleCreate = {
  name: string;
  description?: string | null;
  rule_type: DiscountRuleType;
  config: Record<string, unknown>;
  priority?: number;
  is_active?: boolean;
};

export type DiscountRuleUpdate = Partial<{
  name: string;
  description: string | null;
  config: Record<string, unknown>;
  priority: number;
  is_active: boolean;
}>;

const BASE = "/api/v1/discount-rules";

export const discountRulesApi = {
  list: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<DiscountRule>>(BASE, { params }),

  get: (id: string) =>
    apiClient.get<DiscountRule>(`${BASE}/${id}`),

  create: (payload: DiscountRuleCreate) =>
    apiClient.post<DiscountRule>(BASE, payload),

  update: (id: string, payload: DiscountRuleUpdate) =>
    apiClient.patch<DiscountRule>(`${BASE}/${id}`, payload),

  delete: (id: string) =>
    apiClient.delete<void>(`${BASE}/${id}`),
};
