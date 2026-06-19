import { apiClient } from "@/lib/api/client";
import type { ListQueryParams, PaginatedResponse } from "@/lib/api/pagination";

export type InventoryBalance = {
  product_item_id: string;
  product_item_name: string;
  item_type: { id: string; name: string };
  unit: string;
  quantity_on_hand: string;
  reorder_level: string | null;
  reorder_unit: string | null;
  is_low_stock: boolean;
  nearest_expiry: string | null;
};

export type InventoryBalanceDetail = InventoryBalance & {
  lots: InventoryLot[];
};

export type InventoryLot = {
  id: string;
  lot_code: string;
  quantity_on_hand: string;
  unit: string;
  expires_at: string | null;
  received_at: string;
  is_active: boolean;
};

export type InventoryMovement = {
  id: string;
  lot_id: string;
  lot_code: string;
  product_item_id: string;
  product_item_name: string;
  movement_type: "receipt" | "adjustment" | "waste" | "consumption";
  quantity_change: string;
  unit: string;
  reference_type: string;
  reference_id: string | null;
  notes: string | null;
  created_by_user_id: string | null;
  created_at: string;
};

export type InventoryAlerts = {
  low_stock_count: number;
  expiring_soon_count: number;
};

export type InventoryAdjustmentCreate = {
  lot_id: string;
  quantity_change: number;
  notes?: string | null;
};

export type InventoryWasteCreate = {
  lot_id: string;
  quantity: number;
  notes?: string | null;
};

const BASE = "/api/v1/inventory";

export const inventoryApi = {
  listBalances: (params?: ListQueryParams & { low_stock_only?: boolean }) =>
    apiClient.get<PaginatedResponse<InventoryBalance>>(`${BASE}/balances`, { params }),

  getBalance: (productItemId: string) =>
    apiClient.get<InventoryBalanceDetail>(`${BASE}/balances/${productItemId}`),

  getAlerts: (expiring_within_days = 7) =>
    apiClient.get<InventoryAlerts>(`${BASE}/alerts`, {
      params: { expiring_within_days },
    }),

  listLots: (
    params?: ListQueryParams & {
      product_item_id?: string;
      expiring_before?: string;
    },
  ) => apiClient.get<PaginatedResponse<InventoryLot>>(`${BASE}/lots`, { params }),

  listMovements: (
    params?: ListQueryParams & {
      product_item_id?: string;
      lot_id?: string;
      movement_type?: string;
    },
  ) => apiClient.get<PaginatedResponse<InventoryMovement>>(`${BASE}/movements`, { params }),

  adjust: (payload: InventoryAdjustmentCreate) =>
    apiClient.post<InventoryMovement>(`${BASE}/adjustments`, payload),

  waste: (payload: InventoryWasteCreate) =>
    apiClient.post<InventoryMovement>(`${BASE}/waste`, payload),
};
