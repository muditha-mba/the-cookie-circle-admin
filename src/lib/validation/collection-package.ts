import { z } from "zod";

export const collectionPackageSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, "Code is required")
    .max(64)
    .regex(/^[A-Z0-9_]+$/, "Use uppercase letters, numbers, and underscores"),
  name: z.string().trim().min(2, "Name is required").max(120),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  badge_tone: z.string().trim().min(2, "Badge tone is required").max(32),
  is_active: z.boolean(),
});

export type CollectionPackageFormValues = z.infer<typeof collectionPackageSchema>;
