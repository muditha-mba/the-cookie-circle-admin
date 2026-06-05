import { z } from "zod";

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
  package_id: z.string().uuid("Select a package"),
  package_size: z.number().int().positive("Package size must be at least 1"),
  package_fee: z.number().min(0, "Package fee must be zero or greater"),
  is_active: z.boolean(),
  is_public: z.boolean(),
  allowed_category_ids: z
    .array(z.string().uuid())
    .min(1, "Select at least one allowed category"),
  item_lines: z.array(collectionItemLineSchema),
  utility_charge_ids: z.array(z.string().uuid()),
  labour_charge_ids: z.array(z.string().uuid()),
  tax_charge_ids: z.array(z.string().uuid()),
});

export type CollectionFormValues = z.infer<typeof collectionSchema>;
