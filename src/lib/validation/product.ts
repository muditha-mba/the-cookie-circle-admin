import { z } from "zod";

export const productItemTypeSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  description: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .or(z.literal("")),
  is_active: z.boolean(),
});

export type ProductItemTypeFormValues = z.infer<typeof productItemTypeSchema>;

export const productItemSchema = z.object({
  item_type_id: z.string().uuid("Select a product item type"),
  name: z.string().trim().min(1, "Name is required").max(200),
  description: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .or(z.literal("")),
  purchase_price: z.number().min(0, "Purchase price must be zero or greater"),
  purchase_quantity: z.number().positive("Purchase quantity must be greater than zero"),
  purchase_unit: z.string().trim().min(1, "Purchase unit is required").max(50),
  primary_supplier_id: z.string().uuid().optional().or(z.literal("")),
  is_active: z.boolean(),
});

export type ProductItemFormValues = z.infer<typeof productItemSchema>;
