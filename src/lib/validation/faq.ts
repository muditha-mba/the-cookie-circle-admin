import { z } from "zod";

export const faqSchema = z.object({
  category_id: z.string().uuid("Select a category"),
  question: z.string().trim().min(1, "Question is required").max(300),
  answer: z.string().trim().min(1, "Answer is required"),
  sort_order: z.number().int().min(0),
  is_active: z.boolean(),
});

export type FaqFormValues = z.infer<typeof faqSchema>;
