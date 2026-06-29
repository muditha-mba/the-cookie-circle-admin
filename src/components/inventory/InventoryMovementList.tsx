"use client";

import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";

import { DataTable } from "@/components/data/DataTable";
import { MultilineText } from "@/components/data/MultilineText";
import { ListToolbar, type SortOption } from "@/components/data/ListToolbar";
import { Pagination } from "@/components/data/Pagination";
import type { InventoryMovement } from "@/lib/api/inventory";
import { inventoryApi } from "@/lib/api/inventory";
import { formatDateTime } from "@/lib/format";

const SORT_OPTIONS: SortOption[] = [
  { value: "created_at", label: "Date" },
  { value: "movement_type", label: "Type" },
  { value: "quantity_change", label: "Quantity" },
];

const MOVEMENT_LABELS: Record<InventoryMovement["movement_type"], string> = {
  receipt: "Receipt",
  adjustment: "Adjustment",
  waste: "Waste",
  consumption: "Consumption",
};

export function InventoryMovementList() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["inventory-movements", page, sortBy, sortOrder],
    queryFn: () =>
      inventoryApi.listMovements({
        page,
        page_size: 20,
        sort_by: sortBy,
        sort_order: sortOrder,
      }),
  });

  const columns = useMemo<ColumnDef<InventoryMovement>[]>(
    () => [
      {
        header: "When",
        accessorKey: "created_at",
        cell: ({ row }) => formatDateTime(row.original.created_at),
      },
      {
        header: "Type",
        accessorKey: "movement_type",
        cell: ({ row }) => MOVEMENT_LABELS[row.original.movement_type],
      },
      { header: "Item", accessorKey: "product_item_name" },
      { header: "Lot", accessorKey: "lot_code" },
      {
        header: "Change",
        accessorKey: "quantity_change",
        cell: ({ row }) => {
          const value = Number(row.original.quantity_change);
          const prefix = value > 0 ? "+" : "";
          return `${prefix}${value.toLocaleString()} ${row.original.unit}`;
        },
      },
      {
        header: "Notes",
        accessorKey: "notes",
        cell: ({ row }) => <MultilineText value={row.original.notes} />,
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search movements…"
        sortBy={sortBy}
        sortOptions={SORT_OPTIONS}
        sortOrder={sortOrder}
        onSortByChange={setSortBy}
        onSortOrderChange={setSortOrder}
      />
      {isError ? (
        <p className="text-sm text-danger">Unable to load movements.</p>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={data?.items ?? []}
            isLoading={isLoading}
            emptyMessage="No inventory movements recorded yet."
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
