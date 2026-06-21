"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { CustomerForm } from "@/components/customers/CustomerForm";
import { PageActions } from "@/components/data/PageActions";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { routes } from "@/config/routes";
import { customersApi } from "@/lib/api/customers";
import { cacheEntitySave } from "@/lib/query/mutation-cache";
import type { CustomerFormValues } from "@/lib/validation/customer";
import { notifyActionError, notifyActionSuccess } from "@/lib/forms/feedback";

export default function NewCustomerPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: CustomerFormValues) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const created = await customersApi.create({
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email || null,
        phone: values.phone || null,
        address_line_1: values.address_line_1 || null,
        address_line_2: values.address_line_2 || null,
        city: values.city || null,
        postal_code: values.postal_code || null,
        landmark: values.landmark || null,
        source: values.source,
        marketing_source: values.marketing_source || null,
        notes: values.notes || null,
        is_active: values.is_active,
        user_id: values.user_id || null,
      });
      cacheEntitySave(queryClient, ["customers", created.id], ["customers"], created);
      notifyActionSuccess("Customer created successfully.");
      router.push(routes.customers.detail(created.id));
    } catch (err) {
      notifyActionError(err, "Unable to create customer.", setError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardPageShell title="Create Customer" description="Add a new customer profile.">
      <PageActions backHref={routes.customers.list} className="mb-6" />
      <CustomerForm submitLabel="Create customer" isSubmitting={isSubmitting} error={error} onSubmit={handleSubmit} />
    </DashboardPageShell>
  );
}
