import { apiClient } from "@/lib/api/client";
import type { OrderStatus } from "@/lib/api/orders";

export type DashboardTodaySnapshot = {
  orders_today: number;
  revenue_today: string;
  deliveries_today: number;
  production_units_scheduled_today: string;
};

export type DashboardUpcomingProduction = {
  has_upcoming_batch: boolean;
  delivery_date: string | null;
  orders: number;
  collections: string;
  product_units: string;
  top_ingredients: string[];
};

export type DashboardUpcomingDelivery = {
  delivery_date: string;
  order_count: number;
};

export type DashboardRecentOrder = {
  order_id: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  delivery_date: string;
  total_revenue_snapshot: string;
  status: OrderStatus;
};

export type DashboardOperationalAlert = {
  id: string;
  title: string;
  message: string;
  count: number;
};

export type DashboardOverview = {
  today_snapshot: DashboardTodaySnapshot;
  upcoming_production: DashboardUpcomingProduction;
  upcoming_deliveries: DashboardUpcomingDelivery[];
  recent_orders: DashboardRecentOrder[];
  operational_alerts: DashboardOperationalAlert[];
};

export const dashboardApi = {
  getOverview: () => apiClient.get<DashboardOverview>("/api/v1/dashboard/overview"),
};
