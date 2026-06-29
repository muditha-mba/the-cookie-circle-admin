"use client";

import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";

import { DataTable } from "@/components/data/DataTable";
import { ListToolbar, type SortOption } from "@/components/data/ListToolbar";
import { Pagination } from "@/components/data/Pagination";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { InventoryLot } from "@/lib/api/inventory";
import { inventoryApi } from "@/lib/api/inventory";
import { formatDate, formatDateTime } from "@/lib/format";

const SORT_OPTIONS: SortOption[] = [
  { value: "received_at", label: "Received" },
  { value: "expires_at", label: "Expiry" },
  { value: "quantity_on_hand", label: "Quantity" },
  { value: "lot_code", label: "Lot code" },
];

export function InventoryLotList() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("received_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const debouncedSearch = useDebouncedValue(search);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["inventory-lots", page, debouncedSearch, sortBy, sortOrder],
    queryFn: () =>
      inventoryApi.listLots({
        page,
        page_size: 20,
        search: debouncedSearch || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      }),
  });

  const columns = useMemo<ColumnDef<InventoryLot>[]>(
    () => [
      { header: "Lot", accessorKey: "lot_code", cell: ({ row }) => <span className="font-medium">{row.original.lot_code}</span> },
      {
        header: "On hand",
        accessorKey: "quantity_on_hand",
        cell: ({ row }) => `${Number(row.original.quantity_on_hand).toLocaleString()} ${row.original.unit}`,
      },
      {
        header: "Received",
        accessorKey: "received_at",
        cell: ({ row }) => formatDateTime(row.original.received_at),
      },
      {
        header: "Expires",
        accessorKey: "expires_at",
        cell: ({ row }) => (row.original.expires_at ? formatDate(row.original.expires_at) : "—"),
      },
      {
        header: "Status",
        accessorKey: "is_active",
        cell: ({ row }) => (row.original.is_active ? "Active" : "Depleted"),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search lots…"
        sortBy={sortBy}
        sortOptions={SORT_OPTIONS}
        sortOrder={sortOrder}
        onSortByChange={setSortBy}
        onSortOrderChange={setSortOrder}
      />
      {isError ? (
        <p className="text-sm text-danger">Unable to load lots.</p>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={data?.items ?? []}
            isLoading={isLoading}
            emptyMessage="No inventory lots yet. Confirm a purchase receipt to create lots."
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
