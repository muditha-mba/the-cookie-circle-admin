import { apiClient } from "@/lib/api/client";

export type RecipeCalculatorProductOption = {
  id: string;
  name: string;
  yield_quantity: string;
};

export type RecipeCalculatorIngredientLine = {
  product_item_id: string;
  product_item_name: string;
  recipe_quantity: string;
  scaled_quantity: string;
  unit: string;
  is_discrete: boolean;
  suggested_quantity: number | null;
  cost_per_unit: string | null;
  scaled_line_cost: string | null;
};

export type RecipeCalculatorCostSummary = {
  ingredients_subtotal: string;
  buffer_amount: string;
  total_cost: string;
  cost_per_unit: string;
};

export type RecipeCalculatorResponse = {
  product_id: string;
  product_name: string;
  yield_quantity: string;
  target_quantity: string;
  scale_factor: string;
  production_notes: string | null;
  ingredients: RecipeCalculatorIngredientLine[];
  cost_summary: RecipeCalculatorCostSummary | null;
};

export type RecipeCalculatorCalculateRequest = {
  product_id: string;
  target_quantity: number;
};

const BASE = "/api/v1/tools/recipe-calculator";

export const recipeCalculatorApi = {
  listProducts: () =>
    apiClient.get<{ products: RecipeCalculatorProductOption[] }>(`${BASE}/products`),

  calculate: (payload: RecipeCalculatorCalculateRequest) =>
    apiClient.post<RecipeCalculatorResponse>(`${BASE}/calculate`, payload),
};
