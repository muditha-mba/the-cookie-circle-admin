import { apiClient } from "@/lib/api/client";
import type { PaginatedResponse } from "@/lib/api/pagination";

export type ReviewItemSentiment = "positive" | "negative";

export type OrderReviewItem = {
  product_id: string;
  product_name: string;
  quantity: string;
  sentiment: ReviewItemSentiment;
  tags: string[];
  tag_labels: string[];
};

export type OrderReview = {
  id: string;
  customer_id: string;
  customer_name: string;
  order_id: string;
  order_number: string;
  rating: number;
  order_tags: string[];
  order_tag_labels: string[];
  comment: string | null;
  items: OrderReviewItem[];
  created_at: string;
  updated_at: string;
};

export type OrderReviewAnalyticsSummary = {
  total_reviews: number;
  average_rating: number | null;
  positive_item_feedback: number;
  negative_item_feedback: number;
  most_liked_product: string | null;
};

export type ReviewListParams = {
  page?: number;
  page_size?: number;
  customer_id?: string;
  order_id?: string;
};

const BASE = "/api/v1/reviews";

export const reviewsApi = {
  list: (params?: ReviewListParams) =>
    apiClient.get<PaginatedResponse<OrderReview>>(BASE, { params }),

  get: (id: string) => apiClient.get<OrderReview>(`${BASE}/${id}`),

  getByOrder: (orderId: string) =>
    apiClient.get<OrderReview>(`${BASE}/by-order/${orderId}`),

  analyticsSummary: () =>
    apiClient.get<OrderReviewAnalyticsSummary>(`${BASE}/analytics/summary`),
};
