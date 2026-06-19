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
import type { InventoryBalance } from "@/lib/api/inventory";
import { inventoryApi } from "@/lib/api/inventory";
import { formatDate } from "@/lib/format";

const SORT_OPTIONS: SortOption[] = [
  { value: "name", label: "Item" },
  { value: "created_at", label: "Created" },
];

function formatQty(value: string, unit: string) {
  return `${Number(value).toLocaleString()} ${unit}`;
}

export function InventoryBalanceList() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const debouncedSearch = useDebouncedValue(search);

  const { data: alerts } = useQuery({
    queryKey: ["inventory-alerts"],
    queryFn: () => inventoryApi.getAlerts(),
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["inventory-balances", page, debouncedSearch, sortBy, sortOrder, lowStockOnly],
    queryFn: () =>
      inventoryApi.listBalances({
        page,
        page_size: 20,
        search: debouncedSearch || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        low_stock_only: lowStockOnly,
      }),
  });

  const columns = useMemo<ColumnDef<InventoryBalance>[]>(
    () => [
      {
        header: "Item",
        accessorKey: "product_item_name",
        cell: ({ row }) => (
          <button
            type="button"
            className="font-medium text-left hover:underline"
            onClick={() => router.push(routes.productItems.detail(row.original.product_item_id))}
          >
            {row.original.product_item_name}
          </button>
        ),
      },
      {
        header: "Type",
        accessorKey: "item_type.name",
        cell: ({ row }) => row.original.item_type.name,
      },
      {
        header: "On hand",
        accessorKey: "quantity_on_hand",
        cell: ({ row }) => formatQty(row.original.quantity_on_hand, row.original.unit),
      },
      {
        header: "Reorder at",
        accessorKey: "reorder_level",
        cell: ({ row }) =>
          row.original.reorder_level
            ? formatQty(row.original.reorder_level, row.original.reorder_unit ?? row.original.unit)
            : "—",
      },
      {
        header: "Nearest expiry",
        accessorKey: "nearest_expiry",
        cell: ({ row }) =>
          row.original.nearest_expiry ? formatDate(row.original.nearest_expiry) : "—",
      },
      {
        header: "Status",
        accessorKey: "is_low_stock",
        cell: ({ row }) =>
          row.original.is_low_stock ? (
            <span className="inline-flex rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
              Low stock
            </span>
          ) : (
            <span className="inline-flex rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
              OK
            </span>
          ),
      },
    ],
    [router],
  );

  return (
    <div className="space-y-6">
      {(alerts?.low_stock_count ?? 0) > 0 ||
      (alerts?.expiring_soon_count ?? 0) > 0 ||
      (alerts?.pending_consumption_count ?? 0) > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-border bg-surface p-4">
            <p className="text-sm text-text-secondary">Low stock items</p>
            <p className="mt-1 text-2xl font-semibold">{alerts?.low_stock_count ?? 0}</p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-4">
            <p className="text-sm text-text-secondary">Lots expiring within 7 days</p>
            <p className="mt-1 text-2xl font-semibold">{alerts?.expiring_soon_count ?? 0}</p>
          </div>
          <div className="rounded-lg border border-border bg-surface p-4">
            <p className="text-sm text-text-secondary">Pending stock reviews</p>
            <p className="mt-1 text-2xl font-semibold">{alerts?.pending_consumption_count ?? 0}</p>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 text-sm text-text-secondary">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(event) => {
              setLowStockOnly(event.target.checked);
              setPage(1);
            }}
          />
          Low stock only
        </label>
      </div>

      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search tracked items…"
        sortBy={sortBy}
        sortOptions={SORT_OPTIONS}
        sortOrder={sortOrder}
        onSortByChange={setSortBy}
        onSortOrderChange={setSortOrder}
      />

      {isError ? (
        <p className="text-sm text-danger">Unable to load stock balances.</p>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={data?.items ?? []}
            isLoading={isLoading}
            emptyMessage="No tracked inventory items yet. Enable tracking on product items and receive stock via purchase receipts."
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
