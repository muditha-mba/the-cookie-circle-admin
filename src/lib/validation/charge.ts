import { z } from "zod";

export const chargeSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(100),
    description: z
      .string()
      .trim()
      .max(2000)
      .optional()
      .or(z.literal("")),
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

export type ChargeFormValues = z.infer<typeof chargeSchema>;
