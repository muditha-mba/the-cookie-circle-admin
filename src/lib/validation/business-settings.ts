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
  order_cutoff_day: weekdaySchema,
  delivery_day: weekdaySchema,
  business_phone: z.string().max(50),
  business_email: z.string().max(320),
  stripe_enabled: z.boolean(),
  bank_transfer_enabled: z.boolean(),
  cod_enabled: z.boolean(),
});

export type BusinessSettingsFormValues = z.infer<typeof businessSettingsSchema>;
