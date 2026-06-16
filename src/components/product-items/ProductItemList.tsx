"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
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
import type { ProductItem } from "@/lib/api/product-items";
import { productItemsApi } from "@/lib/api/product-items";
import { formatCurrency, formatQuantity } from "@/lib/format";
import { buildCrudActionsColumn } from "@/lib/list-table-actions";

const SORT_OPTIONS: SortOption[] = [
  { value: "name", label: "Name" },
  { value: "purchase_price", label: "Purchase price" },
  { value: "cost_per_unit", label: "Cost per unit" },
  { value: "created_at", label: "Created" },
];

export function ProductItemList() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { canManageFinancialRecords } = useAdminPermissions();
  const { confirmDelete, deleteDialog } = useConfirmDelete();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const debouncedSearch = useDebouncedValue(search);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["product-items", page, debouncedSearch, sortBy, sortOrder],
    queryFn: () =>
      productItemsApi.list({
        page,
        page_size: 20,
        search: debouncedSearch || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productItemsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-items"] });
    },
  });

  const columns = useMemo<ColumnDef<ProductItem>[]>(() => {
    const base: ColumnDef<ProductItem>[] = [
      {
        header: "Name",
        accessorKey: "name",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
      },
      {
        header: "Type",
        accessorKey: "item_type.name",
        cell: ({ row }) => row.original.item_type.name,
      },
      {
        header: "Purchase",
        cell: ({ row }) =>
          `${formatCurrency(row.original.purchase_price)} / ${formatQuantity(
            row.original.purchase_quantity,
            row.original.purchase_unit,
          )}`,
      },
      {
        header: "Cost / unit",
        accessorKey: "cost_per_unit",
        cell: ({ row }) => (
          <span>
            {formatCurrency(row.original.cost_per_unit)}
            <span className="text-text-muted"> / {row.original.purchase_unit}</span>
          </span>
        ),
      },
      {
        header: "Status",
        accessorKey: "is_active",
        cell: ({ row }) => <StatusBadge active={row.original.is_active} />,
      },
    ];

    if (canManageFinancialRecords) {
      base.push(
        buildCrudActionsColumn<ProductItem>({
          routes: routes.productItems,
          onDelete: (row) => deleteMutation.mutate(row.id),
          confirmDelete,
          deleteDisabled: deleteMutation.isPending,
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
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search product items..."
        sortBy={sortBy}
        sortOrder={sortOrder}
        sortOptions={SORT_OPTIONS}
        onSortByChange={(value) => {
          setSortBy(value);
          setPage(1);
        }}
        onSortOrderChange={setSortOrder}
        actions={
          <PrimaryLink href={routes.productItems.create}>Add product item</PrimaryLink>
        }
      />

      {isError ? (
        <p className="text-sm text-danger">Unable to load product items.</p>
      ) : (
        <DataTable
          columns={columns}
          data={data?.items ?? []}
          isLoading={isLoading}
          onRowClick={(row) => router.push(routes.productItems.detail(row.id))}
        />
      )}

      {data ? (
        <Pagination
          page={data.page}
          totalPages={data.total_pages}
          total={data.total}
          pageSize={data.page_size}
          onPageChange={setPage}
        />
      ) : null}

      {!isLoading && data?.total === 0 ? (
        <p className="text-center text-sm text-text-secondary">
          No product items yet.{" "}
          <Link
            href={routes.productItems.create}
            className="text-text-primary underline-offset-4 hover:underline"
          >
            Create your first product item
          </Link>
        </p>
      ) : null}
    </div>
  );
}
