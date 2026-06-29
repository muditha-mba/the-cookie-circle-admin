import { apiClient } from "@/lib/api/client";
import type { PaginatedResponse, ListQueryParams } from "@/lib/api/pagination";

export type ProductItemType = {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductItemTypeCreate = {
  name: string;
  description?: string | null;
  is_active?: boolean;
};

export type ProductItemTypeUpdate = {
  name?: string;
  description?: string | null;
  is_active?: boolean;
};

const BASE = "/api/v1/product-item-types";

export const productItemTypesApi = {
  list: (params?: ListQueryParams) =>
    apiClient.get<PaginatedResponse<ProductItemType>>(BASE, { params }),

  get: (id: string) => apiClient.get<ProductItemType>(`${BASE}/${id}`),

  create: (payload: ProductItemTypeCreate) =>
    apiClient.post<ProductItemType>(BASE, payload),

  update: (id: string, payload: ProductItemTypeUpdate) =>
    apiClient.patch<ProductItemType>(`${BASE}/${id}`, payload),

  delete: (id: string) => apiClient.delete<void>(`${BASE}/${id}`),
};
