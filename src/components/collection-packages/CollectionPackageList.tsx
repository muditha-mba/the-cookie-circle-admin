"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { CollectionPackageBadge } from "@/components/collections/CollectionPackageBadge";
import { DataTable } from "@/components/data/DataTable";
import { ListToolbar, type SortOption } from "@/components/data/ListToolbar";
import { Pagination } from "@/components/data/Pagination";
import { PrimaryLink } from "@/components/data/PageActions";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { routes } from "@/config/routes";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { useConfirmDelete } from "@/hooks/useConfirmDelete";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { CollectionPackage } from "@/lib/api/collection-packages";
import { collectionPackagesApi } from "@/lib/api/collection-packages";
import { buildCrudActionsColumn } from "@/lib/list-table-actions";

const SORT_OPTIONS: SortOption[] = [
  { value: "name", label: "Name" },
  { value: "code", label: "Code" },
  { value: "badge_tone", label: "Badge tone" },
  { value: "created_at", label: "Created" },
];

export function CollectionPackageList() {
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
    queryKey: ["collection-packages", page, debouncedSearch, sortBy, sortOrder],
    queryFn: () =>
      collectionPackagesApi.list({
        page,
        page_size: 20,
        search: debouncedSearch || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => collectionPackagesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collection-packages"] });
    },
  });

  const columns = useMemo<ColumnDef<CollectionPackage>[]>(() => {
    const base: ColumnDef<CollectionPackage>[] = [
      {
        header: "Name",
        accessorKey: "name",
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      {
        header: "Code",
        accessorKey: "code",
      },
      {
        header: "Badge",
        accessorKey: "badge_tone",
        cell: ({ row }) => (
          <CollectionPackageBadge
            name={row.original.name}
            tone={row.original.badge_tone}
          />
        ),
      },
      {
        header: "Status",
        accessorKey: "is_active",
        cell: ({ row }) => <StatusBadge active={row.original.is_active} />,
      },
    ];

    if (canManageRecords) {
      base.push(
        buildCrudActionsColumn<CollectionPackage>({
          routes: routes.collectionPackages,
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
        searchPlaceholder="Search collection packages..."
        sortBy={sortBy}
        sortOrder={sortOrder}
        sortOptions={SORT_OPTIONS}
        onSortByChange={(value) => {
          setSortBy(value);
          setPage(1);
        }}
        onSortOrderChange={setSortOrder}
        actions={<PrimaryLink href={routes.collectionPackages.create}>Add package</PrimaryLink>}
      />

      {isError ? (
        <p className="text-sm text-danger">Unable to load collection packages.</p>
      ) : (
        <DataTable
          columns={columns}
          data={data?.items ?? []}
          isLoading={isLoading}
          onRowClick={(row) => router.push(routes.collectionPackages.detail(row.id))}
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
          No collection packages yet.{" "}
          <Link
            href={routes.collectionPackages.create}
            className="text-text-primary underline-offset-4 hover:underline"
          >
            Create your first package
          </Link>
        </p>
      ) : null}
    </div>
  );
}
