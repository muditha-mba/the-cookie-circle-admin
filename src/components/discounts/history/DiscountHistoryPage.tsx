"use client";

import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";

import { DataTable } from "@/components/data/DataTable";
import { ListToolbar } from "@/components/data/ListToolbar";
import { Pagination } from "@/components/data/Pagination";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { DiscountHistoryItem } from "@/lib/api/discounts";
import { discountsApi } from "@/lib/api/discounts";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { routes } from "@/config/routes";
import Link from "next/link";

const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  used: "Used",
  expired: "Expired",
  revoked: "Revoked",
};

const STATUS_CLASS: Record<string, string> = {
  active: "bg-success/10 text-success",
  used: "bg-primary/10 text-primary",
  expired: "bg-text-muted/10 text-text-muted",
  revoked: "bg-danger/10 text-danger",
};

export function DiscountHistoryPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("earned_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const debouncedSearch = useDebouncedValue(search);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["discounts-history", page, debouncedSearch],
    queryFn: () =>
      discountsApi.listHistory({
        page,
        page_size: 25,
        search: debouncedSearch || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      }),
  });

  const columns = useMemo<ColumnDef<DiscountHistoryItem>[]>(() => [
    {
      header: "Customer",
      cell: ({ row }) => (
        <div>
          <Link
            href={routes.customers.detail(row.original.customer_id)}
            className="font-medium text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {row.original.customer_name}
          </Link>
          <p className="text-xs text-text-muted">{row.original.customer_email}</p>
        </div>
      ),
    },
    {
      header: "Discount",
      cell: ({ row }) =>
        row.original.discount_type === "percentage"
          ? `${row.original.discount_value}%`
          : `Rs. ${formatCurrency(row.original.discount_value)}`,
    },
    {
      header: "Source",
      cell: ({ row }) => (
        <span className="capitalize">{row.original.source}</span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASS[row.original.status] ?? ""}`}
        >
          {STATUS_LABEL[row.original.status] ?? row.original.status}
        </span>
      ),
    },
    {
      header: "Earned",
      cell: ({ row }) => formatDateTime(row.original.earned_at),
    },
    {
      header: "Used",
      cell: ({ row }) =>
        row.original.used_at ? formatDateTime(row.original.used_at) : "—",
    },
    {
      header: "Revoked / Notes",
      cell: ({ row }) =>
        row.original.revoked_at
          ? `${formatDateTime(row.original.revoked_at)}${row.original.revoke_reason ? ` — ${row.original.revoke_reason}` : ""}`
          : "—",
    },
  ], []);

  return (
    <DashboardPageShell
      title="Discount History"
      description="All discount grants across all customers and statuses."
    >
      <ListToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search by customer..."
        sortBy={sortBy}
        sortOrder={sortOrder}
        sortOptions={[
          { value: "earned_at", label: "Date earned" },
          { value: "status", label: "Status" },
        ]}
        onSortByChange={(value) => { setSortBy(value); setPage(1); }}
        onSortOrderChange={setSortOrder}
      />

      {isError ? (
        <p className="text-sm text-danger">Unable to load discount history.</p>
      ) : (
        <DataTable
          columns={columns}
          data={data?.items ?? []}
          isLoading={isLoading}
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
          No discount history yet.
        </p>
      ) : null}
    </DashboardPageShell>
  );
}
