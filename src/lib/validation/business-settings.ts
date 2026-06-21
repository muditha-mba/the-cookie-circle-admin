import { z } from "zod";

const weekdaySchema = z.enum([
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]);

export const businessSettingsSchema = z.object({
  delivery_fee: z.number().min(0, "Delivery fee must be zero or greater"),
  use_fixed_delivery_fee: z.boolean(),
  order_cutoff_day: weekdaySchema,
  delivery_day: weekdaySchema,
  online_card_enabled: z.boolean(),
  online_bank_debit_enabled: z.boolean(),
  bank_transfer_enabled: z.boolean(),
  cod_enabled: z.boolean(),
  discounts_enabled: z.boolean(),
  bank_name: z.string().max(120),
  bank_account_name: z.string().max(120),
  bank_account_number: z.string().max(40),
  bank_branch: z.string().max(120),
  bank_transfer_instructions: z.string().max(1000),
});

export type BusinessSettingsFormValues = z.infer<typeof businessSettingsSchema>;
