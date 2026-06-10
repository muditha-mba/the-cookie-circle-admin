import { apiClient } from "@/lib/api/client";

export type FaqCategorySummary = {
  id: string;
  name: string;
};

export type Faq = {
  id: string;
  category_id: string;
  category: FaqCategorySummary;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
};

export type FaqCreate = {
  category_id: string;
  question: string;
  answer: string;
  sort_order?: number;
  is_active?: boolean;
};

export type FaqUpdate = Partial<FaqCreate>;

const BASE = "/api/v1/faqs";

export const faqsApi = {
  list: () => apiClient.get<Faq[]>(BASE),

  get: (id: string) => apiClient.get<Faq>(`${BASE}/${id}`),

  create: (payload: FaqCreate) => apiClient.post<Faq>(BASE, payload),

  update: (id: string, payload: FaqUpdate) =>
    apiClient.patch<Faq>(`${BASE}/${id}`, payload),

  delete: (id: string) => apiClient.delete<void>(`${BASE}/${id}`),
};
