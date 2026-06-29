import { z } from "zod";

const platformSchema = z.enum(["instagram", "facebook", "tiktok", "youtube"]);

export const socialMediaLinkSchema = z
  .object({
    platform: platformSchema,
    url: z.string().max(500),
    is_enabled: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (value.is_enabled && !value.url.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "URL is required when the link is active",
        path: ["url"],
      });
    }
    if (value.url.trim() && !/^https?:\/\//i.test(value.url.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "URL must start with http:// or https://",
        path: ["url"],
      });
    }
  });

export const socialMediaSettingsSchema = z.object({
  links: z.array(socialMediaLinkSchema),
});

export type SocialMediaSettingsFormValues = z.infer<typeof socialMediaSettingsSchema>;
