import { apiClient } from "@/lib/api/client";

export type ProductCategory = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

const BASE = "/api/v1/product-categories";

export const productCategoriesApi = {
  list: () => apiClient.get<ProductCategory[]>(BASE),
};
