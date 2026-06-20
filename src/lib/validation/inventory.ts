import { z } from "zod";

import { requiredUnitSchema } from "@/lib/validation/units";

export const purchaseReceiptLineSchema = z.object({
  product_item_id: z.string().uuid("Select a product item"),
  quantity: z.number().positive("Quantity must be greater than zero"),
  unit: requiredUnitSchema,
  line_total: z.number().min(0, "Amount paid must be zero or greater"),
  expires_at: z.string().optional().or(z.literal("")),
});

export const purchaseReceiptSchema = z.object({
  supplier_id: z.string().uuid("Select a supplier"),
  receipt_date: z.string().min(1, "Receipt date is required"),
  reference_number: z.string().trim().max(100).optional().or(z.literal("")),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  lines: z.array(purchaseReceiptLineSchema).min(1, "Add at least one line"),
});

export type PurchaseReceiptFormValues = z.infer<typeof purchaseReceiptSchema>;
export type PurchaseReceiptLineFormValues = z.infer<typeof purchaseReceiptLineSchema>;
