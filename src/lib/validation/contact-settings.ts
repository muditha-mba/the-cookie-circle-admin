import { z } from "zod";

export const contactSettingsSchema = z.object({
  business_phone: z.string().max(50),
  business_email: z
    .string()
    .max(320)
    .refine((value) => !value || z.string().email().safeParse(value).success, {
      message: "Enter a valid email address",
    }),
});

export type ContactSettingsFormValues = z.infer<typeof contactSettingsSchema>;
