import { apiClient } from "@/lib/api/client";

export type AnalyticsDatePreset =
  | "today"
  | "last_7_days"
  | "last_30_days"
  | "last_90_days"
  | "last_12_months"
  | "next_batch"
  | "next_7_days"
  | "next_30_days"
  | "custom";

export type TrendGranularity = "day" | "week" | "month";

export type AnalyticsQueryParams = {
  preset?: AnalyticsDatePreset;
  start_date?: string;
  end_date?: string;
  granularity?: TrendGranularity;
  limit?: number;
};

export type AnalyticsDateRange = {
  preset: AnalyticsDatePreset | null;
  start_date: string;
  end_date: string;
};

export type AnalyticsCategory = {
  id: string;
  title: string;
  description: string;
  endpoint_prefix: string;
};

export type AnalyticsOverview = {
  date_range: AnalyticsDateRange;
  categories: AnalyticsCategory[];
};

export type CoreKpis = {
  date_range: AnalyticsDateRange;
  total_revenue: AnalyticsKpiMetric;
  total_profit: AnalyticsKpiMetric;
  total_orders: AnalyticsKpiMetric;
  total_customers: AnalyticsKpiMetric;
  average_order_value: AnalyticsKpiMetric;
  repeat_customer_rate: AnalyticsKpiMetric;
  customer_lifetime_value: AnalyticsKpiMetric;
  profit_margin_percentage: AnalyticsKpiMetric;
};

export type TrendDataPoint = {
  period_start: string;
  revenue: string;
  profit: string;
  order_count: number;
};

export type TrendSeries = {
  date_range: AnalyticsDateRange;
  granularity: TrendGranularity;
  points: TrendDataPoint[];
};

export type TopProfitableOrder = {
  order_id: string;
  order_number: string;
  customer_name: string;
  total_revenue_snapshot: string;
  total_profit_snapshot: string;
  margin_percentage_snapshot: string;
  scheduled_delivery_date: string;
  created_at: string;
};

export type TopProfitableOrdersResponse = {
  date_range: AnalyticsDateRange;
  items: TopProfitableOrder[];
};

export type ProductAnalyticsRow = {
  product_id: string;
  name: string;
  units_sold: string;
  revenue_snapshot: string;
  cost_snapshot: string;
  profit_snapshot: string;
  average_margin_percentage: string;
  last_sold_date: string | null;
};

export type CollectionAnalyticsRow = {
  collection_id: string;
  name: string;
  package_name: string | null;
  units_sold: string;
  revenue_snapshot: string;
  cost_snapshot: string;
  profit_snapshot: string;
  average_margin_percentage: string;
  average_selling_price: string;
  last_sold_date: string | null;
};

export type CollectionKpiMetric = {
  value: string;
  trend_percentage: string | null;
  trend_direction: string | null;
};

export type CollectionAnalyticsKpis = {
  date_range: AnalyticsDateRange;
  total_collection_revenue: CollectionKpiMetric;
  total_collection_profit: CollectionKpiMetric;
  collections_sold: CollectionKpiMetric;
  average_collection_order_value: CollectionKpiMetric;
  average_collection_margin_percentage: CollectionKpiMetric;
  active_collections_sold: CollectionKpiMetric;
};

export type CollectionAnalyticsInsight = {
  id: string;
  title: string;
  name: string | null;
  metric_label: string;
  metric_value: string;
};

export type CollectionAnalyticsInsights = {
  date_range: AnalyticsDateRange;
  items: CollectionAnalyticsInsight[];
};

export type CollectionTrendPoint = {
  period_start: string;
  revenue: string;
  profit: string;
  units_sold: string;
  order_count: number;
};

export type CollectionTrendSeries = {
  date_range: AnalyticsDateRange;
  granularity: TrendGranularity;
  points: CollectionTrendPoint[];
};

export type CollectionPackageKpiMetric = {
  package_name: string | null;
  value: string;
  trend_percentage: string | null;
  trend_direction: string | null;
};

export type CollectionPackageAnalyticsKpis = {
  date_range: AnalyticsDateRange;
  highest_revenue_package: CollectionPackageKpiMetric;
  most_profitable_package: CollectionPackageKpiMetric;
  highest_margin_package: CollectionPackageKpiMetric;
  most_ordered_package: CollectionPackageKpiMetric;
  most_sold_package: CollectionPackageKpiMetric;
  active_package_types: CollectionPackageKpiMetric;
};

export type CollectionPackageAnalyticsRow = {
  package_id: string | null;
  package_code: string;
  package_name: string;
  revenue_snapshot: string;
  cost_snapshot: string;
  profit_snapshot: string;
  average_margin_percentage: string;
  order_count: number;
  units_sold: string;
  average_order_value: string;
  revenue_share_percentage: string;
};

export type CollectionPackageAnalyticsPerformance = {
  date_range: AnalyticsDateRange;
  items: CollectionPackageAnalyticsRow[];
};

export type CollectionPackageAnalyticsInsight = {
  id: string;
  title: string;
  name: string | null;
  metric_label: string;
  metric_value: string;
};

export type CollectionPackageAnalyticsInsights = {
  date_range: AnalyticsDateRange;
  items: CollectionPackageAnalyticsInsight[];
};

export type RankedProductsResponse = {
  date_range: AnalyticsDateRange;
  items: ProductAnalyticsRow[];
};

export type RankedCollectionsResponse = {
  date_range: AnalyticsDateRange;
  items: CollectionAnalyticsRow[];
};

export type ProductAnalyticsKpis = {
  date_range: AnalyticsDateRange;
  most_ordered_product_name: string | null;
  most_profitable_product_name: string | null;
  most_ordered_collection_name: string | null;
  most_profitable_collection_name: string | null;
  total_products_sold: AnalyticsKpiMetric;
  total_collections_sold: AnalyticsKpiMetric;
};

export type ProductAnalyticsInsight = {
  id: string;
  title: string;
  entity_type: "product" | "collection";
  name: string | null;
  metric_label: string;
  metric_value: string;
};

export type ProductAnalyticsInsights = {
  date_range: AnalyticsDateRange;
  items: ProductAnalyticsInsight[];
};

export type CustomerSegment = "new" | "returning" | "vip" | "inactive";

export type CustomerAnalyticsKpis = {
  date_range: AnalyticsDateRange;
  total_customers: AnalyticsKpiMetric;
  new_customers: AnalyticsKpiMetric;
  returning_customers: AnalyticsKpiMetric;
  vip_customers: AnalyticsKpiMetric;
  inactive_customers: AnalyticsKpiMetric;
  average_customer_lifetime_value: AnalyticsKpiMetric;
};

export type CustomerGrowthPoint = {
  period_start: string;
  new_customers: number;
};

export type CustomerGrowthSeries = {
  date_range: AnalyticsDateRange;
  granularity: TrendGranularity;
  total_new_customers: number;
  points: CustomerGrowthPoint[];
};

export type CustomerSegmentCount = {
  segment: CustomerSegment;
  count: number;
};

export type CustomerSegmentSummary = {
  date_range: AnalyticsDateRange;
  active_customers: number;
  segments: CustomerSegmentCount[];
};

export type MarketingSourceRow = {
  marketing_source: string | null;
  label: string;
  customer_count: number;
  order_count: number;
  revenue_snapshot: string;
  profit_snapshot: string;
};

export type MarketingSourcePerformance = {
  date_range: AnalyticsDateRange;
  items: MarketingSourceRow[];
};

export type CustomerAnalyticsRow = {
  customer_id: string;
  customer_name: string;
  total_orders: number;
  lifetime_spend: string;
  average_order_value: string;
  last_order_date: string | null;
  segment: CustomerSegment | null;
  marketing_source: string | null;
};

export type CustomerAnalyticsListResponse = {
  date_range: AnalyticsDateRange;
  items: CustomerAnalyticsRow[];
};

export type CustomerAnalyticsInsight = {
  id: string;
  title: string;
  name: string | null;
  metric_label: string;
  metric_value: string;
};

export type CustomerAnalyticsInsights = {
  date_range: AnalyticsDateRange;
  items: CustomerAnalyticsInsight[];
};

export type ProductionVolumePoint = {
  period_start: string;
  total_products: string;
  total_collections: string;
  order_count: number;
};

export type ProductionVolumeSeries = {
  date_range: AnalyticsDateRange;
  granularity: TrendGranularity;
  points: ProductionVolumePoint[];
};

export type BatchVolumePoint = {
  delivery_date: string;
  order_count: number;
  total_revenue_snapshot: string;
};

export type BatchVolumeTrends = {
  date_range: AnalyticsDateRange;
  points: BatchVolumePoint[];
};

export type ProductionDemandItem = {
  product_item_id: string;
  item_name: string;
  total_quantity: string;
  unit: string;
  estimated_cost: string;
  last_used_date: string | null;
};

export type ProductionDemandList = {
  date_range: AnalyticsDateRange;
  items: ProductionDemandItem[];
};

export type ProductionAnalyticsKpis = {
  date_range: AnalyticsDateRange;
  total_products_produced: AnalyticsKpiMetric;
  total_collections_produced: AnalyticsKpiMetric;
  total_ingredient_consumption_cost: AnalyticsKpiMetric;
  total_packaging_consumption_cost: AnalyticsKpiMetric;
  total_production_batches: AnalyticsKpiMetric;
  average_batch_size: AnalyticsKpiMetric;
};

export type ProductionAnalyticsInsight = {
  id: string;
  title: string;
  name: string | null;
  metric_label: string;
  metric_value: string;
};

export type ProductionAnalyticsInsights = {
  date_range: AnalyticsDateRange;
  items: ProductionAnalyticsInsight[];
};

export type ProductionDemandPreviewLine = {
  item_name: string;
  quantity: string;
  unit: string;
};

export type ProductionOutOfRangeHint = {
  has_upcoming_outside_range: boolean;
  delivery_date: string | null;
  order_count: number;
  collection_count: string;
  product_count: string;
};

export type UpcomingProductionDemand = {
  has_upcoming_batch: boolean;
  delivery_date: string | null;
  order_count: number;
  collection_count: string;
  product_count: string;
  top_ingredients: ProductionDemandPreviewLine[];
  top_packaging: ProductionDemandPreviewLine[];
};

export type AnalyticsKpiMetric = {
  value: string;
  trend_percentage: string | null;
  trend_direction: string | null;
};

export type OrderAnalyticsKpis = {
  date_range: AnalyticsDateRange;
  total_orders: AnalyticsKpiMetric;
  completed_orders: AnalyticsKpiMetric;
  cancelled_orders: AnalyticsKpiMetric;
  completion_rate: AnalyticsKpiMetric;
  average_order_value: AnalyticsKpiMetric;
  revenue_from_orders: AnalyticsKpiMetric;
  average_profit_per_order: AnalyticsKpiMetric;
  average_margin_percentage: AnalyticsKpiMetric;
};

export type OrderAnalyticsInsight = {
  id: string;
  title: string;
  name: string | null;
  metric_label: string;
  metric_value: string;
};

export type OrderAnalyticsInsights = {
  date_range: AnalyticsDateRange;
  items: OrderAnalyticsInsight[];
};

export type OrderDistributionItem = {
  key: string;
  label: string;
  count: number;
};

export type OrderDistribution = {
  date_range: AnalyticsDateRange;
  items: OrderDistributionItem[];
};

export type OrderTrendPoint = {
  period_start: string;
  count: number;
};

export type OrderTrendSeries = {
  date_range: AnalyticsDateRange;
  granularity: TrendGranularity;
  points: OrderTrendPoint[];
};

export type OrderLifecycleTrendPoint = {
  period_start: string;
  draft: number;
  confirmed: number;
  preparing: number;
  ready: number;
  delivered: number;
  cancelled: number;
};

export type OrderLifecycleTrendSeries = {
  date_range: AnalyticsDateRange;
  granularity: TrendGranularity;
  points: OrderLifecycleTrendPoint[];
};

export type OrderDeliveryAreaPerformanceRow = {
  area_name: string;
  order_count: number;
  revenue_snapshot: string;
  delivery_fee_revenue: string;
  average_delivery_fee: string;
};

export type OrderDeliveryAreaPerformance = {
  date_range: AnalyticsDateRange;
  items: OrderDeliveryAreaPerformanceRow[];
};

export type OrderPaymentMethodPerformanceRow = {
  payment_method: string;
  order_count: number;
  revenue_snapshot: string;
  average_order_value: string;
};

export type OrderPaymentMethodPerformance = {
  date_range: AnalyticsDateRange;
  items: OrderPaymentMethodPerformanceRow[];
};

export type OrderCustomerBehaviour = {
  date_range: AnalyticsDateRange;
  first_time_customers: number;
  returning_customers: number;
  repeat_purchase_rate: string;
  average_orders_per_customer: string;
};

export type OrderAnalyticsPerformanceRow = {
  order_id: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  package_type: string;
  collections_value_snapshot: string;
  products_value_snapshot: string;
  total_revenue_snapshot: string;
  total_cost_snapshot: string;
  total_profit_snapshot: string;
  margin_percentage_snapshot: string;
  delivery_fee_snapshot: string;
  payment_method: string;
  payment_status: string;
  status: string;
  delivery_area_name: string | null;
  scheduled_delivery_date: string;
  created_at: string;
};

export type OrderAnalyticsPerformance = {
  date_range: AnalyticsDateRange;
  items: OrderAnalyticsPerformanceRow[];
};

export type OperationsAnalyticsKpis = {
  date_range: AnalyticsDateRange;
  revenue_this_period: AnalyticsKpiMetric;
  profit_this_period: AnalyticsKpiMetric;
  orders_this_period: AnalyticsKpiMetric;
  upcoming_deliveries: AnalyticsKpiMetric;
  active_customers: AnalyticsKpiMetric;
  production_workload: AnalyticsKpiMetric;
};

export type OperationsAlertItem = {
  id: string;
  severity: string;
  title: string;
  message: string;
  count: number;
  metric_label: string | null;
};

export type OperationsAlerts = {
  date_range: AnalyticsDateRange;
  items: OperationsAlertItem[];
};

export type OperationsProductRequirementLine = {
  product_name: string;
  quantity: string;
};

export type OperationsUpcomingWorkload = {
  has_upcoming_batch: boolean;
  delivery_date: string | null;
  orders_scheduled: number;
  collections_scheduled: string;
  products_required: OperationsProductRequirementLine[];
  top_ingredients: ProductionDemandPreviewLine[];
  top_packaging: ProductionDemandPreviewLine[];
};

export type OperationsDeliveryFeeByAreaRow = {
  area_name: string;
  order_count: number;
  delivery_fee_revenue: string;
};

export type OperationsUpcomingDeliveryRow = {
  delivery_date: string;
  order_count: number;
};

export type OperationsDeliveryOverview = {
  date_range: AnalyticsDateRange;
  deliveries_by_area: OrderDistributionItem[];
  upcoming_by_date: OperationsUpcomingDeliveryRow[];
  delivery_fee_by_area: OperationsDeliveryFeeByAreaRow[];
};

export type OperationsPaymentOverview = {
  date_range: AnalyticsDateRange;
  payment_methods: OrderDistributionItem[];
  payment_statuses: OrderDistributionItem[];
  outstanding_payment_value: string;
  paid_revenue: string;
  unpaid_revenue: string;
};

export type OperationsBusinessHealthItem = {
  id: string;
  title: string;
  name: string | null;
  metric_label: string;
  metric_value: string;
};

export type OperationsExecutiveSummaryRow = {
  category: string;
  name: string;
  primary_metric: string;
  secondary_metric: string | null;
};

export type OperationsBusinessHealth = {
  date_range: AnalyticsDateRange;
  highlights: OperationsBusinessHealthItem[];
  summary_rows: OperationsExecutiveSummaryRow[];
};

export type ExecutiveOverviewKpis = {
  date_range: AnalyticsDateRange;
  total_revenue: AnalyticsKpiMetric;
  total_profit: AnalyticsKpiMetric;
  total_orders: AnalyticsKpiMetric;
  total_customers: AnalyticsKpiMetric;
  average_order_value: AnalyticsKpiMetric;
  average_margin_percentage: AnalyticsKpiMetric;
};

export type ExecutiveOverviewHighlights = {
  date_range: AnalyticsDateRange;
  top_product: string | null;
  top_collection: string | null;
  top_package: string | null;
  top_customer: string | null;
  highest_revenue_delivery_area: string | null;
  most_used_payment_method: string | null;
};

export type ExecutiveRevenueContributionItem = {
  name: string;
  value: string;
};

export type ExecutiveRevenueContribution = {
  date_range: AnalyticsDateRange;
  items: ExecutiveRevenueContributionItem[];
};

export type ExecutiveOperationsSnapshot = {
  upcoming_production_batch: string | null;
  upcoming_orders: number;
  orders_awaiting_preparation: number;
  orders_awaiting_delivery: number;
};

const BASE = "/api/v1/analytics";

export const analyticsApi = {
  getOverview: (params?: AnalyticsQueryParams) =>
    apiClient.get<AnalyticsOverview>(`${BASE}/overview`, { params }),

  getKpis: (params?: AnalyticsQueryParams) =>
    apiClient.get<CoreKpis>(`${BASE}/kpis`, { params }),

  getRevenueTrends: (params?: AnalyticsQueryParams) =>
    apiClient.get<TrendSeries>(`${BASE}/revenue/trends`, { params }),

  getProfitTrends: (params?: AnalyticsQueryParams) =>
    apiClient.get<TrendSeries>(`${BASE}/profit/trends`, { params }),

  getOrderTrends: (params?: AnalyticsQueryParams) =>
    apiClient.get<TrendSeries>(`${BASE}/orders/trends`, { params }),

  getTopProfitableOrders: (params?: AnalyticsQueryParams) =>
    apiClient.get<TopProfitableOrdersResponse>(`${BASE}/orders/top-profitable`, {
      params,
    }),

  getCustomerKpis: (params?: AnalyticsQueryParams) =>
    apiClient.get<CustomerAnalyticsKpis>(`${BASE}/customers/kpis`, { params }),

  getCustomerInsights: (params?: AnalyticsQueryParams) =>
    apiClient.get<CustomerAnalyticsInsights>(`${BASE}/customers/insights`, { params }),

  getCustomerGrowth: (params?: AnalyticsQueryParams) =>
    apiClient.get<CustomerGrowthSeries>(`${BASE}/customers/growth`, { params }),

  getCustomerSegments: (params?: AnalyticsQueryParams) =>
    apiClient.get<CustomerSegmentSummary>(`${BASE}/customers/segments`, { params }),

  getMarketingSourcePerformance: (params?: AnalyticsQueryParams) =>
    apiClient.get<MarketingSourcePerformance>(`${BASE}/customers/marketing-sources`, {
      params,
    }),

  getCustomerPerformance: (params?: AnalyticsQueryParams) =>
    apiClient.get<CustomerAnalyticsListResponse>(`${BASE}/customers/performance`, {
      params,
    }),

  getProductKpis: (params?: AnalyticsQueryParams) =>
    apiClient.get<ProductAnalyticsKpis>(`${BASE}/products/kpis`, { params }),

  getProductInsights: (params?: AnalyticsQueryParams) =>
    apiClient.get<ProductAnalyticsInsights>(`${BASE}/products/insights`, { params }),

  getMostOrderedProducts: (params?: AnalyticsQueryParams) =>
    apiClient.get<RankedProductsResponse>(`${BASE}/products/most-ordered`, { params }),

  getMostProfitableProducts: (params?: AnalyticsQueryParams) =>
    apiClient.get<RankedProductsResponse>(`${BASE}/products/most-profitable`, { params }),

  getProductPerformance: (params?: AnalyticsQueryParams) =>
    apiClient.get<RankedProductsResponse>(`${BASE}/products/performance`, { params }),

  getMostOrderedCollections: (params?: AnalyticsQueryParams) =>
    apiClient.get<RankedCollectionsResponse>(`${BASE}/collections/most-ordered`, {
      params,
    }),

  getMostProfitableCollections: (params?: AnalyticsQueryParams) =>
    apiClient.get<RankedCollectionsResponse>(`${BASE}/collections/most-profitable`, {
      params,
    }),

  getCollectionPerformance: (params?: AnalyticsQueryParams) =>
    apiClient.get<RankedCollectionsResponse>(`${BASE}/collections/performance`, {
      params,
    }),

  getProductionKpis: (params?: AnalyticsQueryParams) =>
    apiClient.get<ProductionAnalyticsKpis>(`${BASE}/production/kpis`, { params }),

  getProductionInsights: (params?: AnalyticsQueryParams) =>
    apiClient.get<ProductionAnalyticsInsights>(`${BASE}/production/insights`, { params }),

  getProductionVolume: (params?: AnalyticsQueryParams) =>
    apiClient.get<ProductionVolumeSeries>(`${BASE}/production/volume`, { params }),

  getProductionBatchTrends: (params?: AnalyticsQueryParams) =>
    apiClient.get<BatchVolumeTrends>(`${BASE}/production/batch-trends`, { params }),

  getProductionIngredientSummary: (params?: AnalyticsQueryParams) =>
    apiClient.get<ProductionDemandList>(`${BASE}/production/ingredients/summary`, {
      params,
    }),

  getProductionPackagingSummary: (params?: AnalyticsQueryParams) =>
    apiClient.get<ProductionDemandList>(`${BASE}/production/packaging/summary`, {
      params,
    }),

  getProductionUpcoming: () =>
    apiClient.get<UpcomingProductionDemand>(`${BASE}/production/upcoming`),

  getProductionOutOfRangeHint: (params?: AnalyticsQueryParams) =>
    apiClient.get<ProductionOutOfRangeHint>(`${BASE}/production/out-of-range-hint`, {
      params,
    }),

  getCollectionKpis: (params?: AnalyticsQueryParams) =>
    apiClient.get<CollectionAnalyticsKpis>(`${BASE}/collections/kpis`, { params }),

  getCollectionInsights: (params?: AnalyticsQueryParams) =>
    apiClient.get<CollectionAnalyticsInsights>(`${BASE}/collections/insights`, { params }),

  getCollectionRevenueTrends: (params?: AnalyticsQueryParams) =>
    apiClient.get<CollectionTrendSeries>(`${BASE}/collections/revenue-trends`, { params }),

  getCollectionProfitTrends: (params?: AnalyticsQueryParams) =>
    apiClient.get<CollectionTrendSeries>(`${BASE}/collections/profit-trends`, { params }),

  getCollectionOrderTrends: (params?: AnalyticsQueryParams) =>
    apiClient.get<CollectionTrendSeries>(`${BASE}/collections/order-trends`, { params }),

  getCollectionPackageKpis: (params?: AnalyticsQueryParams) =>
    apiClient.get<CollectionPackageAnalyticsKpis>(`${BASE}/collections/packages/kpis`, {
      params,
    }),

  getCollectionPackageInsights: (params?: AnalyticsQueryParams) =>
    apiClient.get<CollectionPackageAnalyticsInsights>(`${BASE}/collections/packages/insights`, {
      params,
    }),

  getCollectionPackagePerformance: (params?: AnalyticsQueryParams) =>
    apiClient.get<CollectionPackageAnalyticsPerformance>(
      `${BASE}/collections/packages/performance`,
      { params },
    ),

  getTopRevenueCollections: (params?: AnalyticsQueryParams) =>
    apiClient.get<RankedCollectionsResponse>(`${BASE}/collections/top-revenue`, { params }),

  getTopProfitCollections: (params?: AnalyticsQueryParams) =>
    apiClient.get<RankedCollectionsResponse>(`${BASE}/collections/top-profit`, { params }),

  getTopMarginCollections: (params?: AnalyticsQueryParams) =>
    apiClient.get<RankedCollectionsResponse>(`${BASE}/collections/top-margin`, { params }),

  getTopVolumeCollections: (params?: AnalyticsQueryParams) =>
    apiClient.get<RankedCollectionsResponse>(`${BASE}/collections/top-volume`, { params }),

  getOrderKpis: (params?: AnalyticsQueryParams) =>
    apiClient.get<OrderAnalyticsKpis>(`${BASE}/orders/kpis`, { params }),

  getOrderInsights: (params?: AnalyticsQueryParams) =>
    apiClient.get<OrderAnalyticsInsights>(`${BASE}/orders/insights`, { params }),

  getOrderStatusDistribution: (params?: AnalyticsQueryParams) =>
    apiClient.get<OrderDistribution>(`${BASE}/orders/status-distribution`, { params }),

  getOrderPaymentStatusDistribution: (params?: AnalyticsQueryParams) =>
    apiClient.get<OrderDistribution>(`${BASE}/orders/payment-status-distribution`, {
      params,
    }),

  getOrderPaymentMethodDistribution: (params?: AnalyticsQueryParams) =>
    apiClient.get<OrderDistribution>(`${BASE}/orders/payment-method-distribution`, {
      params,
    }),

  getOrderSourceDistribution: (params?: AnalyticsQueryParams) =>
    apiClient.get<OrderDistribution>(`${BASE}/orders/order-source-distribution`, {
      params,
    }),

  getOrderDeliveryAreaDistribution: (params?: AnalyticsQueryParams) =>
    apiClient.get<OrderDistribution>(`${BASE}/orders/delivery-area-distribution`, {
      params,
    }),

  getOrderFulfillmentTrends: (params?: AnalyticsQueryParams) =>
    apiClient.get<OrderTrendSeries>(`${BASE}/orders/fulfillment-trends`, { params }),

  getOrderDeliveryTrends: (params?: AnalyticsQueryParams) =>
    apiClient.get<OrderTrendSeries>(`${BASE}/orders/delivery-trends`, { params }),

  getOrderLifecycleTrends: (params?: AnalyticsQueryParams) =>
    apiClient.get<OrderLifecycleTrendSeries>(`${BASE}/orders/lifecycle-trends`, { params }),

  getOrderDeliveryAreaPerformance: (params?: AnalyticsQueryParams) =>
    apiClient.get<OrderDeliveryAreaPerformance>(`${BASE}/orders/delivery-area-performance`, {
      params,
    }),

  getOrderPaymentMethodPerformance: (params?: AnalyticsQueryParams) =>
    apiClient.get<OrderPaymentMethodPerformance>(`${BASE}/orders/payment-method-performance`, {
      params,
    }),

  getOrderCustomerBehaviour: (params?: AnalyticsQueryParams) =>
    apiClient.get<OrderCustomerBehaviour>(`${BASE}/orders/customer-behaviour`, { params }),

  getOrderPerformance: (params?: AnalyticsQueryParams) =>
    apiClient.get<OrderAnalyticsPerformance>(`${BASE}/orders/performance`, { params }),

  getOperationsKpis: (params?: AnalyticsQueryParams) =>
    apiClient.get<OperationsAnalyticsKpis>(`${BASE}/operations/kpis`, { params }),

  getOperationsAlerts: (params?: AnalyticsQueryParams) =>
    apiClient.get<OperationsAlerts>(`${BASE}/operations/alerts`, { params }),

  getOperationsUpcomingWorkload: (params?: AnalyticsQueryParams) =>
    apiClient.get<OperationsUpcomingWorkload>(`${BASE}/operations/upcoming-workload`, {
      params,
    }),

  getOperationsDeliveryOverview: (params?: AnalyticsQueryParams) =>
    apiClient.get<OperationsDeliveryOverview>(`${BASE}/operations/delivery-overview`, {
      params,
    }),

  getOperationsPaymentOverview: (params?: AnalyticsQueryParams) =>
    apiClient.get<OperationsPaymentOverview>(`${BASE}/operations/payment-overview`, {
      params,
    }),

  getOperationsBusinessHealth: (params?: AnalyticsQueryParams) =>
    apiClient.get<OperationsBusinessHealth>(`${BASE}/operations/business-health`, {
      params,
    }),

  getExecutiveKpis: (params?: AnalyticsQueryParams) =>
    apiClient.get<ExecutiveOverviewKpis>(`${BASE}/executive/kpis`, { params }),

  getExecutiveHighlights: (params?: AnalyticsQueryParams) =>
    apiClient.get<ExecutiveOverviewHighlights>(`${BASE}/executive/highlights`, { params }),

  getExecutiveRevenueContribution: (params?: AnalyticsQueryParams) =>
    apiClient.get<ExecutiveRevenueContribution>(`${BASE}/executive/revenue-contribution`, {
      params,
    }),

  getExecutiveOperationsSnapshot: () =>
    apiClient.get<ExecutiveOperationsSnapshot>(`${BASE}/executive/operations-snapshot`),
};

export const ANALYTICS_DATE_PRESETS: {
  id: AnalyticsDatePreset;
  label: string;
}[] = [
  { id: "today", label: "Today" },
  { id: "last_7_days", label: "Last 7 days" },
  { id: "last_30_days", label: "Last 30 days" },
  { id: "last_90_days", label: "Last 90 days" },
  { id: "last_12_months", label: "Last 12 months" },
  { id: "custom", label: "Custom range" },
];

export const TREND_GRANULARITY_OPTIONS: { id: TrendGranularity; label: string }[] = [
  { id: "day", label: "Day" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
];

export function buildAnalyticsQueryParams(
  preset: AnalyticsDatePreset,
  customStart: string,
  customEnd: string,
  granularity: TrendGranularity,
  limit?: number,
): AnalyticsQueryParams {
  if (preset === "custom") {
    return {
      preset,
      start_date: customStart,
      end_date: customEnd,
      granularity,
      limit,
    };
  }
  return { preset, granularity, limit };
}

export function analyticsQueryKey(
  scope: string,
  params: AnalyticsQueryParams,
): readonly ["analytics", string, AnalyticsQueryParams] {
  return ["analytics", scope, params];
}

export function analyticsExportUrl(scope: string, params: AnalyticsQueryParams): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const qs = search.toString();
  return `/api/v1/analytics/export/${scope}${qs ? `?${qs}` : ""}`;
}
