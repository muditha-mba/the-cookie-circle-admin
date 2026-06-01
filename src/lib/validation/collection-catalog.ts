import { z } from "zod";

export const collectionProductLineSchema = z.object({
  product_id: z.string().uuid("Select a product"),
  quantity: z.number().positive("Quantity must be greater than zero"),
});

export const collectionItemLineSchema = z.object({
  product_item_id: z.string().uuid("Select a packaging item"),
  quantity: z.number().positive("Quantity must be greater than zero"),
});

export const collectionSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  description: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .or(z.literal("")),
  selling_price: z.number().min(0, "Selling price must be zero or greater"),
  buffer_amount: z.number().min(0, "Buffer must be zero or greater"),
  is_active: z.boolean(),
  product_lines: z.array(collectionProductLineSchema),
  item_lines: z.array(collectionItemLineSchema),
  utility_charge_ids: z.array(z.string().uuid()),
  labour_charge_ids: z.array(z.string().uuid()),
  tax_charge_ids: z.array(z.string().uuid()),
});

export type CollectionFormValues = z.infer<typeof collectionSchema>;
