import { apiClient } from "@/lib/api/client";
import type { PaginatedResponse, ListQueryParams } from "@/lib/api/pagination";

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
