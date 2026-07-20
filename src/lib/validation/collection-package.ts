import { z } from "zod";

export const collectionPackageSchema = z
  .object({
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
    min_quantity: z.number().int().min(1, "Minimum must be at least 1"),
    max_quantity: z.number().int().min(1, "Maximum must be at least 1"),
    packaging_fee_mode: z.enum(["flat", "per_cookie"]),
    packaging_fee_amount: z.number().min(0, "Fee cannot be negative"),
  })
  .superRefine((values, ctx) => {
    if (values.max_quantity < values.min_quantity) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Maximum must be greater than or equal to minimum",
        path: ["max_quantity"],
      });
    }
  });

export type CollectionPackageFormValues = z.infer<typeof collectionPackageSchema>;
