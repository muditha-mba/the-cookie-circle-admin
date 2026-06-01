import { apiClient } from "@/lib/api/client";
import type { ListQueryParams, PaginatedResponse } from "@/lib/api/pagination";

export type DeliveryArea = {
  id: string;
  name: string;
  description: string | null;
  delivery_fee_override: string | null;
  pickup_only: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type DeliveryAreaCreate = {
  name: string;
  description?: string | null;
  delivery_fee_override?: number | null;
  pickup_only?: boolean;
  is_active?: boolean;
};

export type DeliveryAreaUpdate = Partial<DeliveryAreaCreate>;

const BASE = "/api/v1/delivery-areas";

export const deliveryAreasApi = {
  list: (params?: ListQueryParams) =>
    apiClient.get<PaginatedResponse<DeliveryArea>>(BASE, { params }),

  listActive: () => apiClient.get<DeliveryArea[]>(`${BASE}/active`),

  get: (id: string) => apiClient.get<DeliveryArea>(`${BASE}/${id}`),

  create: (payload: DeliveryAreaCreate) => apiClient.post<DeliveryArea>(BASE, payload),

  update: (id: string, payload: DeliveryAreaUpdate) =>
    apiClient.patch<DeliveryArea>(`${BASE}/${id}`, payload),

  delete: (id: string) => apiClient.delete<void>(`${BASE}/${id}`),
};
