import { z } from "zod";

export const supplierSchema = z.object({
  supplier_name: z.string().trim().min(1, "Supplier name is required").max(200),
  contact_person: z.string().trim().max(200).optional().or(z.literal("")),
  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("")),
  phone: z.string().trim().max(50).optional().or(z.literal("")),
  address: z.string().trim().max(2000).optional().or(z.literal("")),
  notes: z.string().trim().max(10000).optional().or(z.literal("")),
  is_active: z.boolean(),
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;
