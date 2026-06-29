"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { CustomerForm } from "@/components/customers/CustomerForm";
import { PageActions } from "@/components/data/PageActions";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { routes } from "@/config/routes";
import { customersApi } from "@/lib/api/customers";
import { cacheEntitySave } from "@/lib/query/mutation-cache";
import type { CustomerFormValues } from "@/lib/validation/customer";
import { notifyActionError, notifyActionSuccess } from "@/lib/forms/feedback";

export default function EditCustomerPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["customers", params.id],
    queryFn: () => customersApi.get(params.id),
    enabled: Boolean(params.id),
  });

  const handleSubmit = async (values: CustomerFormValues) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const updated = await customersApi.update(params.id, {
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
      cacheEntitySave(queryClient, ["customers", params.id], ["customers"], updated);
      notifyActionSuccess("Changes saved successfully.");
      router.push(routes.customers.detail(params.id));
    } catch (err) {
      notifyActionError(err, "Unable to update customer.", setError);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardPageShell title="Edit Customer" description="Loading...">
        <div className="h-48 animate-pulse rounded-lg bg-surface-hover" />
      </DashboardPageShell>
    );
  }

  if (isError || !data) {
    return (
      <DashboardPageShell title="Edit Customer" description="Not found">
        <p className="text-sm text-danger">Customer not found.</p>
        <PageActions backHref={routes.customers.list} className="mt-6" />
      </DashboardPageShell>
    );
  }

  return (
    <DashboardPageShell
      title={`Edit ${data.first_name} ${data.last_name}`}
      description="Update customer profile."
    >
      <PageActions backHref={routes.customers.detail(params.id)} className="mb-6" />
      <CustomerForm
        linkedUser={
          data.user
            ? {
                id: data.user.id,
                email: data.user.email,
                first_name: data.first_name,
                last_name: data.last_name,
                display_name:
                  `${data.first_name} ${data.last_name}`.trim() || data.user.email,
              }
            : null
        }
        defaultValues={{
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email ?? "",
          phone: data.phone ?? "",
          address_line_1: data.address_line_1 ?? "",
          address_line_2: data.address_line_2 ?? "",
          city: data.city ?? "",
          postal_code: data.postal_code ?? "",
          landmark: data.landmark ?? "",
          source: data.source,
          marketing_source: data.marketing_source ?? "",
          notes: data.notes ?? "",
          is_active: data.is_active,
          user_id: data.user_id ?? "",
        }}
        submitLabel="Save changes"
        isSubmitting={isSubmitting}
        error={error}
        onSubmit={handleSubmit}
      />
    </DashboardPageShell>
  );
}
