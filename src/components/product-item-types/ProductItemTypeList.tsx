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
import type { ProductItemType } from "@/lib/api/product-item-types";
import { productItemTypesApi } from "@/lib/api/product-item-types";
import { formatDateTime } from "@/lib/format";
import { buildCrudActionsColumn } from "@/lib/list-table-actions";

const SORT_OPTIONS: SortOption[] = [
  { value: "name", label: "Name" },
  { value: "created_at", label: "Created" },
  { value: "is_active", label: "Status" },
];

export function ProductItemTypeList() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { canManageRecords } = useAdminPermissions();
  const { confirmDelete, deleteDialog } = useConfirmDelete();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const debouncedSearch = useDebouncedValue(search);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["product-item-types", page, debouncedSearch, sortBy, sortOrder],
    queryFn: () =>
      productItemTypesApi.list({
        page,
        page_size: 20,
        search: debouncedSearch || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      }),
  });

  const deleteMutation = useMutation({
    meta: { successMessage: "Product item type deleted successfully." },
    mutationFn: (id: string) => productItemTypesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-item-types"] });
    },
  });

  const columns = useMemo<ColumnDef<ProductItemType>[]>(() => {
    const base: ColumnDef<ProductItemType>[] = [
      {
        header: "Name",
        accessorKey: "name",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
      },
      {
        header: "Description",
        accessorKey: "description",
        cell: ({ row }) => (
          <span className="line-clamp-1 text-text-secondary">
            {row.original.description || "—"}
          </span>
        ),
      },
      {
        header: "Status",
        accessorKey: "is_active",
        cell: ({ row }) => <StatusBadge active={row.original.is_active} />,
      },
      {
        header: "Created",
        accessorKey: "created_at",
        cell: ({ row }) => formatDateTime(row.original.created_at),
      },
    ];

    if (canManageRecords) {
      base.push(
        buildCrudActionsColumn<ProductItemType>({
          routes: routes.productItemTypes,
          onDelete: (row) => deleteMutation.mutate(row.id),
          confirmDelete,
          deleteDisabled: deleteMutation.isPending,
        }),
      );
    }

    return base;
  }, [canManageRecords, confirmDelete, deleteMutation]);

  return (
    <div className="space-y-6">
      {deleteDialog}
      <ListToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search item types..."
        sortBy={sortBy}
        sortOrder={sortOrder}
        sortOptions={SORT_OPTIONS}
        onSortByChange={(value) => {
          setSortBy(value);
          setPage(1);
        }}
        onSortOrderChange={setSortOrder}
        actions={
          <PrimaryLink href={routes.productItemTypes.create}>
            Add item type
          </PrimaryLink>
        }
      />

      {isError ? (
        <p className="text-sm text-danger">Unable to load product item types.</p>
      ) : (
        <DataTable
          columns={columns}
          data={data?.items ?? []}
          isLoading={isLoading}
          onRowClick={(row) => router.push(routes.productItemTypes.detail(row.id))}
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
          No item types yet.{" "}
          <Link
            href={routes.productItemTypes.create}
            className="text-text-primary underline-offset-4 hover:underline"
          >
            Create your first item type
          </Link>
        </p>
      ) : null}
    </div>
  );
}
