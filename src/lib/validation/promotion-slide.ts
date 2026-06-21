import { z } from "zod";

export const promotionSlideSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).nullable().optional(),
  image_url: z
    .string()
    .min(1, "Image URL is required")
    .url("Must be a valid URL (https://...)"),
  cta_text: z.string().max(100).nullable().optional(),
  cta_destination: z.string().max(500).nullable().optional(),
  sort_order: z.number().int().min(0),
  starts_at: z.string().nullable().optional(),
  ends_at: z.string().nullable().optional(),
  is_active: z.boolean(),
});

export type PromotionSlideFormValues = z.infer<typeof promotionSlideSchema>;
