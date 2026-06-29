import { z } from "zod";

const lineQuantity = z.number().positive("Quantity must be greater than zero");

export const orderProductLineSchema = z.object({
  product_id: z.string().uuid("Select a product"),
  quantity: lineQuantity,
});

export const orderCollectionSelectionSchema = z.object({
  product_id: z.string().uuid(),
  quantity: lineQuantity,
});

export const orderCollectionLineSchema = z.object({
  collection_id: z.string().uuid("Select a collection"),
  quantity: lineQuantity,
  selections: z.array(orderCollectionSelectionSchema).optional(),
});

const orderSourceSchema = z.enum([
  "website",
  "whatsapp",
  "instagram",
  "facebook",
  "manual",
  "walk_in",
  "phone",
]);

const deliveryFieldsSchema = z.object({
  delivery_area_id: z.string().uuid().optional().or(z.literal("")),
  delivery_contact_name: z.string().trim().max(200).optional().or(z.literal("")),
  delivery_phone_primary: z.string().trim().max(50).optional().or(z.literal("")),
  delivery_phone_secondary: z.string().trim().max(50).optional().or(z.literal("")),
  delivery_address_line_1: z.string().trim().max(255).optional().or(z.literal("")),
  delivery_address_line_2: z.string().trim().max(255).optional().or(z.literal("")),
  delivery_city: z.string().trim().max(100).optional().or(z.literal("")),
  delivery_postal_code: z.string().trim().max(20).optional().or(z.literal("")),
  delivery_landmark: z.string().trim().max(255).optional().or(z.literal("")),
  delivery_notes: z.string().trim().max(5000).optional().or(z.literal("")),
  delivery_latitude: z.string().trim().optional().or(z.literal("")),
  delivery_longitude: z.string().trim().optional().or(z.literal("")),
});

export const orderSchema = deliveryFieldsSchema
  .extend({
    customer_id: z.string().uuid("Select a customer"),
    source: orderSourceSchema,
    payment_method: z.enum([
      "cash_on_delivery",
      "bank_transfer",
      "online_card",
      "online_bank_debit",
      "manual",
    ]),
    payment_status: z.enum(["pending", "paid", "failed", "refunded"]),
    status: z.enum([
      "draft",
      "pending",
      "confirmed",
      "preparing",
      "ready",
      "delivered",
      "cancelled",
    ]),
    requested_delivery_date: z.string().min(1, "Requested delivery date is required"),
    scheduled_delivery_date: z.string().optional().or(z.literal("")),
    customer_notes: z.string().trim().max(5000).optional().or(z.literal("")),
    internal_notes: z.string().trim().max(5000).optional().or(z.literal("")),
    product_lines: z.array(
      z.object({
        product_id: z.string(),
        quantity: z.number(),
      }),
    ),
    collection_lines: z.array(
      z.object({
        collection_id: z.string(),
        quantity: z.number(),
        selections: z.array(orderCollectionSelectionSchema).optional(),
      }),
    ),
  })
  .superRefine((data, ctx) => {
    const productLines = data.product_lines.filter(
      (line) => line.product_id && line.quantity > 0,
    );
    const collectionLines = data.collection_lines.filter(
      (line) => line.collection_id && line.quantity > 0,
    );
    if (productLines.length === 0 && collectionLines.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Add at least one product or collection line",
        path: ["collection_lines"],
      });
    }
    for (const [index, line] of data.product_lines.entries()) {
      if (line.product_id && line.quantity <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Quantity must be greater than zero",
          path: ["product_lines", index, "quantity"],
        });
      }
    }
    for (const [index, line] of data.collection_lines.entries()) {
      if (line.collection_id && line.quantity <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Quantity must be greater than zero",
          path: ["collection_lines", index, "quantity"],
        });
      }
    }
  });

export type OrderFormValues = z.infer<typeof orderSchema>;

export function toValidProductLines(values: OrderFormValues) {
  return values.product_lines
    .filter((line) => line.product_id && line.quantity > 0)
    .map((line) => ({
      product_id: line.product_id,
      quantity: line.quantity,
    }));
}

export function toValidCollectionLines(values: OrderFormValues) {
  return values.collection_lines
    .filter((line) => line.collection_id && line.quantity > 0)
    .map((line) => ({
      collection_id: line.collection_id,
      quantity: line.quantity,
      ...(line.selections?.length ? { selections: line.selections } : {}),
    }));
}

export function toOrderDeliveryPayload(values: OrderFormValues) {
  return {
    delivery_area_id: values.delivery_area_id || null,
    delivery_contact_name: values.delivery_contact_name || null,
    delivery_phone_primary: values.delivery_phone_primary || null,
    delivery_phone_secondary: values.delivery_phone_secondary || null,
    delivery_address_line_1: values.delivery_address_line_1 || null,
    delivery_address_line_2: values.delivery_address_line_2 || null,
    delivery_city: values.delivery_city || null,
    delivery_postal_code: values.delivery_postal_code || null,
    delivery_landmark: values.delivery_landmark || null,
    delivery_notes: values.delivery_notes || null,
    delivery_latitude: values.delivery_latitude ? Number(values.delivery_latitude) : null,
    delivery_longitude: values.delivery_longitude ? Number(values.delivery_longitude) : null,
  };
}
