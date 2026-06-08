"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { SupplierForm } from "@/components/suppliers/SupplierForm";
import { PageActions } from "@/components/data/PageActions";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { routes } from "@/config/routes";
import { suppliersApi } from "@/lib/api/suppliers";
import type { ApiError } from "@/lib/api/types";
import { cacheEntitySave } from "@/lib/query/mutation-cache";
import type { SupplierFormValues } from "@/lib/validation/supplier";

function toPayload(values: SupplierFormValues) {
  return {
    supplier_name: values.supplier_name,
    contact_person: values.contact_person || null,
    email: values.email || null,
    phone: values.phone || null,
    notes: values.notes || null,
    is_active: values.is_active,
  };
}

export default function EditSupplierPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["suppliers", params.id],
    queryFn: () => suppliersApi.get(params.id),
    enabled: Boolean(params.id),
  });

  const handleSubmit = async (values: SupplierFormValues) => {
    if (!data) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const updated = await suppliersApi.update(data.id, toPayload(values));
      cacheEntitySave(queryClient, ["suppliers", updated.id], ["suppliers"], updated);
      router.push(routes.suppliers.detail(updated.id));
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message ?? "Unable to update supplier.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardPageShell title="Edit Supplier" description="Loading...">
        <div className="h-48 animate-pulse rounded-lg bg-surface-hover" />
      </DashboardPageShell>
    );
  }

  if (isError || !data) {
    return (
      <DashboardPageShell title="Edit Supplier" description="Not found">
        <p className="text-sm text-danger">Supplier not found.</p>
        <PageActions backHref={routes.suppliers.list} className="mt-6" />
      </DashboardPageShell>
    );
  }

  return (
    <DashboardPageShell title={`Edit ${data.supplier_name}`} description="Update supplier details.">
      <PageActions backHref={routes.suppliers.detail(data.id)} className="mb-6" />
      <SupplierForm
        defaultValues={{
          supplier_name: data.supplier_name,
          contact_person: data.contact_person ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
          notes: data.notes ?? "",
          is_active: data.is_active,
        }}
        submitLabel="Save changes"
        isSubmitting={isSubmitting}
        error={error}
        onSubmit={handleSubmit}
      />
    </DashboardPageShell>
  );
}
