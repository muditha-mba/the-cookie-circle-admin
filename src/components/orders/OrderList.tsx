"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { DataTable } from "@/components/data/DataTable";
import { ListToolbar, type SortOption } from "@/components/data/ListToolbar";
import { Pagination } from "@/components/data/Pagination";
import { PrimaryLink } from "@/components/data/PageActions";
import { EnumStatusBadge } from "@/components/ui/EnumStatusBadge";
import { routes } from "@/config/routes";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { useConfirmDelete } from "@/hooks/useConfirmDelete";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { OrderSummary } from "@/lib/api/orders";
import { ordersApi } from "@/lib/api/orders";
import { createTableActionsColumn } from "@/lib/table-actions-column";

function formatEnumLabel(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDeliveryAreaLabel(
  area: OrderSummary["delivery_area"],
): string {
  if (!area) {
    return "—";
  }
  if (area.pickup_only) {
    return "Pickup";
  }
  return area.name;
}

const SORT_OPTIONS: SortOption[] = [
  { value: "order_number", label: "Order number" },
  { value: "scheduled_delivery_date", label: "Scheduled delivery" },
  { value: "requested_delivery_date", label: "Requested delivery" },
  { value: "created_at", label: "Created" },
  { value: "revenue", label: "Revenue" },
  { value: "profit", label: "Profit" },
];

export function OrderList() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { canViewFinancials, canManageRecords } = useAdminPermissions();
  const { confirmDelete, deleteDialog } = useConfirmDelete();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const debouncedSearch = useDebouncedValue(search);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["orders", page, debouncedSearch, sortBy, sortOrder],
    queryFn: () =>
      ordersApi.list({
        page,
        page_size: 20,
        search: debouncedSearch || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      }),
  });

  const deleteMutation = useMutation({
    meta: { successMessage: "Order deleted successfully." },
    mutationFn: (id: string) => ordersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  const sortOptions = useMemo(
    () =>
      SORT_OPTIONS.filter(
        (option) => canViewFinancials || (option.value !== "revenue" && option.value !== "profit"),
      ),
    [canViewFinancials],
  );

  const columns = useMemo<ColumnDef<OrderSummary>[]>(() => {
    const base: ColumnDef<OrderSummary>[] = [
      {
        header: "Order",
        accessorKey: "order_number",
        cell: ({ row }) => <span className="font-medium">{row.original.order_number}</span>,
      },
      { header: "Customer", accessorKey: "customer_name" },
      {
        header: "Scheduled",
        accessorKey: "scheduled_delivery_date",
        cell: ({ row }) => new Date(row.original.scheduled_delivery_date).toLocaleDateString(),
      },
      {
        header: "Requested",
        accessorKey: "requested_delivery_date",
        cell: ({ row }) => new Date(row.original.requested_delivery_date).toLocaleDateString(),
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ row }) => <EnumStatusBadge kind="order" value={row.original.status} />,
      },
      {
        header: "Order type",
        accessorKey: "order_type",
        cell: ({ row }) => (
          <span className="text-text-secondary">{formatEnumLabel(row.original.order_type)}</span>
        ),
      },
      {
        header: "Payment method",
        accessorKey: "payment_method",
        cell: ({ row }) => (
          <span className="text-text-secondary">
            {formatEnumLabel(row.original.payment_method)}
          </span>
        ),
      },
      {
        header: "Delivery area",
        id: "delivery_area",
        cell: ({ row }) => (
          <span className="text-text-secondary">
            {formatDeliveryAreaLabel(row.original.delivery_area)}
          </span>
        ),
      },
    ];

    if (canManageRecords) {
      base.push(
        createTableActionsColumn<OrderSummary>({
          getViewHref: (row) => routes.orders.detail(row.id),
          getEditHref: (row) => routes.orders.edit(row.id),
          onDelete: (row) => deleteMutation.mutate(row.id),
          confirmDelete,
          deleteDisabled: deleteMutation.isPending,
          getDeleteMessage: (row) =>
            `Are you sure you want to delete order ${row.order_number}? This action cannot be undone.`,
        }),
      );
    }

    return base;
  }, [canManageRecords, confirmDelete, deleteMutation]);

  return (
    <div className="space-y-4">
      {deleteDialog}
      <ListToolbar
        search={search}
        onSearchChange={(value) => { setSearch(value); setPage(1); }}
        sortBy={sortBy}
        sortOptions={sortOptions}
        sortOrder={sortOrder}
        onSortByChange={setSortBy}
        onSortOrderChange={setSortOrder}
        actions={<PrimaryLink href={routes.orders.create}>New order</PrimaryLink>}
      />
      {isError ? (
        <p className="text-sm text-danger">Unable to load orders.</p>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={data?.items ?? []}
            isLoading={isLoading}
            onRowClick={(row) => router.push(routes.orders.detail(row.id))}
            emptyMessage="No orders found."
          />
          {data ? (
            <Pagination
              page={data.page}
              totalPages={data.total_pages}
              total={data.total}
              pageSize={data.page_size}
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
