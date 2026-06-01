"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { CustomerDetailView } from "@/components/customers/CustomerDetailView";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { PageActions, SecondaryButton } from "@/components/data/PageActions";
import { routes } from "@/config/routes";
import type { ApiError } from "@/lib/api/types";
import { customersApi } from "@/lib/api/customers";
import { cacheEntityRemove } from "@/lib/query/mutation-cache";

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["customers", params.id],
    queryFn: () => customersApi.get(params.id),
    enabled: Boolean(params.id),
  });

  const handleDelete = async () => {
    if (!data || !window.confirm(`Delete ${data.first_name} ${data.last_name}?`)) {
      return;
    }
    setDeleteError(null);
    setIsDeleting(true);
    try {
      await customersApi.delete(data.id);
      cacheEntityRemove(queryClient, ["customers", data.id], ["customers"]);
      router.push(routes.customers.list);
    } catch (err) {
      const apiError = err as ApiError;
      setDeleteError(apiError.message ?? "Unable to delete customer.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardPageShell title="Customer" description="Loading...">
        <div className="h-48 animate-pulse rounded-lg bg-surface-hover" />
      </DashboardPageShell>
    );
  }

  if (isError || !data) {
    return (
      <DashboardPageShell title="Customer" description="Not found">
        <p className="text-sm text-danger">Customer not found.</p>
        <PageActions backHref={routes.customers.list} className="mt-6" />
      </DashboardPageShell>
    );
  }

  return (
    <DashboardPageShell
      title={`${data.first_name} ${data.last_name}`}
      description="Customer relationship profile."
    >
      {deleteError ? <p className="mb-4 text-sm text-danger">{deleteError}</p> : null}
      <div className="mb-4 flex justify-end">
        <SecondaryButton variant="danger" disabled={isDeleting} onClick={() => void handleDelete()}>
          {isDeleting ? "Deleting..." : "Delete customer"}
        </SecondaryButton>
      </div>
      <CustomerDetailView customer={data} />
    </DashboardPageShell>
  );
}
