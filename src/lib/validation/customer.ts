import { z } from "zod";

export const customerSourceSchema = z.enum(["registered", "guest", "manual"]);

export const marketingSourceSchema = z.enum([
  "instagram",
  "facebook",
  "whatsapp",
  "tiktok",
  "linkedin",
  "youtube",
  "twitter",
  "pinterest",
  "email",
  "referral",
  "google",
  "walk_in",
  "other",
]);

export const customerSchema = z
  .object({
    first_name: z.string().trim().min(1, "First name is required").max(100),
    last_name: z.string().trim().min(1, "Last name is required").max(100),
    email: z
      .string()
      .trim()
      .email("Enter a valid email")
      .optional()
      .or(z.literal("")),
    phone: z.string().trim().max(50).optional().or(z.literal("")),
    address_line_1: z.string().trim().max(255).optional().or(z.literal("")),
    address_line_2: z.string().trim().max(255).optional().or(z.literal("")),
    city: z.string().trim().max(100).optional().or(z.literal("")),
    postal_code: z.string().trim().max(20).optional().or(z.literal("")),
    landmark: z.string().trim().max(255).optional().or(z.literal("")),
    source: customerSourceSchema,
    marketing_source: marketingSourceSchema.optional().or(z.literal("")),
    notes: z.string().trim().max(5000).optional().or(z.literal("")),
    is_active: z.boolean(),
    user_id: z.string().uuid().optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.source === "registered" && !data.user_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Registered customers must be linked to a user",
        path: ["user_id"],
      });
    }
    if (data.source !== "registered" && data.user_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Only registered customers can be linked to a user",
        path: ["user_id"],
      });
    }
  });

export type CustomerFormValues = z.infer<typeof customerSchema>;
