import { apiClient } from "@/lib/api/client";
import type { PaginatedResponse, ListQueryParams } from "@/lib/api/pagination";

export type RecipeLineInput = {
  product_item_id: string;
  quantity: number;
};

export type ProductSummary = {
  id: string;
  name: string;
  description: string | null;
  category_id: string;
  selling_price: string;
  buffer_amount: string;
  yield_quantity: string;
  production_notes: string | null;
  is_active: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

export type RecipeLine = {
  id: string;
  product_item_id: string;
  product_item_name: string;
  quantity: string;
  unit: string;
  cost_per_unit: string;
  line_cost: string;
};

export type ChargeBreakdownLine = {
  id: string;
  name: string;
  charge_type: string;
  configured_amount: string;
  applied_cost: string;
};

export type ProductCostBreakdown = {
  ingredients: {
    lines: RecipeLine[];
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
  cost_per_unit: string;
  profit_per_unit: string;
};

export type AttachedCharge = {
  id: string;
  name: string;
  charge_type: string;
  amount: string;
  is_active: boolean;
};

export type ProductDetail = ProductSummary & {
  recipe_lines: RecipeLine[];
  utility_charges: AttachedCharge[];
  labour_charges: AttachedCharge[];
  tax_charges: AttachedCharge[];
  cost_breakdown: ProductCostBreakdown;
};

export type ProductCreate = {
  name: string;
  description?: string | null;
  category_id: string;
  selling_price: number;
  buffer_amount?: number;
  yield_quantity: number;
  production_notes?: string | null;
  is_active?: boolean;
  is_public?: boolean;
  recipe_lines?: RecipeLineInput[];
  utility_charge_ids?: string[];
  labour_charge_ids?: string[];
  tax_charge_ids?: string[];
};

export type ProductUpdate = Partial<ProductCreate>;

export type ProductCostPreviewRequest = {
  selling_price: number;
  buffer_amount?: number;
  yield_quantity: number;
  recipe_lines?: RecipeLineInput[];
  utility_charge_ids?: string[];
  labour_charge_ids?: string[];
  tax_charge_ids?: string[];
};

const BASE = "/api/v1/products";

export const productsApi = {
  list: (params?: ListQueryParams) =>
    apiClient.get<PaginatedResponse<ProductSummary>>(BASE, { params }),

  get: (id: string) => apiClient.get<ProductDetail>(`${BASE}/${id}`),

  create: (payload: ProductCreate) => apiClient.post<ProductDetail>(BASE, payload),

  update: (id: string, payload: ProductUpdate) =>
    apiClient.patch<ProductDetail>(`${BASE}/${id}`, payload),

  delete: (id: string) => apiClient.delete<void>(`${BASE}/${id}`),

  previewCost: (payload: ProductCostPreviewRequest) =>
    apiClient.post<ProductCostBreakdown>(`${BASE}/cost-preview`, payload),
};
