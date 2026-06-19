import { apiClient } from "@/lib/api/client";
import type { ListQueryParams, PaginatedResponse } from "@/lib/api/pagination";

export type OrderSource =
  | "website"
  | "whatsapp"
  | "instagram"
  | "facebook"
  | "manual"
  | "walk_in"
  | "phone";
export type PaymentMethod = "cash_on_delivery" | "bank_transfer" | "stripe" | "manual";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type OrderStatus =
  | "draft"
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "delivered"
  | "cancelled";

export type OrderProductLineInput = {
  product_id: string;
  quantity: number;
};

export type OrderCollectionSelectionInput = {
  product_id: string;
  quantity: number;
};

export type OrderCollectionLineInput = {
  collection_id: string;
  quantity: number;
  selections?: OrderCollectionSelectionInput[];
};

export type OrderProductLine = {
  id: string;
  product_id: string;
  quantity: string;
  product_name_snapshot: string;
  product_selling_price_snapshot: string;
  product_cost_snapshot: string;
  product_profit_snapshot: string;
  line_revenue_snapshot: string;
  line_cost_snapshot: string;
  line_profit_snapshot: string;
  margin_percentage_snapshot: string;
};

export type OrderCollectionLineSelection = {
  id: string;
  product_id: string;
  quantity: string;
  product_name_snapshot: string;
  is_premium_snapshot: boolean;
  product_selling_price_snapshot: string | null;
  product_cost_snapshot: string | null;
  product_profit_snapshot: string | null;
  line_revenue_snapshot: string | null;
  line_cost_snapshot: string | null;
  line_profit_snapshot: string | null;
  margin_percentage_snapshot: string | null;
  profit_contribution_percentage_snapshot: string | null;
};

export type OrderCollectionLine = {
  id: string;
  collection_id: string;
  quantity: string;
  collection_name_snapshot: string;
  collection_selling_price_snapshot: string;
  collection_cost_snapshot: string;
  collection_profit_snapshot: string;
  package_fee_snapshot: string | null;
  cookies_subtotal_snapshot: string | null;
  total_cookies_per_pack: string | null;
  line_revenue_snapshot: string;
  line_cost_snapshot: string;
  line_profit_snapshot: string;
  margin_percentage_snapshot: string;
  selections?: OrderCollectionLineSelection[];
};

export type OrderFinancialSnapshot = {
  products_subtotal_snapshot: string;
  collections_subtotal_snapshot: string;
  delivery_fee_snapshot: string;
  delivery_cost_snapshot: string;
  package_fee_revenue_snapshot: string;
  packaging_cost_snapshot: string;
  products_cost_snapshot: string;
  collections_cost_snapshot: string;
  total_revenue_snapshot: string;
  total_cost_snapshot: string;
  total_profit_snapshot: string;
  margin_percentage_snapshot: string;
};

export type OrderFinancialPerformance = {
  snapshot: OrderFinancialSnapshot;
  is_historical_snapshot: boolean;
};

export type OrderStatusEvent = {
  id: string;
  status: OrderStatus;
  created_at: string;
};

export type OrderLifecycle = {
  confirmed_at: string | null;
  preparing_at: string | null;
  ready_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
};

export type OrderCustomer = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  postal_code: string | null;
  landmark: string | null;
};

export type OrderDeliveryArea = {
  id: string;
  name: string;
  pickup_only: boolean;
};

export type OrderDeliveryFields = {
  delivery_contact_name: string | null;
  delivery_phone_primary: string | null;
  delivery_phone_secondary: string | null;
  delivery_address_line_1: string | null;
  delivery_address_line_2: string | null;
  delivery_city: string | null;
  delivery_postal_code: string | null;
  delivery_landmark: string | null;
  delivery_notes: string | null;
  delivery_latitude: number | null;
  delivery_longitude: number | null;
};

export type OrderBillingFields = {
  billing_same_as_shipping: boolean;
  billing_address_line_1: string | null;
  billing_address_line_2: string | null;
  billing_city: string | null;
  billing_postal_code: string | null;
  billing_landmark: string | null;
};

export type OrderSummary = {
  id: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  order_type: "weekly_delivery" | "catering";
  source: OrderSource;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  status: OrderStatus;
  requested_delivery_date: string;
  scheduled_delivery_date: string;
  delivery_area: OrderDeliveryArea | null;
  total_revenue_snapshot: string;
  total_profit_snapshot: string;
  created_at: string;
};

export type OrderDetail = OrderDeliveryFields & OrderBillingFields & {
  id: string;
  order_number: string;
  customer: OrderCustomer;
  delivery_area: OrderDeliveryArea | null;
  order_type?: "weekly_delivery" | "catering";
  event_name?: string | null;
  source: OrderSource;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  status: OrderStatus;
  customer_notes: string | null;
  internal_notes: string | null;
  requested_delivery_date: string;
  scheduled_delivery_date: string;
  delivery_fee_snapshot: string;
  delivery_cost_snapshot: string;
  package_fee_revenue_snapshot: string;
  packaging_cost_snapshot: string;
  products_cost_snapshot: string;
  collections_cost_snapshot: string;
  total_revenue_snapshot: string;
  financial_performance: OrderFinancialPerformance | null;
  product_lines: OrderProductLine[];
  collection_lines: OrderCollectionLine[];
  status_timeline: OrderStatusEvent[];
  lifecycle: OrderLifecycle;
  customer_review: {
    id: string;
    rating: number;
  } | null;
  inventory_consumption?: {
    consumed_at: string | null;
    applied_proposal_id: string | null;
    pending_proposal_id: string | null;
  };
  created_at: string;
  updated_at: string;
};

export type OrderCreate = OrderDeliveryFields & {
  customer_id: string;
  delivery_area_id?: string | null;
  source: OrderSource;
  payment_method: PaymentMethod;
  payment_status?: PaymentStatus;
  status?: OrderStatus;
  customer_notes?: string | null;
  internal_notes?: string | null;
  requested_delivery_date: string;
  product_lines: OrderProductLineInput[];
  collection_lines: OrderCollectionLineInput[];
};

export type OrderUpdate = Partial<
  Omit<OrderCreate, "customer_id" | "requested_delivery_date">
> & {
  requested_delivery_date?: string;
  scheduled_delivery_date?: string;
};

export type OrderPreviewRequest = {
  delivery_area_id?: string | null;
  product_lines: OrderProductLineInput[];
  collection_lines: OrderCollectionLineInput[];
};

export type OrderPreview = OrderFinancialSnapshot & {
  product_lines: OrderProductLine[];
  collection_lines: OrderCollectionLine[];
};

const BASE = "/api/v1/orders";

export const ordersApi = {
  list: (params?: ListQueryParams) =>
    apiClient.get<PaginatedResponse<OrderSummary>>(BASE, { params }),

  get: (id: string) => apiClient.get<OrderDetail>(`${BASE}/${id}`),

  create: (payload: OrderCreate) => apiClient.post<OrderDetail>(BASE, payload),

  update: (id: string, payload: OrderUpdate) =>
    apiClient.patch<OrderDetail>(`${BASE}/${id}`, payload),

  delete: (id: string) => apiClient.delete<void>(`${BASE}/${id}`),

  preview: (payload: OrderPreviewRequest) =>
    apiClient.post<OrderPreview>(`${BASE}/preview`, payload),
};
