"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { OrderDetailView } from "@/components/orders/OrderDetailView";
import { PageActions, PrimaryLink, SecondaryButton } from "@/components/data/PageActions";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { routes } from "@/config/routes";
import { useConfirmDelete } from "@/hooks/useConfirmDelete";
import { ordersApi } from "@/lib/api/orders";
import { cacheEntityRemove } from "@/lib/query/mutation-cache";
import { notifyActionError, notifyActionSuccess } from "@/lib/forms/feedback";

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { confirmDelete, deleteDialog, isConfirming } = useConfirmDelete();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["orders", params.id],
    queryFn: () => ordersApi.get(params.id),
    enabled: Boolean(params.id),
  });

  const handleDelete = () => {
    if (!data) {
      return;
    }

    confirmDelete({
      message: `Are you sure you want to delete order ${data.order_number}? This action cannot be undone.`,
      onConfirm: async () => {
        setDeleteError(null);
        try {
          await ordersApi.delete(data.id);
          cacheEntityRemove(queryClient, ["orders", data.id], ["orders"]);
          notifyActionSuccess("Order deleted successfully.");
          router.push(routes.orders.list);
        } catch (err) {
      notifyActionError(err, "Unable to delete order.", setDeleteError);
    }
      },
    });
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
      {deleteDialog}
      <PageActions backHref={routes.orders.list} className="mb-6">
        <PrimaryLink href={routes.orders.edit(data.id)}>Edit</PrimaryLink>
        {data.customer_review ? (
          <PrimaryLink href={routes.reviews.detail(data.customer_review.id)}>
            View review
          </PrimaryLink>
        ) : null}
        <SecondaryButton variant="danger" disabled={isConfirming} onClick={handleDelete}>
          {isConfirming ? "Deleting..." : "Delete"}
        </SecondaryButton>
      </PageActions>

      {deleteError ? <p className="mb-4 text-sm text-danger">{deleteError}</p> : null}

      <OrderDetailView order={data} />
    </DashboardPageShell>
  );
}
