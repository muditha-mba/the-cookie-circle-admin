"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import type { ChargeModuleConfig } from "@/config/charge-modules.client";
import { DataTable } from "@/components/data/DataTable";
import { ListToolbar, type SortOption } from "@/components/data/ListToolbar";
import { Pagination } from "@/components/data/Pagination";
import { PrimaryLink } from "@/components/data/PageActions";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { useConfirmDelete } from "@/hooks/useConfirmDelete";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { Charge } from "@/lib/api/charge-types";
import { formatChargeAmount, formatDateTime } from "@/lib/format";
import { formatChargeApplicability } from "@/lib/charge-applicability";
import { buildCrudActionsColumn } from "@/lib/list-table-actions";

const SORT_OPTIONS: SortOption[] = [
  { value: "name", label: "Name" },
  { value: "charge_type", label: "Type" },
  { value: "amount", label: "Amount" },
  { value: "created_at", label: "Created" },
];

type ChargeListProps = {
  module: ChargeModuleConfig;
};

export function ChargeList({ module }: ChargeListProps) {
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
    queryKey: [module.queryKey, page, debouncedSearch, sortBy, sortOrder],
    queryFn: () =>
      module.api.list({
        page,
        page_size: 20,
        search: debouncedSearch || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      }),
  });

  const deleteMutation = useMutation({
    meta: { successMessage: "Charge deleted successfully." },
    mutationFn: (id: string) => module.api.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [module.queryKey] });
    },
  });

  const columns = useMemo<ColumnDef<Charge>[]>(() => {
    const base: ColumnDef<Charge>[] = [
      {
        header: "Name",
        accessorKey: "name",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
      },
      {
        header: "Type",
        accessorKey: "charge_type",
        cell: ({ row }) => (
          <span className="capitalize">{row.original.charge_type}</span>
        ),
      },
      {
        header: "Amount",
        accessorKey: "amount",
        cell: ({ row }) =>
          formatChargeAmount(row.original.amount, row.original.charge_type),
      },
      {
        header: "Applies to",
        accessorKey: "applicability",
        cell: ({ row }) => formatChargeApplicability(row.original.applicability),
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

    if (canManageFinancialRecords) {
      base.push(
        buildCrudActionsColumn<Charge>({
          routes: module.routes,
          onDelete: (row) => deleteMutation.mutate(row.id),
          confirmDelete,
          deleteDisabled: deleteMutation.isPending,
        }),
      );
    }

    return base;
  }, [canManageFinancialRecords, confirmDelete, deleteMutation, module]);

  return (
    <div className="space-y-6">
      {deleteDialog}
      <ListToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder={`Search ${module.title.toLowerCase()}...`}
        sortBy={sortBy}
        sortOrder={sortOrder}
        sortOptions={SORT_OPTIONS}
        onSortByChange={(value) => {
          setSortBy(value);
          setPage(1);
        }}
        onSortOrderChange={setSortOrder}
        actions={
          <PrimaryLink href={module.routes.create}>
            Add {module.singular.toLowerCase()}
          </PrimaryLink>
        }
      />

      {isError ? (
        <p className="text-sm text-danger">Unable to load {module.title.toLowerCase()}.</p>
      ) : (
        <DataTable
          columns={columns}
          data={data?.items ?? []}
          isLoading={isLoading}
          onRowClick={(row) => router.push(module.routes.detail(row.id))}
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
          No records yet.{" "}
          <Link
            href={module.routes.create}
            className="text-text-primary underline-offset-4 hover:underline"
          >
            Create your first {module.singular.toLowerCase()}
          </Link>
        </p>
      ) : null}
    </div>
  );
}
