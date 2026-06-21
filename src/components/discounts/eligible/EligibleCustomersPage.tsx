"use client";

import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";

import { DataTable } from "@/components/data/DataTable";
import { ListToolbar } from "@/components/data/ListToolbar";
import { Pagination } from "@/components/data/Pagination";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { EligibleCustomerItem } from "@/lib/api/discounts";
import { discountsApi } from "@/lib/api/discounts";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { routes } from "@/config/routes";
import Link from "next/link";

export function EligibleCustomersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("earned_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const debouncedSearch = useDebouncedValue(search);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["discounts-eligible", page, debouncedSearch],
    queryFn: () =>
      discountsApi.listEligible({
        page,
        page_size: 20,
        search: debouncedSearch || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      }),
  });

  const columns = useMemo<ColumnDef<EligibleCustomerItem>[]>(() => [
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
      header: "Earned",
      cell: ({ row }) => formatDateTime(row.original.earned_at),
    },
    {
      header: "Expires",
      cell: ({ row }) =>
        row.original.expires_at ? formatDateTime(row.original.expires_at) : "Never",
    },
  ], []);

  return (
    <DashboardPageShell
      title="Eligible Customers"
      description="Customers with an active discount grant that will apply on their next order."
    >
      <ListToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search customers..."
        sortBy={sortBy}
        sortOrder={sortOrder}
        sortOptions={[{ value: "earned_at", label: "Date earned" }]}
        onSortByChange={(value) => { setSortBy(value); setPage(1); }}
        onSortOrderChange={setSortOrder}
      />

      {isError ? (
        <p className="text-sm text-danger">Unable to load eligible customers.</p>
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
          No customers with active discount grants.
        </p>
      ) : null}
    </DashboardPageShell>
  );
}
