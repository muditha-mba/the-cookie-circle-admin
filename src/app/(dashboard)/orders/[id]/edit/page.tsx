"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
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

export default function EditOrderPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["orders", params.id],
    queryFn: () => ordersApi.get(params.id),
    enabled: Boolean(params.id),
  });

  const handleSubmit = async (values: OrderFormValues) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const updated = await ordersApi.update(params.id, {
        source: values.source,
        payment_method: values.payment_method,
        payment_status: values.payment_status,
        status: values.status,
        customer_notes: values.customer_notes || null,
        internal_notes: values.internal_notes || null,
        requested_delivery_date: values.requested_delivery_date,
        scheduled_delivery_date: values.scheduled_delivery_date || undefined,
        product_lines: toValidProductLines(values),
        collection_lines: toValidCollectionLines(values),
        ...toOrderDeliveryPayload(values),
      });
      cacheEntitySave(queryClient, ["orders", params.id], ["orders"], updated);
      router.push(routes.orders.detail(params.id));
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message ?? "Unable to update order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardPageShell title="Edit Order" description="Loading...">
        <div className="h-48 animate-pulse rounded-lg bg-surface-hover" />
      </DashboardPageShell>
    );
  }

  if (isError || !data) {
    return (
      <DashboardPageShell title="Edit Order" description="Not found">
        <p className="text-sm text-danger">Order not found.</p>
        <PageActions backHref={routes.orders.list} className="mt-6" />
      </DashboardPageShell>
    );
  }

  return (
    <DashboardPageShell title={`Edit ${data.order_number}`} description="Update order details.">
      <PageActions backHref={routes.orders.detail(params.id)} className="mb-6" />
      <OrderForm
        allowScheduledEdit
        initialCustomer={{
          id: data.customer.id,
          first_name: data.customer.first_name,
          last_name: data.customer.last_name,
          email: data.customer.email,
          phone: data.customer.phone,
        }}
        productSnapshots={data.product_lines.map((line) => ({
          id: line.product_id,
          name: line.product_name_snapshot,
          selling_price: line.product_selling_price_snapshot,
        }))}
        collectionSnapshots={data.collection_lines.map((line) => ({
          id: line.collection_id,
          name: line.collection_name_snapshot,
          package_size: 0,
          package_name: "Package",
        }))}
        defaultValues={{
          customer_id: data.customer.id,
          delivery_area_id: data.delivery_area?.id ?? "",
          source: data.source,
          payment_method: data.payment_method,
          payment_status: data.payment_status,
          status: data.status,
          requested_delivery_date: data.requested_delivery_date,
          scheduled_delivery_date: data.scheduled_delivery_date,
          customer_notes: data.customer_notes ?? "",
          internal_notes: data.internal_notes ?? "",
          delivery_contact_name: data.delivery_contact_name ?? "",
          delivery_phone_primary: data.delivery_phone_primary ?? "",
          delivery_phone_secondary: data.delivery_phone_secondary ?? "",
          delivery_address_line_1: data.delivery_address_line_1 ?? "",
          delivery_address_line_2: data.delivery_address_line_2 ?? "",
          delivery_city: data.delivery_city ?? "",
          delivery_postal_code: data.delivery_postal_code ?? "",
          delivery_landmark: data.delivery_landmark ?? "",
          delivery_notes: data.delivery_notes ?? "",
          delivery_latitude: data.delivery_latitude != null ? String(data.delivery_latitude) : "",
          delivery_longitude: data.delivery_longitude != null ? String(data.delivery_longitude) : "",
          product_lines: data.product_lines.map((line) => ({
            product_id: line.product_id,
            quantity: Number(line.quantity),
          })),
          collection_lines: data.collection_lines.map((line) => ({
            collection_id: line.collection_id,
            quantity: Number(line.quantity),
          })),
        }}
        submitLabel="Save changes"
        isSubmitting={isSubmitting}
        error={error}
        onSubmit={handleSubmit}
      />
    </DashboardPageShell>
  );
}
