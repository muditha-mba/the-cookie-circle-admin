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
import type { ProductSummary } from "@/lib/api/products";
import { productsApi } from "@/lib/api/products";
import { formatCount, formatCurrency } from "@/lib/format";
import { createTableActionsColumn } from "@/lib/table-actions-column";

const SORT_OPTIONS: SortOption[] = [
  { value: "name", label: "Name" },
  { value: "selling_price", label: "Selling price" },
  { value: "yield_quantity", label: "Yield" },
  { value: "created_at", label: "Created" },
];

function unitSellingPrice(sellingPrice: string, yieldQuantity: string): number | null {
  const selling = Number(sellingPrice);
  const yieldQty = Number(yieldQuantity);
  if (Number.isNaN(selling) || Number.isNaN(yieldQty) || yieldQty <= 0) {
    return null;
  }
  return selling / yieldQty;
}

export function ProductList() {
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
    queryKey: ["products", page, debouncedSearch, sortBy, sortOrder],
    queryFn: () =>
      productsApi.list({
        page,
        page_size: 20,
        search: debouncedSearch || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const sortOptions = useMemo(
    () =>
      SORT_OPTIONS.filter(
        (option) => canViewFinancials || option.value !== "selling_price",
      ),
    [canViewFinancials],
  );

  const columns = useMemo<ColumnDef<ProductSummary>[]>(() => {
    const base: ColumnDef<ProductSummary>[] = [
      {
        header: "Name",
        accessorKey: "name",
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      {
        header: "Yield",
        accessorKey: "yield_quantity",
        cell: ({ row }) => (
          <span className="tabular-nums">{formatCount(row.original.yield_quantity)}</span>
        ),
      },
      {
        header: "Status",
        accessorKey: "is_active",
        cell: ({ row }) => <StatusBadge active={row.original.is_active} />,
      },
    ];

    if (canViewFinancials) {
      base.splice(1, 0, {
        header: "Selling price",
        accessorKey: "selling_price",
        cell: ({ row }) => formatCurrency(row.original.selling_price),
      });
      base.splice(2, 0, {
        header: "Price per item",
        id: "price_per_item",
        cell: ({ row }) => {
          const unitPrice = unitSellingPrice(
            row.original.selling_price,
            row.original.yield_quantity,
          );
          return unitPrice == null ? "—" : formatCurrency(unitPrice);
        },
      });
      base.splice(3, 0, {
        header: "Buffer",
        accessorKey: "buffer_amount",
        cell: ({ row }) => formatCurrency(row.original.buffer_amount),
      });
    }

    if (canManageRecords) {
      base.push(
        createTableActionsColumn<ProductSummary>({
          getViewHref: (row) => routes.products.detail(row.id),
          getEditHref: (row) => routes.products.edit(row.id),
          onDelete: (row) => deleteMutation.mutate(row.id),
          confirmDelete,
          deleteDisabled: deleteMutation.isPending,
          getDeleteMessage: (row) =>
            `Are you sure you want to delete "${row.name}"? This action cannot be undone.`,
        }),
      );
    }

    return base;
  }, [canManageRecords, canViewFinancials, confirmDelete, deleteMutation]);

  return (
    <div className="space-y-6">
      {deleteDialog}
      <ListToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search products..."
        sortBy={sortBy}
        sortOrder={sortOrder}
        sortOptions={sortOptions}
        onSortByChange={(value) => {
          setSortBy(value);
          setPage(1);
        }}
        onSortOrderChange={setSortOrder}
        actions={<PrimaryLink href={routes.products.create}>Add product</PrimaryLink>}
      />

      {isError ? (
        <p className="text-sm text-danger">Unable to load products.</p>
      ) : (
        <DataTable
          columns={columns}
          data={data?.items ?? []}
          isLoading={isLoading}
          onRowClick={(row) => router.push(routes.products.detail(row.id))}
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
          No products yet.{" "}
          <Link
            href={routes.products.create}
            className="text-text-primary underline-offset-4 hover:underline"
          >
            Create your first product
          </Link>
        </p>
      ) : null}
    </div>
  );
}
