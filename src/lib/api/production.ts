import { env } from "@/config/env";
import { apiClient } from "@/lib/api/client";
import { getAccessToken } from "@/lib/auth/token-storage";

export type ProductionBatchOption = {
  delivery_date: string;
  order_count: number;
  label: string;
  is_delivery_day_batch: boolean;
};

export type ProductionBatchesResponse = {
  delivery_day: string;
  batches: ProductionBatchOption[];
};

export type ProductionOrderSummary = {
  delivery_date: string;
  total_orders: number;
  total_customers: number;
  total_products_ordered: string;
  total_collections_ordered: string;
  total_revenue: string;
  total_profit: string;
  excluded_draft_and_cancelled: boolean;
};

export type ProductDemandLine = {
  product_id: string;
  product_name: string;
  quantity: string;
};

export type IngredientRequirementLine = {
  product_item_id: string;
  product_item_name: string;
  quantity: string;
  unit: string;
  estimated_cost: string;
};

export type PackagingRequirementLine = {
  product_item_id: string;
  product_item_name: string;
  item_type_name: string | null;
  quantity: string;
  unit: string;
  estimated_cost: string;
};

export type OrderStatus =
  | "draft"
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "delivered"
  | "cancelled";

export type FulfillmentOrderItem = {
  id: string;
  order_number: string;
  customer_name: string;
  status: OrderStatus;
  total_revenue_snapshot: string;
  total_profit_snapshot: string;
};

export type FulfillmentStatusGroup = {
  status: OrderStatus;
  orders: FulfillmentOrderItem[];
};

export type FulfillmentOverview = {
  delivery_date: string;
  groups: FulfillmentStatusGroup[];
  total_orders: number;
};

export type ProductionSummaryResponse = {
  delivery_date: string;
  order_summary: ProductionOrderSummary;
  product_demand: ProductDemandLine[];
  ingredient_requirements: IngredientRequirementLine[];
  packaging_requirements: PackagingRequirementLine[];
  fulfillment: FulfillmentOverview;
};

export type ProductionBatchStatus = "draft" | "planning" | "ready";

export type ProductionBatch = {
  id: string;
  delivery_date: string;
  status: ProductionBatchStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ProductionBatchUpdate = {
  status?: ProductionBatchStatus;
  notes?: string | null;
};

export type PurchasePlanningStatus = "not_planned" | "planned" | "ordered";

export type SupplierSummary = {
  id: string;
  supplier_name: string;
};

export type PurchasePlanLine = {
  product_item_id: string;
  product_item_name: string;
  quantity: string;
  unit: string;
  estimated_cost: string;
  supplier: SupplierSummary | null;
  purchase_status: PurchasePlanningStatus;
};

export type PurchasePlanResponse = {
  delivery_date: string;
  production_batch: ProductionBatch;
  items: PurchasePlanLine[];
};

const BASE = "/api/v1/production";

async function downloadCsv(path: string, deliveryDate: string, fallbackFilename: string) {
  const token = getAccessToken();
  const url = new URL(path, env.apiUrl);
  url.searchParams.set("delivery_date", deliveryDate);

  const response = await fetch(url.toString(), {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Export failed with status ${response.status}`);
  }

  const blob = await response.blob();
  const disposition = response.headers.get("Content-Disposition");
  const filenameMatch = disposition?.match(/filename="([^"]+)"/);
  const filename = filenameMatch?.[1] ?? fallbackFilename;

  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(objectUrl);
}

export const productionApi = {
  listBatches: (deliveryDayOnly = false) =>
    apiClient.get<ProductionBatchesResponse>(`${BASE}/batches`, {
      params: { delivery_day_only: deliveryDayOnly },
    }),

  getSummary: (deliveryDate: string) =>
    apiClient.get<ProductionSummaryResponse>(`${BASE}/summary`, {
      params: { delivery_date: deliveryDate },
    }),

  getPlanningBatch: (deliveryDate: string) =>
    apiClient.get<ProductionBatch>(`${BASE}/planning-batch`, {
      params: { delivery_date: deliveryDate },
    }),

  updatePlanningBatch: (batchId: string, payload: ProductionBatchUpdate) =>
    apiClient.patch<ProductionBatch>(`${BASE}/planning-batch/${batchId}`, payload),

  getPurchasePlan: (deliveryDate: string) =>
    apiClient.get<PurchasePlanResponse>(`${BASE}/purchase-plan`, {
      params: { delivery_date: deliveryDate },
    }),

  updatePurchaseStatus: (payload: {
    delivery_date: string;
    product_item_id: string;
    purchase_status: PurchasePlanningStatus;
  }) =>
    apiClient.patch<PurchasePlanLine>(`${BASE}/purchase-plan/status`, payload),

  exportCsv: (deliveryDate: string) =>
    downloadCsv(`${BASE}/export`, deliveryDate, `production-summary-${deliveryDate}.csv`),

  exportPurchaseCsv: (deliveryDate: string) =>
    downloadCsv(
      `${BASE}/purchase-plan/export`,
      deliveryDate,
      `purchase-list-${deliveryDate}.csv`,
    ),
};
