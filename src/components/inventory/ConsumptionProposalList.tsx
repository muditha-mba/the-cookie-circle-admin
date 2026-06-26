"use client";

import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { DataTable } from "@/components/data/DataTable";
import { ListToolbar, type SortOption } from "@/components/data/ListToolbar";
import { Pagination } from "@/components/data/Pagination";
import { routes } from "@/config/routes";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type {
  ConsumptionProposalStatus,
  ConsumptionProposalSummary,
} from "@/lib/api/consumption-proposals";
import { consumptionProposalsApi } from "@/lib/api/consumption-proposals";
import { formatDate, formatDateTime } from "@/lib/format";

const SORT_OPTIONS: SortOption[] = [
  { value: "delivery_date", label: "Delivery date" },
  { value: "created_at", label: "Created" },
  { value: "status", label: "Status" },
];

const STATUS_OPTIONS: { value: ConsumptionProposalStatus | ""; label: string }[] = [
  { value: "pending_review", label: "Pending review" },
  { value: "approved", label: "Approved" },
  { value: "dismissed", label: "Dismissed" },
  { value: "", label: "All statuses" },
];

function statusLabel(status: ConsumptionProposalStatus) {
  switch (status) {
    case "pending_review":
      return "Pending review";
    case "approved":
      return "Approved";
    case "dismissed":
      return "Dismissed";
  }
}

export function ConsumptionProposalList() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("delivery_date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [status, setStatus] = useState<ConsumptionProposalStatus | "">("pending_review");
  const debouncedSearch = useDebouncedValue(search);

  const { data: pendingCount } = useQuery({
    queryKey: ["consumption-proposals", "pending-count"],
    queryFn: () => consumptionProposalsApi.getPendingCount(),
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["consumption-proposals", page, debouncedSearch, sortBy, sortOrder, status],
    queryFn: () =>
      consumptionProposalsApi.list({
        page,
        page_size: 20,
        search: debouncedSearch || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        status: status || undefined,
      }),
  });

  const columns = useMemo<ColumnDef<ConsumptionProposalSummary>[]>(
    () => [
      {
        header: "Delivery date",
        accessorKey: "delivery_date",
        cell: ({ row }) => formatDate(row.original.delivery_date),
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ row }) => (
          <span
            className={
              row.original.status === "pending_review"
                ? "inline-flex rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning"
                : row.original.status === "approved"
                  ? "inline-flex rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success"
                  : "inline-flex rounded-full bg-surface-hover px-2 py-0.5 text-xs font-medium text-text-muted"
            }
          >
            {statusLabel(row.original.status)}
          </span>
        ),
      },
      {
        header: "Orders",
        accessorKey: "order_count",
        cell: ({ row }) => row.original.order_count,
      },
      {
        header: "Lines",
        accessorKey: "line_count",
        cell: ({ row }) => row.original.line_count,
      },
      {
        header: "Stock",
        accessorKey: "has_shortfall",
        cell: ({ row }) =>
          row.original.has_shortfall ? (
            <span className="text-warning">Shortfall</span>
          ) : (
            <span className="text-text-secondary">OK</span>
          ),
      },
      {
        header: "Updated",
        accessorKey: "updated_at",
        cell: ({ row }) => formatDateTime(row.original.updated_at),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      {(pendingCount?.pending_count ?? 0) > 0 ? (
        <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-3">
          <p className="text-sm font-medium text-warning">
            {pendingCount?.pending_count} stock review
            {(pendingCount?.pending_count ?? 0) === 1 ? "" : "s"} awaiting approval
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            Review proposed ingredient and packaging deductions before stock is updated.
          </p>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex items-center gap-2 text-sm text-text-secondary">
          <span>Status</span>
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as ConsumptionProposalStatus | "");
              setPage(1);
            }}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-sm"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by delivery date…"
        sortBy={sortBy}
        sortOptions={SORT_OPTIONS}
        sortOrder={sortOrder}
        onSortByChange={setSortBy}
        onSortOrderChange={setSortOrder}
      />

      {isError ? (
        <p className="text-sm text-danger">Unable to load stock reviews.</p>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={data?.items ?? []}
            isLoading={isLoading}
            emptyMessage="No stock reviews yet. Delivered orders will generate proposals for review."
            onRowClick={(row) => router.push(routes.inventory.consumption.detail(row.id))}
          />
          {data ? (
            <Pagination
              page={data.page}
              totalPages={data.total_pages}
              total={data.total}
              pageSize={data.page_size}
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
