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
  stripe_enabled: z.boolean(),
  bank_transfer_enabled: z.boolean(),
  cod_enabled: z.boolean(),
  discounts_enabled: z.boolean(),
});

export type BusinessSettingsFormValues = z.infer<typeof businessSettingsSchema>;
