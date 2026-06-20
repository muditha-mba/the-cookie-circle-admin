import { z } from "zod";

// ─── Overhead Charges (Utility & Labour) ─────────────────────────────────────

export const overheadChargeSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  is_active: z.boolean(),
});

export type OverheadChargeFormValues = z.infer<typeof overheadChargeSchema>;

// ─── Monthly Bill Entry ───────────────────────────────────────────────────────

export const billEntrySchema = z.object({
  year: z.number().int().min(2020, "Year must be 2020 or later").max(2100, "Year too far in future"),
  month: z.number().int().min(1, "Month must be between 1 and 12").max(12, "Month must be between 1 and 12"),
  amount: z.number().min(0, "Amount must be zero or more"),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type BillEntryFormValues = z.infer<typeof billEntrySchema>;

// ─── Tax Charges ──────────────────────────────────────────────────────────────

export const taxChargeSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(100),
    description: z.string().trim().max(2000).optional().or(z.literal("")),
    charge_type: z.enum(["fixed", "percentage"]),
    amount: z.number().positive("Amount must be greater than zero"),
    is_active: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.charge_type === "percentage" && data.amount > 100) {
      ctx.addIssue({
        code: "custom",
        message: "Percentage amount cannot exceed 100",
        path: ["amount"],
      });
    }
  });

export type TaxChargeFormValues = z.infer<typeof taxChargeSchema>;

/** @deprecated Use overheadChargeSchema or taxChargeSchema */
export const chargeSchema = taxChargeSchema;
/** @deprecated Use TaxChargeFormValues */
export type ChargeFormValues = TaxChargeFormValues;
