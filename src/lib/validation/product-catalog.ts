import { z } from "zod";

export const recipeLineSchema = z.object({
  product_item_id: z.string().uuid("Select a product item"),
  quantity: z.number().positive("Quantity must be greater than zero"),
});

export const productSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  description: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .or(z.literal("")),
  category_id: z.string().uuid("Select a category"),
  selling_price: z.number().min(0, "Selling price must be zero or greater"),
  buffer_amount: z.number().min(0, "Buffer must be zero or greater"),
  yield_quantity: z.number().positive("Yield quantity must be greater than zero"),
  production_notes: z
    .string()
    .trim()
    .max(5000)
    .optional()
    .or(z.literal("")),
  is_active: z.boolean(),
  is_public: z.boolean(),
  recipe_lines: z.array(recipeLineSchema),
});

export type ProductFormValues = z.infer<typeof productSchema>;
