"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { SupplierForm } from "@/components/suppliers/SupplierForm";
import { PageActions } from "@/components/data/PageActions";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { routes } from "@/config/routes";
import { suppliersApi } from "@/lib/api/suppliers";
import { cacheEntitySave } from "@/lib/query/mutation-cache";
import type { SupplierFormValues } from "@/lib/validation/supplier";
import { notifyActionError, notifyActionSuccess } from "@/lib/forms/feedback";

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

export default function NewSupplierPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: SupplierFormValues) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const created = await suppliersApi.create(toPayload(values));
      cacheEntitySave(queryClient, ["suppliers", created.id], ["suppliers"], created);
      notifyActionSuccess("Supplier created successfully.");
      router.push(routes.suppliers.detail(created.id));
    } catch (err) {
      notifyActionError(err, "Unable to create supplier.", setError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardPageShell title="Create Supplier" description="Add a vendor for procurement planning.">
      <PageActions backHref={routes.suppliers.list} className="mb-6" />
      <SupplierForm submitLabel="Create supplier" isSubmitting={isSubmitting} error={error} onSubmit={handleSubmit} />
    </DashboardPageShell>
  );
}
