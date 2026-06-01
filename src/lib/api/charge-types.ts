/** Shared types for global charge modules. */

import { apiClient } from "@/lib/api/client";
import type { PaginatedResponse, ListQueryParams } from "@/lib/api/pagination";

export type ChargeType = "fixed" | "percentage";

export type Charge = {
  id: string;
  name: string;
  description: string | null;
  charge_type: ChargeType;
  amount: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ChargeCreate = {
  name: string;
  description?: string | null;
  charge_type: ChargeType;
  amount: number;
  is_active?: boolean;
};

export type ChargeUpdate = {
  name?: string;
  description?: string | null;
  charge_type?: ChargeType;
  amount?: number;
  is_active?: boolean;
};

export type ChargeApi = {
  list: (params?: ListQueryParams) => Promise<PaginatedResponse<Charge>>;
  get: (id: string) => Promise<Charge>;
  create: (payload: ChargeCreate) => Promise<Charge>;
  update: (id: string, payload: ChargeUpdate) => Promise<Charge>;
  delete: (id: string) => Promise<void>;
};

export function createChargeApi(basePath: string): ChargeApi {
  return {
    list: (params) => apiClient.get<PaginatedResponse<Charge>>(basePath, { params }),
    get: (id) => apiClient.get<Charge>(`${basePath}/${id}`),
    create: (payload) => apiClient.post<Charge>(basePath, payload),
    update: (id, payload) => apiClient.patch<Charge>(`${basePath}/${id}`, payload),
    delete: (id) => apiClient.delete<void>(`${basePath}/${id}`),
  };
}
