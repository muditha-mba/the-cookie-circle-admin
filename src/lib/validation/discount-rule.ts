import { z } from "zod";

export const discountRuleConfigSchema = z.object({
  required_order_count: z
    .number()
    .int()
    .min(2, "At least 2 orders required"),
  window_days: z
    .number()
    .int()
    .min(1, "Window must be at least 1 day")
    .max(365, "Window cannot exceed 365 days"),
  discount_type: z.enum(["fixed", "percentage"]),
  discount_value: z
    .number()
    .gt(0, "Discount value must be greater than 0"),
  image_url: z
    .string()
    .min(1, "Image URL is required")
    .url("Must be a valid URL (https://...)"),
  grant_expires_days: z
    .number()
    .int()
    .min(1)
    .max(365)
    .nullable()
    .optional(),
}).refine(
  (data) =>
    data.discount_type !== "percentage" || data.discount_value <= 100,
  { message: "Percentage cannot exceed 100", path: ["discount_value"] },
);

export const discountRuleSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(2000).nullable().optional(),
  rule_type: z.enum(["order_frequency_in_window"]),
  config: discountRuleConfigSchema,
  priority: z.number().int().min(1).max(999),
  is_active: z.boolean(),
});

export type DiscountRuleFormValues = z.infer<typeof discountRuleSchema>;

export const manualGrantSchema = z.object({
  discount_type: z.enum(["fixed", "percentage"]),
  discount_value: z.number().gt(0, "Value must be greater than 0"),
  eligibility_reason: z.string().max(2000).nullable().optional(),
  grant_expires_days: z.number().int().min(1).max(365).nullable().optional(),
}).refine(
  (data) =>
    data.discount_type !== "percentage" || data.discount_value <= 100,
  { message: "Percentage cannot exceed 100", path: ["discount_value"] },
);

export type ManualGrantFormValues = z.infer<typeof manualGrantSchema>;
