import { z } from "zod";

export const faqCategorySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  sort_order: z.number().int().min(0),
  is_active: z.boolean(),
});

export type FaqCategoryFormValues = z.infer<typeof faqCategorySchema>;
