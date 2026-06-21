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
import type { DiscountRule } from "@/lib/api/discount-rules";
import { discountRulesApi } from "@/lib/api/discount-rules";
import { formatDateTime } from "@/lib/format";
import { buildCrudActionsColumn } from "@/lib/list-table-actions";
import { routes } from "@/config/routes";

const SORT_OPTIONS: SortOption[] = [
  { value: "priority", label: "Priority" },
  { value: "name", label: "Name" },
  { value: "created_at", label: "Created" },
];

const QUERY_KEY = "discount-rules";

export function DiscountRuleListPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isSuperAdmin } = useAdminPermissions();
  const { confirmDelete, deleteDialog } = useConfirmDelete();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("priority");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const debouncedSearch = useDebouncedValue(search);

  const { data, isLoading, isError } = useQuery({
    queryKey: [QUERY_KEY, page, debouncedSearch, sortBy, sortOrder],
    queryFn: () =>
      discountRulesApi.list({
        page,
        page_size: 20,
        search: debouncedSearch || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      }),
  });

  const deleteMutation = useMutation({
    meta: { successMessage: "Discount rule deleted successfully." },
    mutationFn: (id: string) => discountRulesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  const columns = useMemo<ColumnDef<DiscountRule>[]>(() => {
    const base: ColumnDef<DiscountRule>[] = [
      {
        header: "Name",
        accessorKey: "name",
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">{row.original.name}</span>
        ),
      },
      {
        header: "Type",
        accessorKey: "rule_type",
        cell: ({ row }) => (
          <span className="rounded bg-surface-hover px-2 py-0.5 text-xs font-medium text-text-secondary">
            {row.original.rule_type.replace(/_/g, " ")}
          </span>
        ),
      },
      {
        header: "Priority",
        accessorKey: "priority",
        cell: ({ row }) => row.original.priority,
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

    if (isSuperAdmin) {
      base.push(
        buildCrudActionsColumn<DiscountRule>({
          routes: {
            detail: routes.discounts.rules.detail,
            edit: routes.discounts.rules.edit,
          },
          onDelete: (row) => deleteMutation.mutate(row.id),
          confirmDelete,
          deleteDisabled: deleteMutation.isPending,
        }),
      );
    }

    return base;
  }, [isSuperAdmin, confirmDelete, deleteMutation]);

  return (
    <DashboardPageShell
      title="Discount Rules"
      description="Configure rules that automatically grant discounts to eligible customers."
    >
      {deleteDialog}
      <ListToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search rules..."
        sortBy={sortBy}
        sortOrder={sortOrder}
        sortOptions={SORT_OPTIONS}
        onSortByChange={(value) => {
          setSortBy(value);
          setPage(1);
        }}
        onSortOrderChange={setSortOrder}
        actions={
          isSuperAdmin ? (
            <PrimaryLink href={routes.discounts.rules.create}>Add rule</PrimaryLink>
          ) : null
        }
      />

      {isError ? (
        <p className="text-sm text-danger">Unable to load discount rules.</p>
      ) : (
        <DataTable
          columns={columns}
          data={data?.items ?? []}
          isLoading={isLoading}
          onRowClick={(row) => router.push(routes.discounts.rules.detail(row.id))}
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
          No discount rules yet.{" "}
          <Link
            href={routes.discounts.rules.create}
            className="text-text-primary underline-offset-4 hover:underline"
          >
            Create the first rule
          </Link>
        </p>
      ) : null}
    </DashboardPageShell>
  );
}
