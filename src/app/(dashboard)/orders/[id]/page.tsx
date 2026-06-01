"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { OrderDetailView } from "@/components/orders/OrderDetailView";
import { PageActions, PrimaryLink, SecondaryButton } from "@/components/data/PageActions";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { routes } from "@/config/routes";
import type { ApiError } from "@/lib/api/types";
import { ordersApi } from "@/lib/api/orders";
import { cacheEntityRemove } from "@/lib/query/mutation-cache";

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["orders", params.id],
    queryFn: () => ordersApi.get(params.id),
    enabled: Boolean(params.id),
  });

  const handleDelete = async () => {
    if (!data || !window.confirm(`Delete order ${data.order_number}?`)) {
      return;
    }
    setDeleteError(null);
    setIsDeleting(true);
    try {
      await ordersApi.delete(data.id);
      cacheEntityRemove(queryClient, ["orders", data.id], ["orders"]);
      router.push(routes.orders.list);
    } catch (err) {
      const apiError = err as ApiError;
      setDeleteError(apiError.message ?? "Unable to delete order.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardPageShell title="Order" description="Loading...">
        <div className="h-48 animate-pulse rounded-lg bg-surface-hover" />
      </DashboardPageShell>
    );
  }

  if (isError || !data) {
    return (
      <DashboardPageShell title="Order" description="Not found">
        <p className="text-sm text-danger">Order not found.</p>
        <PageActions backHref={routes.orders.list} className="mt-6" />
      </DashboardPageShell>
    );
  }

  return (
    <DashboardPageShell
      title={data.order_number}
      description="Order detail with snapshots and financial summary."
    >
      <PageActions backHref={routes.orders.list} className="mb-6">
        <PrimaryLink href={routes.orders.edit(data.id)}>Edit</PrimaryLink>
        <SecondaryButton variant="danger" disabled={isDeleting} onClick={() => void handleDelete()}>
          {isDeleting ? "Deleting..." : "Delete"}
        </SecondaryButton>
      </PageActions>

      {deleteError ? <p className="mb-4 text-sm text-danger">{deleteError}</p> : null}

      <OrderDetailView order={data} />
    </DashboardPageShell>
  );
}
