"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { DataTable } from "@/components/data/DataTable";
import { ListToolbar, type SortOption } from "@/components/data/ListToolbar";
import { Pagination } from "@/components/data/Pagination";
import { PrimaryLink } from "@/components/data/PageActions";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { useConfirmDelete } from "@/hooks/useConfirmDelete";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { routes } from "@/config/routes";
import type { PurchaseReceiptSummary } from "@/lib/api/purchase-receipts";
import { purchaseReceiptsApi } from "@/lib/api/purchase-receipts";
import { formatCurrency, formatDate } from "@/lib/format";
import { createTableActionsColumn } from "@/lib/table-actions-column";

const SORT_OPTIONS: SortOption[] = [
  { value: "receipt_date", label: "Date" },
  { value: "total_amount", label: "Total" },
  { value: "status", label: "Status" },
  { value: "created_at", label: "Created" },
];

export function PurchaseReceiptList() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { canManageFinancialRecords } = useAdminPermissions();
  const { confirmDelete, deleteDialog } = useConfirmDelete();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("receipt_date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const debouncedSearch = useDebouncedValue(search);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["purchase-receipts", page, debouncedSearch, sortBy, sortOrder],
    queryFn: () =>
      purchaseReceiptsApi.list({
        page,
        page_size: 20,
        search: debouncedSearch || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      }),
  });

  const deleteMutation = useMutation({
    meta: { successMessage: "Purchase receipt deleted successfully." },
    mutationFn: (id: string) => purchaseReceiptsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-receipts"] });
    },
  });

  const columns = useMemo<ColumnDef<PurchaseReceiptSummary>[]>(() => {
    const base: ColumnDef<PurchaseReceiptSummary>[] = [
      {
        header: "Date",
        accessorKey: "receipt_date",
        cell: ({ row }) => formatDate(row.original.receipt_date),
      },
      {
        header: "Supplier",
        accessorKey: "supplier.supplier_name",
        cell: ({ row }) => row.original.supplier.supplier_name,
      },
      {
        header: "Reference",
        accessorKey: "reference_number",
        cell: ({ row }) => row.original.reference_number ?? "—",
      },
      {
        header: "Total",
        accessorKey: "total_amount",
        cell: ({ row }) => formatCurrency(row.original.total_amount),
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ row }) => (row.original.status === "confirmed" ? "Confirmed" : "Draft"),
      },
      {
        header: "Bill",
        accessorKey: "has_bill",
        cell: ({ row }) => (row.original.has_bill ? "Attached" : "—"),
      },
    ];

    if (canManageFinancialRecords) {
      base.push(
        createTableActionsColumn<PurchaseReceiptSummary>({
          getViewHref: (row) => routes.inventory.receipts.detail(row.id),
          getEditHref: (row) =>
            row.status === "draft" ? routes.inventory.receipts.edit(row.id) : undefined,
          onDelete: (row) => {
            void deleteMutation.mutateAsync(row.id);
          },
          canDelete: (row) => row.status === "draft",
          confirmDelete,
          getDeleteMessage: () => "Delete this draft purchase receipt?",
        }),
      );
    }

    return base;
  }, [canManageFinancialRecords, confirmDelete, deleteMutation]);

  return (
    <div className="space-y-6">
      {deleteDialog}
      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search receipts…"
        sortBy={sortBy}
        sortOptions={SORT_OPTIONS}
        sortOrder={sortOrder}
        onSortByChange={setSortBy}
        onSortOrderChange={setSortOrder}
        actions={
          canManageFinancialRecords ? (
            <PrimaryLink href={routes.inventory.receipts.create}>New receipt</PrimaryLink>
          ) : undefined
        }
      />
      {isError ? (
        <p className="text-sm text-danger">Unable to load purchase receipts.</p>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={data?.items ?? []}
            isLoading={isLoading}
            emptyMessage="No purchase receipts yet."
            onRowClick={
              canManageFinancialRecords
                ? (row) => router.push(routes.inventory.receipts.detail(row.id))
                : undefined
            }
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
