"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { DataTable } from "@/components/data/DataTable";
import { ListToolbar, type SortOption } from "@/components/data/ListToolbar";
import { Pagination } from "@/components/data/Pagination";
import { PrimaryLink } from "@/components/data/PageActions";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { routes } from "@/config/routes";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { useConfirmDelete } from "@/hooks/useConfirmDelete";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { DeliveryArea } from "@/lib/api/delivery-areas";
import { deliveryAreasApi } from "@/lib/api/delivery-areas";
import { formatCurrency } from "@/lib/format";
import { buildCrudActionsColumn } from "@/lib/list-table-actions";

const SORT_OPTIONS: SortOption[] = [
  { value: "name", label: "Name" },
  { value: "created_at", label: "Created" },
  { value: "is_active", label: "Status" },
];

export function DeliveryAreaList() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { canManageRecords } = useAdminPermissions();
  const { confirmDelete, deleteDialog } = useConfirmDelete();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const debouncedSearch = useDebouncedValue(search);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["delivery-areas", page, debouncedSearch, sortBy, sortOrder],
    queryFn: () =>
      deliveryAreasApi.list({
        page,
        page_size: 20,
        search: debouncedSearch || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      }),
  });

  const deleteMutation = useMutation({
    meta: { successMessage: "Delivery area deleted successfully." },
    mutationFn: (id: string) => deliveryAreasApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery-areas"] });
    },
  });

  const columns = useMemo<ColumnDef<DeliveryArea>[]>(() => {
    const base: ColumnDef<DeliveryArea>[] = [
      { header: "Name", accessorKey: "name", cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      )},
      {
        header: "Fee override",
        accessorKey: "delivery_fee_override",
        cell: ({ row }) =>
          row.original.delivery_fee_override != null
            ? formatCurrency(row.original.delivery_fee_override)
            : "—",
      },
      {
        header: "Pickup only",
        accessorKey: "pickup_only",
        cell: ({ row }) => (row.original.pickup_only ? "Yes" : "No"),
      },
      {
        header: "Status",
        accessorKey: "is_active",
        cell: ({ row }) => <StatusBadge active={row.original.is_active} />,
      },
    ];

    if (canManageRecords) {
      base.push(
        buildCrudActionsColumn<DeliveryArea>({
          routes: routes.deliveryAreas,
          onDelete: (row) => deleteMutation.mutate(row.id),
          confirmDelete,
          deleteDisabled: deleteMutation.isPending,
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
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        sortBy={sortBy}
        sortOptions={SORT_OPTIONS}
        sortOrder={sortOrder}
        onSortByChange={setSortBy}
        onSortOrderChange={setSortOrder}
        actions={<PrimaryLink href={routes.deliveryAreas.create}>New delivery area</PrimaryLink>}
      />

      {isError ? (
        <p className="text-sm text-danger">Unable to load delivery areas.</p>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={data?.items ?? []}
            isLoading={isLoading}
            onRowClick={(row) => router.push(routes.deliveryAreas.detail(row.id))}
            emptyMessage="No delivery areas found."
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
