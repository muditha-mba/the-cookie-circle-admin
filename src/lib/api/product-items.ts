import { apiClient } from "@/lib/api/client";
import type { PaginatedResponse, ListQueryParams } from "@/lib/api/pagination";

/**
 * Product items are purchasable inputs (ingredients, packaging) used in costing
 * and production demand. Phase 8+ inventory will extend this entity — not Products
 * or Collections — with configuration such as:
 *
 * - `reorder_level` (minimum stock before replenishment)
 * - `track_inventory` / inventory settings flags
 * - optional default warehouse or location (if introduced)
 *
 * Stock balances and movement transactions will live in dedicated inventory
 * tables; this type remains the catalog anchor for what is tracked.
 */

export type ProductItemTypeSummary = {
  id: string;
  name: string;
};

export type SupplierSummary = {
  id: string;
  supplier_name: string;
};

export type ProductItem = {
  id: string;
  item_type_id: string;
  name: string;
  description: string | null;
  purchase_price: string;
  purchase_quantity: string;
  purchase_unit: string;
  primary_supplier_id: string | null;
  cost_per_unit: string;
  is_active: boolean;
  track_inventory: boolean;
  reorder_level: string | null;
  reorder_unit: string | null;
  item_type: ProductItemTypeSummary;
  primary_supplier: SupplierSummary | null;
  created_at: string;
  updated_at: string;
};

export type ProductItemCreate = {
  item_type_id: string;
  name: string;
  description?: string | null;
  purchase_price: number;
  purchase_quantity: number;
  purchase_unit: string;
  primary_supplier_id?: string | null;
  is_active?: boolean;
  track_inventory?: boolean;
  reorder_level?: number | null;
  reorder_unit?: string | null;
};

export type ProductItemUpdate = {
  item_type_id?: string;
  name?: string;
  description?: string | null;
  purchase_price?: number;
  purchase_quantity?: number;
  purchase_unit?: string;
  primary_supplier_id?: string | null;
  is_active?: boolean;
  track_inventory?: boolean;
  reorder_level?: number | null;
  reorder_unit?: string | null;
};

const BASE = "/api/v1/product-items";

export const productItemsApi = {
  list: (params?: ListQueryParams & { item_type_id?: string }) =>
    apiClient.get<PaginatedResponse<ProductItem>>(BASE, { params }),

  get: (id: string) => apiClient.get<ProductItem>(`${BASE}/${id}`),

  create: (payload: ProductItemCreate) =>
    apiClient.post<ProductItem>(BASE, payload),

  update: (id: string, payload: ProductItemUpdate) =>
    apiClient.patch<ProductItem>(`${BASE}/${id}`, payload),

  delete: (id: string) => apiClient.delete<void>(`${BASE}/${id}`),
};
