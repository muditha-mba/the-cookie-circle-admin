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
import { CollectionPackageBadge } from "@/components/collections/CollectionPackageBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { routes } from "@/config/routes";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { useConfirmDelete } from "@/hooks/useConfirmDelete";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { CollectionSummary } from "@/lib/api/collections";
import { collectionPackagesApi } from "@/lib/api/collection-packages";
import { collectionsApi } from "@/lib/api/collections";
import { formatCount, formatCurrency } from "@/lib/format";
import { createTableActionsColumn } from "@/lib/table-actions-column";

const SORT_OPTIONS: SortOption[] = [
  { value: "name", label: "Name" },
  { value: "package", label: "Package" },
  { value: "package_size", label: "Package size" },
  { value: "created_at", label: "Created" },
];

export function CollectionList() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { canViewFinancials, canManageRecords } = useAdminPermissions();
  const { confirmDelete, deleteDialog } = useConfirmDelete();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [packageId, setPackageId] = useState<string>("all");
  const debouncedSearch = useDebouncedValue(search);

  const { data: packageData } = useQuery({
    queryKey: ["collection-packages", "all"],
    queryFn: () =>
      collectionPackagesApi.list({
        page: 1,
        page_size: 100,
        sort_by: "name",
        sort_order: "asc",
      }),
  });
  const packageMap = useMemo(
    () =>
      new Map(
        (packageData?.items ?? []).map((pkg) => [pkg.id, { name: pkg.name, tone: pkg.badge_tone }]),
      ),
    [packageData?.items],
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: ["collections", page, debouncedSearch, sortBy, sortOrder, packageId],
    queryFn: () =>
      collectionsApi.list({
        page,
        page_size: 20,
        search: debouncedSearch || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        package_id: packageId === "all" ? undefined : packageId,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => collectionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });

  const columns = useMemo<ColumnDef<CollectionSummary>[]>(() => {
    const base: ColumnDef<CollectionSummary>[] = [
      {
        header: "Name",
        accessorKey: "name",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
      },
      {
        header: "Package",
        accessorKey: "package_id",
        cell: ({ row }) => {
          const pkg = packageMap.get(row.original.package_id);
          return <CollectionPackageBadge name={pkg?.name} tone={pkg?.tone} />;
        },
      },
      {
        header: "Size",
        accessorKey: "package_size",
        cell: ({ row }) => `${formatCount(row.original.package_size)} cookies`,
      },
      ...(canViewFinancials
        ? [
            {
              header: "Fee",
              accessorKey: "package_fee",
              cell: ({ row }: { row: { original: CollectionSummary } }) =>
                formatCurrency(row.original.package_fee),
            } satisfies ColumnDef<CollectionSummary>,
          ]
        : []),
      {
        header: "Status",
        accessorKey: "is_active",
        cell: ({ row }) => <StatusBadge active={row.original.is_active} />,
      },
      {
        header: "Created",
        accessorKey: "created_at",
        cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
      },
    ];

    if (canManageRecords) {
      base.push(
        createTableActionsColumn<CollectionSummary>({
          getViewHref: (row) => routes.collections.detail(row.id),
          getEditHref: (row) => routes.collections.edit(row.id),
          onDelete: (row) => deleteMutation.mutate(row.id),
          confirmDelete,
          deleteDisabled: deleteMutation.isPending,
          getDeleteMessage: (row) =>
            `Are you sure you want to delete "${row.name}"? This action cannot be undone.`,
        }),
      );
    }

    return base;
  }, [canManageRecords, canViewFinancials, confirmDelete, deleteMutation, packageMap]);

  return (
    <div className="space-y-4">
      {deleteDialog}
      <ListToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search collections..."
        sortBy={sortBy}
        sortOrder={sortOrder}
        sortOptions={SORT_OPTIONS}
        onSortByChange={(value) => {
          setSortBy(value);
          setPage(1);
        }}
        onSortOrderChange={setSortOrder}
        actions={
          <div className="flex items-center gap-3">
            <select
              value={packageId}
              onChange={(event) => {
                setPackageId(event.target.value);
                setPage(1);
              }}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info"
              aria-label="Filter by package"
            >
              <option value="all">All packages</option>
              {(packageData?.items ?? []).map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name}
                </option>
              ))}
            </select>
            <PrimaryLink href={routes.collections.create}>Add collection</PrimaryLink>
          </div>
        }
      />

      {isError ? (
        <p className="text-sm text-danger">Unable to load collections.</p>
      ) : (
        <DataTable
          columns={columns}
          data={data?.items ?? []}
          isLoading={isLoading}
          onRowClick={(row) => router.push(routes.collections.detail(row.id))}
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
          No collections yet.{" "}
          <Link
            href={routes.collections.create}
            className="text-text-primary underline-offset-4 hover:underline"
          >
            Create your first collection
          </Link>
        </p>
      ) : null}
    </div>
  );
}
