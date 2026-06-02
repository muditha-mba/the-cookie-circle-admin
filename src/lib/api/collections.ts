import { apiClient } from "@/lib/api/client";
import type { PaginatedResponse, ListQueryParams } from "@/lib/api/pagination";
import type { ChargeBreakdownLine } from "@/lib/api/products";

export type CollectionProductLineInput = {
  product_id: string;
  quantity: number;
};

export type CollectionItemLineInput = {
  product_item_id: string;
  quantity: number;
};

export type CollectionSummary = {
  id: string;
  name: string;
  description: string | null;
  package_id: string;
  selling_price: string;
  buffer_amount: string;
  is_active: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

export type CollectionProductLine = {
  id: string;
  product_id: string;
  product_name: string;
  quantity: string;
  unit_total_cost: string;
  cost_contribution: string;
};

export type CollectionItemLine = {
  id: string;
  product_item_id: string;
  product_item_name: string;
  quantity: string;
  unit: string;
  cost_per_unit: string;
  applied_cost: string;
};

export type CollectionCostBreakdown = {
  products: {
    lines: CollectionProductLine[];
    subtotal: string;
  };
  collection_items: {
    lines: CollectionItemLine[];
    subtotal: string;
  };
  additional_charges: {
    utility_charges: ChargeBreakdownLine[];
    labour_charges: ChargeBreakdownLine[];
    tax_charges: ChargeBreakdownLine[];
    subtotal: string;
  };
  buffer_amount: string;
  total_cost: string;
  selling_price: string;
  profit_amount: string;
  profit_margin_percent: string;
};

export type AttachedCharge = {
  id: string;
  name: string;
  charge_type: string;
  amount: string;
  applicability: string;
  is_active: boolean;
};

export type CollectionDetail = CollectionSummary & {
  product_lines: CollectionProductLine[];
  item_lines: CollectionItemLine[];
  utility_charges: AttachedCharge[];
  labour_charges: AttachedCharge[];
  tax_charges: AttachedCharge[];
  package: {
    id: string;
    code: string;
    name: string;
    description: string | null;
    badge_tone: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
  cost_breakdown: CollectionCostBreakdown;
};

export type CollectionCreate = {
  name: string;
  description?: string | null;
  package_id: string;
  selling_price: number;
  buffer_amount?: number;
  is_active?: boolean;
  is_public?: boolean;
  product_lines?: CollectionProductLineInput[];
  item_lines?: CollectionItemLineInput[];
  utility_charge_ids?: string[];
  labour_charge_ids?: string[];
  tax_charge_ids?: string[];
};

export type CollectionUpdate = Partial<CollectionCreate>;

export type CollectionCostPreviewRequest = {
  selling_price: number;
  buffer_amount?: number;
  product_lines?: CollectionProductLineInput[];
  item_lines?: CollectionItemLineInput[];
  utility_charge_ids?: string[];
  labour_charge_ids?: string[];
  tax_charge_ids?: string[];
};

const BASE = "/api/v1/collections";

export const collectionsApi = {
  list: (params?: ListQueryParams) =>
    apiClient.get<PaginatedResponse<CollectionSummary>>(BASE, { params }),

  get: (id: string) => apiClient.get<CollectionDetail>(`${BASE}/${id}`),

  create: (payload: CollectionCreate) => apiClient.post<CollectionDetail>(BASE, payload),

  update: (id: string, payload: CollectionUpdate) =>
    apiClient.patch<CollectionDetail>(`${BASE}/${id}`, payload),

  delete: (id: string) => apiClient.delete<void>(`${BASE}/${id}`),

  previewCost: (payload: CollectionCostPreviewRequest) =>
    apiClient.post<CollectionCostBreakdown>(`${BASE}/cost-preview`, payload),
};
