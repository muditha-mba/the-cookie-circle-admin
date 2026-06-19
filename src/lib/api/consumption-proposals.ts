import { apiClient } from "@/lib/api/client";
import type { ListQueryParams, PaginatedResponse } from "@/lib/api/pagination";

export type ConsumptionProposalStatus = "pending_review" | "approved" | "dismissed";
export type ConsumptionDemandType = "ingredient" | "packaging";

export type ConsumptionProposalOrder = {
  id: string;
  order_number: string;
  customer_name: string;
  delivered_at: string | null;
};

export type ConsumptionProposalLotAllocation = {
  id: string;
  lot_id: string;
  lot_code: string;
  quantity: string;
  unit: string;
  expires_at: string | null;
};

export type ConsumptionProposalLine = {
  id: string;
  product_item_id: string;
  product_item_name: string;
  demand_type: ConsumptionDemandType;
  quantity_proposed: string;
  quantity_approved: string | null;
  effective_quantity: string;
  unit: string;
  quantity_on_hand_snapshot: string;
  quantity_after: string;
  track_inventory: boolean;
  has_shortfall: boolean;
  lot_allocations: ConsumptionProposalLotAllocation[];
};

export type ConsumptionProposalSummary = {
  id: string;
  delivery_date: string;
  status: ConsumptionProposalStatus;
  order_count: number;
  line_count: number;
  has_shortfall: boolean;
  created_at: string;
  updated_at: string;
};

export type ConsumptionProposal = ConsumptionProposalSummary & {
  notes: string | null;
  reviewed_by_user_id: string | null;
  reviewed_at: string | null;
  applied_at: string | null;
  orders: ConsumptionProposalOrder[];
  lines: ConsumptionProposalLine[];
};

export type ConsumptionProposalLineUpdate = {
  id: string;
  quantity_approved?: number | null;
};

export type ConsumptionProposalUpdate = {
  notes?: string | null;
  lines?: ConsumptionProposalLineUpdate[];
};

export type ConsumptionProposalGenerate = {
  delivery_date?: string;
  order_ids?: string[];
};

const BASE = "/api/v1/inventory/consumption-proposals";

export const consumptionProposalsApi = {
  list: (
    params?: ListQueryParams & { status?: ConsumptionProposalStatus; delivery_date?: string },
  ) => apiClient.get<PaginatedResponse<ConsumptionProposalSummary>>(BASE, { params }),

  getPendingCount: () =>
    apiClient.get<{ pending_count: number }>(`${BASE}/pending-count`),

  getPendingForDate: (deliveryDate: string) =>
    apiClient.get<ConsumptionProposal | null>(`${BASE}/by-date/${deliveryDate}`),

  get: (id: string) => apiClient.get<ConsumptionProposal>(`${BASE}/${id}`),

  generate: (payload: ConsumptionProposalGenerate) =>
    apiClient.post<ConsumptionProposal>(`${BASE}/generate`, payload),

  update: (id: string, payload: ConsumptionProposalUpdate) =>
    apiClient.patch<ConsumptionProposal>(`${BASE}/${id}`, payload),

  approve: (id: string) => apiClient.post<ConsumptionProposal>(`${BASE}/${id}/approve`),

  dismiss: (id: string) => apiClient.post<ConsumptionProposal>(`${BASE}/${id}/dismiss`),
};
