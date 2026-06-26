import { apiClient } from "@/lib/api/client";
import type { PaginatedResponse, ListQueryParams } from "@/lib/api/pagination";

export type ProductCategorySummary = {
  id: string;
  code: string;
  name: string;
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
  package_name: string;
  package_code: string;
  package_size: number;
  package_fee: string;
  is_active: boolean;
  is_public: boolean;
  allowed_category_ids: string[];
  created_at: string;
  updated_at: string;
};

export type CollectionItemLine = {
  id: string;
  product_item_id: string;
  product_item_name: string;
  quantity: string;
  unit: string;
};

export type CollectionDetail = CollectionSummary & {
  allowed_categories: ProductCategorySummary[];
  item_lines: CollectionItemLine[];
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
};

export type CollectionCreate = {
  name: string;
  description?: string | null;
  package_id: string;
  package_size: number;
  package_fee: number;
  is_active?: boolean;
  is_public?: boolean;
  allowed_category_ids: string[];
  item_lines?: CollectionItemLineInput[];
};

export type CollectionUpdate = Partial<CollectionCreate>;

const BASE = "/api/v1/collections";

export const collectionsApi = {
  list: (params?: ListQueryParams) =>
    apiClient.get<PaginatedResponse<CollectionSummary>>(BASE, { params }),

  get: (id: string) => apiClient.get<CollectionDetail>(`${BASE}/${id}`),

  create: (payload: CollectionCreate) => apiClient.post<CollectionDetail>(BASE, payload),

  update: (id: string, payload: CollectionUpdate) =>
    apiClient.patch<CollectionDetail>(`${BASE}/${id}`, payload),

  delete: (id: string) => apiClient.delete<void>(`${BASE}/${id}`),
};
