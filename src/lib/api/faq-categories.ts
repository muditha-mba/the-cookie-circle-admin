import { apiClient } from "@/lib/api/client";

export type FaqCategory = {
  id: string;
  name: string;
  sort_order: number;
  is_active: boolean;
  faq_count: number;
};

export type FaqCategoryCreate = {
  name: string;
  sort_order?: number;
  is_active?: boolean;
};

export type FaqCategoryUpdate = Partial<FaqCategoryCreate>;

const BASE = "/api/v1/faq-categories";

export const faqCategoriesApi = {
  list: () => apiClient.get<FaqCategory[]>(BASE),

  get: (id: string) => apiClient.get<FaqCategory>(`${BASE}/${id}`),

  create: (payload: FaqCategoryCreate) => apiClient.post<FaqCategory>(BASE, payload),

  update: (id: string, payload: FaqCategoryUpdate) =>
    apiClient.patch<FaqCategory>(`${BASE}/${id}`, payload),

  delete: (id: string) => apiClient.delete<void>(`${BASE}/${id}`),
};
