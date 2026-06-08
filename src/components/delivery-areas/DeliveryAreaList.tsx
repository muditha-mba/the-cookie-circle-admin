"use client";

import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { DataTable } from "@/components/data/DataTable";
import { ListToolbar, type SortOption } from "@/components/data/ListToolbar";
import { Pagination } from "@/components/data/Pagination";
import { PrimaryLink } from "@/components/data/PageActions";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { routes } from "@/config/routes";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { DeliveryArea } from "@/lib/api/delivery-areas";
import { deliveryAreasApi } from "@/lib/api/delivery-areas";
import { formatCurrency } from "@/lib/format";

const SORT_OPTIONS: SortOption[] = [
  { value: "name", label: "Name" },
  { value: "created_at", label: "Created" },
  { value: "is_active", label: "Status" },
];

export function DeliveryAreaList() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const debouncedSearch = useDebouncedValue(search);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["delivery-areas", page, debouncedSearch, sortBy, sortOrder],
    queryFn: () =>
      deliveryAreasApi.list({
        page,
        page_size: 20,
        search: debouncedSearch || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      }),
  });

  const columns = useMemo<ColumnDef<DeliveryArea>[]>(
    () => [
      { header: "Name", accessorKey: "name", cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      )},
      {
        header: "Fee override",
        accessorKey: "delivery_fee_override",
        cell: ({ row }) =>
          row.original.delivery_fee_override != null
            ? formatCurrency(row.original.delivery_fee_override)
            : "—",
      },
      {
        header: "Pickup only",
        accessorKey: "pickup_only",
        cell: ({ row }) => (row.original.pickup_only ? "Yes" : "No"),
      },
      {
        header: "Status",
        accessorKey: "is_active",
        cell: ({ row }) => <StatusBadge active={row.original.is_active} />,
      },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <ListToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        sortBy={sortBy}
        sortOptions={SORT_OPTIONS}
        sortOrder={sortOrder}
        onSortByChange={setSortBy}
        onSortOrderChange={setSortOrder}
        actions={<PrimaryLink href={routes.deliveryAreas.create}>New delivery area</PrimaryLink>}
      />

      {isError ? (
        <p className="text-sm text-danger">Unable to load delivery areas.</p>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={data?.items ?? []}
            isLoading={isLoading}
            onRowClick={(row) => router.push(routes.deliveryAreas.detail(row.id))}
            emptyMessage="No delivery areas found."
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
