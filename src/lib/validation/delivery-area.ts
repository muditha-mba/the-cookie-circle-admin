import { z } from "zod";

export const deliveryAreaSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  description: z.string().trim().max(5000).optional().or(z.literal("")),
  delivery_fee_override: z.string().optional(),
  pickup_only: z.boolean(),
  is_active: z.boolean(),
});

export type DeliveryAreaFormValues = z.infer<typeof deliveryAreaSchema>;
