"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { OrderForm } from "@/components/orders/OrderForm";
import { PageActions } from "@/components/data/PageActions";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { routes } from "@/config/routes";
import type { ApiError } from "@/lib/api/types";
import { ordersApi } from "@/lib/api/orders";
import { cacheEntitySave } from "@/lib/query/mutation-cache";
import {
  toOrderDeliveryPayload,
  toValidCollectionLines,
  toValidProductLines,
  type OrderFormValues,
} from "@/lib/validation/order";

export default function NewOrderPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: OrderFormValues) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const created = await ordersApi.create({
        customer_id: values.customer_id,
        source: values.source,
        payment_method: values.payment_method,
        payment_status: values.payment_status,
        status: values.status,
        customer_notes: values.customer_notes || null,
        internal_notes: values.internal_notes || null,
        requested_delivery_date: values.requested_delivery_date,
        product_lines: toValidProductLines(values),
        collection_lines: toValidCollectionLines(values),
        ...toOrderDeliveryPayload(values),
      });
      cacheEntitySave(queryClient, ["orders", created.id], ["orders"], created);
      router.push(routes.orders.detail(created.id));
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message ?? "Unable to create order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardPageShell title="Create Order" description="Place a new order with products and/or collections.">
      <PageActions backHref={routes.orders.list} className="mb-6" />
      <OrderForm submitLabel="Create order" isSubmitting={isSubmitting} error={error} onSubmit={handleSubmit} />
    </DashboardPageShell>
  );
}
