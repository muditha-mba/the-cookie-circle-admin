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
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { useConfirmDelete } from "@/hooks/useConfirmDelete";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { TaxCharge } from "@/lib/api/charge-types";
import { taxChargesApi } from "@/lib/api/tax-charges";
import { formatChargeAmount, formatDateTime } from "@/lib/format";
import { buildCrudActionsColumn } from "@/lib/list-table-actions";
import { taxChargeModule } from "@/config/charge-modules";

const SORT_OPTIONS: SortOption[] = [
  { value: "name", label: "Name" },
  { value: "created_at", label: "Created" },
];

export function TaxChargeListPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { canManageFinancialRecords } = useAdminPermissions();
  const { confirmDelete, deleteDialog } = useConfirmDelete();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const debouncedSearch = useDebouncedValue(search);

  const { data, isLoading, isError } = useQuery({
    queryKey: [taxChargeModule.queryKey, page, debouncedSearch, sortBy, sortOrder],
    queryFn: () =>
      taxChargesApi.list({
        page,
        page_size: 20,
        search: debouncedSearch || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      }),
  });

  const deleteMutation = useMutation({
    meta: { successMessage: "Tax charge deleted successfully." },
    mutationFn: (id: string) => taxChargesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [taxChargeModule.queryKey] });
    },
  });

  const columns = useMemo<ColumnDef<TaxCharge>[]>(() => {
    const base: ColumnDef<TaxCharge>[] = [
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
        header: "Applied to orders",
        accessorKey: "is_active",
        cell: ({ row }) => (
          <StatusBadge active={row.original.is_active} />
        ),
      },
      {
        header: "Created",
        accessorKey: "created_at",
        cell: ({ row }) => formatDateTime(row.original.created_at),
      },
    ];

    if (canManageFinancialRecords) {
      base.push(
        buildCrudActionsColumn<TaxCharge>({
          routes: taxChargeModule.routes,
          onDelete: (row) => deleteMutation.mutate(row.id),
          confirmDelete,
          deleteDisabled: deleteMutation.isPending,
        }),
      );
    }

    return base;
  }, [canManageFinancialRecords, confirmDelete, deleteMutation]);

  return (
    <DashboardPageShell
      title={taxChargeModule.title}
      description={taxChargeModule.description}
    >
      {deleteDialog}
      <ListToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search tax charges..."
        sortBy={sortBy}
        sortOrder={sortOrder}
        sortOptions={SORT_OPTIONS}
        onSortByChange={(value) => {
          setSortBy(value);
          setPage(1);
        }}
        onSortOrderChange={setSortOrder}
        actions={
          <PrimaryLink href={taxChargeModule.routes.create}>Add tax charge</PrimaryLink>
        }
      />

      {isError ? (
        <p className="text-sm text-danger">Unable to load tax charges.</p>
      ) : (
        <DataTable
          columns={columns}
          data={data?.items ?? []}
          isLoading={isLoading}
          onRowClick={(row) => router.push(taxChargeModule.routes.detail(row.id))}
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
          No tax charges yet.{" "}
          <Link
            href={taxChargeModule.routes.create}
            className="text-text-primary underline-offset-4 hover:underline"
          >
            Create the first one
          </Link>
        </p>
      ) : null}
    </DashboardPageShell>
  );
}
