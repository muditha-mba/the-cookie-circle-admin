import { z } from "zod";

const httpUrlSchema = z
  .string()
  .trim()
  .min(1, "URL is required")
  .refine(
    (value) => value.startsWith("http://") || value.startsWith("https://"),
    "URL must start with http:// or https://",
  );

export const sharedMemorySchema = z.object({
  title: z.string().trim().max(200, "Title must be 200 characters or fewer"),
  preview_image_url: httpUrlSchema.max(
    2000,
    "Preview image URL must be 2000 characters or fewer",
  ),
  post_url: httpUrlSchema,
  platform: z.enum(["instagram", "facebook", "tiktok", "youtube"]),
  sort_order: z.number().int().min(0),
  is_active: z.boolean(),
});

export type SharedMemoryFormValues = z.infer<typeof sharedMemorySchema>;
