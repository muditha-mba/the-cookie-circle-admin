import { apiClient } from "@/lib/api/client";
import type { PaginatedResponse, ListQueryParams } from "@/lib/api/pagination";

export type CustomerSource = "registered" | "guest" | "manual";

export type MarketingSource =
  | "instagram"
  | "facebook"
  | "whatsapp"
  | "referral"
  | "google"
  | "walk_in"
  | "other";

export type CustomerSegment = "new" | "returning" | "vip" | "inactive";

export type CommunicationType =
  | "phone_call"
  | "whatsapp"
  | "email"
  | "manual_follow_up";

export type CustomerSummary = {
  id: string;
  user_id: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  postal_code: string | null;
  landmark: string | null;
  source: CustomerSource;
  marketing_source: MarketingSource | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CustomerListItem = {
  id: string;
  user_id: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  source: CustomerSource;
  marketing_source: MarketingSource | null;
  is_active: boolean;
  created_at: string;
  total_orders: number;
  lifetime_spend: string;
  last_order_date: string | null;
  segment: CustomerSegment | null;
};

export type CustomerDetail = CustomerSummary & {
  user: { id: string; email: string } | null;
};

export type CustomerInsights = {
  lifetime_spend: string;
  total_orders: number;
  average_order_value: string;
  last_order_date: string | null;
  first_order_date: string | null;
  favourite_product: string | null;
  favourite_collection: string | null;
  segment: CustomerSegment | null;
  marketing_source: MarketingSource | null;
};

export type CreatedBySummary = {
  id: string;
  email: string;
  display_name: string;
};

export type CustomerNote = {
  id: string;
  customer_id: string;
  note: string;
  created_by: CreatedBySummary;
  created_at: string;
};

export type CustomerCommunication = {
  id: string;
  customer_id: string;
  communication_type: CommunicationType;
  note: string;
  created_by: CreatedBySummary;
  created_at: string;
};

export type CustomerOrderHistoryItem = {
  id: string;
  order_number: string;
  status: string;
  scheduled_delivery_date: string;
  total_revenue_snapshot: string;
  total_profit_snapshot: string;
  created_at: string;
};

export type CustomerCreate = {
  first_name: string;
  last_name: string;
  email?: string | null;
  phone?: string | null;
  address_line_1?: string | null;
  address_line_2?: string | null;
  city?: string | null;
  postal_code?: string | null;
  landmark?: string | null;
  source: CustomerSource;
  marketing_source?: MarketingSource | null;
  notes?: string | null;
  is_active?: boolean;
  user_id?: string | null;
};

export type CustomerUpdate = Partial<CustomerCreate>;

export type CustomerListParams = ListQueryParams & {
  segment?: CustomerSegment;
  marketing_source?: MarketingSource;
  min_order_count?: number;
  max_order_count?: number;
  min_lifetime_spend?: number;
  max_lifetime_spend?: number;
};

const BASE = "/api/v1/customers";

export const customersApi = {
  list: (params?: CustomerListParams) =>
    apiClient.get<PaginatedResponse<CustomerListItem>>(BASE, { params }),

  get: (id: string) => apiClient.get<CustomerDetail>(`${BASE}/${id}`),

  getInsights: (id: string) =>
    apiClient.get<CustomerInsights>(`${BASE}/${id}/insights`),

  getOrderHistory: (id: string, limit = 50) =>
    apiClient.get<CustomerOrderHistoryItem[]>(`${BASE}/${id}/orders`, {
      params: { limit },
    }),

  listNotes: (id: string) => apiClient.get<CustomerNote[]>(`${BASE}/${id}/notes`),

  createNote: (id: string, note: string) =>
    apiClient.post<CustomerNote>(`${BASE}/${id}/notes`, { note }),

  deleteNote: (customerId: string, noteId: string) =>
    apiClient.delete<void>(`${BASE}/${customerId}/notes/${noteId}`),

  listCommunications: (id: string) =>
    apiClient.get<CustomerCommunication[]>(`${BASE}/${id}/communications`),

  createCommunication: (
    id: string,
    payload: { communication_type: CommunicationType; note: string },
  ) =>
    apiClient.post<CustomerCommunication>(`${BASE}/${id}/communications`, payload),

  create: (payload: CustomerCreate) => apiClient.post<CustomerDetail>(BASE, payload),

  update: (id: string, payload: CustomerUpdate) =>
    apiClient.patch<CustomerDetail>(`${BASE}/${id}`, payload),

  delete: (id: string) => apiClient.delete<void>(`${BASE}/${id}`),
};
