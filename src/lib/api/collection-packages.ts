import { apiClient } from "@/lib/api/client";
import type { PaginatedResponse, ListQueryParams } from "@/lib/api/pagination";

export type CollectionPackage = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  badge_tone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CollectionPackageCreate = {
  code: string;
  name: string;
  description?: string | null;
  badge_tone: string;
  is_active?: boolean;
};

export type CollectionPackageUpdate = Partial<CollectionPackageCreate>;

const BASE = "/api/v1/collection-packages";

export const collectionPackagesApi = {
  list: (params?: ListQueryParams) =>
    apiClient.get<PaginatedResponse<CollectionPackage>>(BASE, { params }),

  get: (id: string) => apiClient.get<CollectionPackage>(`${BASE}/${id}`),

  create: (payload: CollectionPackageCreate) =>
    apiClient.post<CollectionPackage>(BASE, payload),

  update: (id: string, payload: CollectionPackageUpdate) =>
    apiClient.patch<CollectionPackage>(`${BASE}/${id}`, payload),

  delete: (id: string) => apiClient.delete<void>(`${BASE}/${id}`),
};
