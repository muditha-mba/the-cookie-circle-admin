import { apiClient } from "@/lib/api/client";
import type { ListQueryParams, PaginatedResponse } from "@/lib/api/pagination";

export type Supplier = {
  id: string;
  supplier_name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type SupplierCreate = {
  supplier_name: string;
  contact_person?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
  is_active?: boolean;
};

export type SupplierUpdate = Partial<SupplierCreate>;

const BASE = "/api/v1/suppliers";

export const suppliersApi = {
  list: (params?: ListQueryParams) =>
    apiClient.get<PaginatedResponse<Supplier>>(BASE, { params }),

  listActive: () => apiClient.get<Supplier[]>(`${BASE}/active`),

  get: (id: string) => apiClient.get<Supplier>(`${BASE}/${id}`),

  create: (payload: SupplierCreate) => apiClient.post<Supplier>(BASE, payload),

  update: (id: string, payload: SupplierUpdate) =>
    apiClient.patch<Supplier>(`${BASE}/${id}`, payload),

  delete: (id: string) => apiClient.delete<void>(`${BASE}/${id}`),
};
