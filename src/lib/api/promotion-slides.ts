import { apiClient } from "@/lib/api/client";
import type { PaginatedResponse, ListQueryParams as PaginationParams } from "@/lib/api/pagination";

export type PromotionSlide = {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  cta_text: string | null;
  cta_destination: string | null;
  sort_order: number;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type PromotionSlideCreate = {
  title: string;
  description?: string | null;
  image_url: string;
  cta_text?: string | null;
  cta_destination?: string | null;
  sort_order?: number;
  starts_at?: string | null;
  ends_at?: string | null;
  is_active?: boolean;
};

export type PromotionSlideUpdate = Partial<{
  title: string;
  description: string | null;
  image_url: string;
  cta_text: string | null;
  cta_destination: string | null;
  sort_order: number;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
}>;

const BASE = "/api/v1/promotion-slides";

export const promotionSlidesApi = {
  list: (params?: PaginationParams) =>
    apiClient.get<PaginatedResponse<PromotionSlide>>(BASE, { params }),

  get: (id: string) =>
    apiClient.get<PromotionSlide>(`${BASE}/${id}`),

  create: (payload: PromotionSlideCreate) =>
    apiClient.post<PromotionSlide>(BASE, payload),

  update: (id: string, payload: PromotionSlideUpdate) =>
    apiClient.patch<PromotionSlide>(`${BASE}/${id}`, payload),

  delete: (id: string) =>
    apiClient.delete<void>(`${BASE}/${id}`),

  reorder: (slideIds: string[]) =>
    apiClient.post<PromotionSlide[]>(`${BASE}/reorder`, { slide_ids: slideIds }),
};
