import { apiClient } from "@/lib/api/client";
import type { ListQueryParams, PaginatedResponse } from "@/lib/api/pagination";

export type ActivityAction =
  | "created"
  | "updated"
  | "deleted"
  | "exported"
  | "login"
  | "login_failed"
  | "logout"
  | "logout_all";

export type ActivityResourceType =
  | "order"
  | "product"
  | "customer"
  | "collection"
  | "collection_package"
  | "product_item"
  | "product_item_type"
  | "product_category"
  | "supplier"
  | "delivery_area"
  | "utility_charge"
  | "labour_charge"
  | "tax_charge"
  | "business_settings"
  | "faq"
  | "faq_category"
  | "shared_memory"
  | "review"
  | "production"
  | "analytics"
  | "dashboard"
  | "auth"
  | "user"
  | "system";

export type ClientDeviceType = "desktop" | "mobile" | "tablet" | "bot" | "unknown";

export type ActivityLogSummary = {
  id: string;
  created_at: string;
  actor_user_id: string | null;
  actor_email: string | null;
  actor_admin_role: string | null;
  action: ActivityAction;
  resource_type: ActivityResourceType;
  resource_id: string | null;
  resource_label: string | null;
  http_method: string | null;
  path: string | null;
  ip_address: string | null;
  browser_name: string | null;
  browser_version: string | null;
  os_name: string | null;
  os_version: string | null;
  device_type: ClientDeviceType;
  status_code: number | null;
  success: boolean;
};

export type ActivityLogDetail = ActivityLogSummary & {
  user_agent: string | null;
  metadata: Record<string, unknown> | null;
};

export type ActivityLogListParams = ListQueryParams & {
  action?: ActivityAction;
  resource_type?: ActivityResourceType;
  actor_user_id?: string;
  success?: boolean;
  created_from?: string;
  created_to?: string;
};

const BASE = "/api/v1/activity-logs";

export const activityLogsApi = {
  list: (params?: ActivityLogListParams) =>
    apiClient.get<PaginatedResponse<ActivityLogSummary>>(BASE, { params }),

  get: (id: string) => apiClient.get<ActivityLogDetail>(`${BASE}/${id}`),
};
