/** Shared types for global charge modules. */

import { apiClient } from "@/lib/api/client";
import type { PaginatedResponse, ListQueryParams } from "@/lib/api/pagination";

// ─── Overhead Charges (Utility & Labour) ─────────────────────────────────────

export type OverheadCharge = {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type BillEntry = {
  id: string;
  year: number;
  month: number;
  amount: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type OverheadChargeDetail = OverheadCharge & {
  bill_entries: BillEntry[];
};

export type OverheadChargeCreate = {
  name: string;
  description?: string | null;
  is_active?: boolean;
};

export type OverheadChargeUpdate = {
  name?: string;
  description?: string | null;
  is_active?: boolean;
};

export type BillEntryCreate = {
  year: number;
  month: number;
  amount: number;
  notes?: string | null;
};

export type BillEntryUpdate = {
  amount?: number;
  notes?: string | null;
};

// ─── Tax Charges ──────────────────────────────────────────────────────────────

export type ChargeType = "fixed" | "percentage";

export type TaxCharge = {
  id: string;
  name: string;
  description: string | null;
  charge_type: ChargeType;
  amount: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type TaxChargeCreate = {
  name: string;
  description?: string | null;
  charge_type: ChargeType;
  amount: number;
  is_active?: boolean;
};

export type TaxChargeUpdate = {
  name?: string;
  description?: string | null;
  charge_type?: ChargeType;
  amount?: number;
  is_active?: boolean;
};

// ─── Legacy alias for compatibility ──────────────────────────────────────────

/** @deprecated Use OverheadCharge or TaxCharge */
export type Charge = TaxCharge;
/** @deprecated Use TaxChargeCreate */
export type ChargeCreate = TaxChargeCreate;
/** @deprecated Use TaxChargeUpdate */
export type ChargeUpdate = TaxChargeUpdate;

// ─── API Factory ─────────────────────────────────────────────────────────────

export type OverheadChargeApi = {
  list: (params?: ListQueryParams) => Promise<PaginatedResponse<OverheadCharge>>;
  get: (id: string) => Promise<OverheadChargeDetail>;
  create: (payload: OverheadChargeCreate) => Promise<OverheadChargeDetail>;
  update: (id: string, payload: OverheadChargeUpdate) => Promise<OverheadChargeDetail>;
  delete: (id: string) => Promise<void>;
  addBillEntry: (id: string, payload: BillEntryCreate) => Promise<BillEntry>;
  updateBillEntry: (id: string, entryId: string, payload: BillEntryUpdate) => Promise<BillEntry>;
  deleteBillEntry: (id: string, entryId: string) => Promise<void>;
};

export type TaxChargeApi = {
  list: (params?: ListQueryParams) => Promise<PaginatedResponse<TaxCharge>>;
  get: (id: string) => Promise<TaxCharge>;
  create: (payload: TaxChargeCreate) => Promise<TaxCharge>;
  update: (id: string, payload: TaxChargeUpdate) => Promise<TaxCharge>;
  delete: (id: string) => Promise<void>;
};

/** @deprecated Use OverheadChargeApi or TaxChargeApi */
export type ChargeApi = TaxChargeApi;

export function createOverheadChargeApi(basePath: string): OverheadChargeApi {
  return {
    list: (params) => apiClient.get<PaginatedResponse<OverheadCharge>>(basePath, { params }),
    get: (id) => apiClient.get<OverheadChargeDetail>(`${basePath}/${id}`),
    create: (payload) => apiClient.post<OverheadChargeDetail>(basePath, payload),
    update: (id, payload) => apiClient.patch<OverheadChargeDetail>(`${basePath}/${id}`, payload),
    delete: (id) => apiClient.delete<void>(`${basePath}/${id}`),
    addBillEntry: (id, payload) =>
      apiClient.post<BillEntry>(`${basePath}/${id}/bills`, payload),
    updateBillEntry: (id, entryId, payload) =>
      apiClient.patch<BillEntry>(`${basePath}/${id}/bills/${entryId}`, payload),
    deleteBillEntry: (id, entryId) =>
      apiClient.delete<void>(`${basePath}/${id}/bills/${entryId}`),
  };
}

export function createTaxChargeApi(basePath: string): TaxChargeApi {
  return {
    list: (params) => apiClient.get<PaginatedResponse<TaxCharge>>(basePath, { params }),
    get: (id) => apiClient.get<TaxCharge>(`${basePath}/${id}`),
    create: (payload) => apiClient.post<TaxCharge>(basePath, payload),
    update: (id, payload) => apiClient.patch<TaxCharge>(`${basePath}/${id}`, payload),
    delete: (id) => apiClient.delete<void>(`${basePath}/${id}`),
  };
}
