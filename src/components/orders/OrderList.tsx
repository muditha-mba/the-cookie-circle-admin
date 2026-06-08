"use client";

import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { DataTable } from "@/components/data/DataTable";
import { ListToolbar, type SortOption } from "@/components/data/ListToolbar";
import { Pagination } from "@/components/data/Pagination";
import { PrimaryLink } from "@/components/data/PageActions";
import { EnumStatusBadge } from "@/components/ui/EnumStatusBadge";
import { routes } from "@/config/routes";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { OrderSummary } from "@/lib/api/orders";
import { ordersApi } from "@/lib/api/orders";
import { formatCurrency } from "@/lib/format";

const SORT_OPTIONS: SortOption[] = [
  { value: "order_number", label: "Order number" },
  { value: "scheduled_delivery_date", label: "Scheduled delivery" },
  { value: "requested_delivery_date", label: "Requested delivery" },
  { value: "created_at", label: "Created" },
  { value: "revenue", label: "Revenue" },
  { value: "profit", label: "Profit" },
];

export function OrderList() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const debouncedSearch = useDebouncedValue(search);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["orders", page, debouncedSearch, sortBy, sortOrder],
    queryFn: () =>
      ordersApi.list({
        page,
        page_size: 20,
        search: debouncedSearch || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      }),
  });

  const columns = useMemo<ColumnDef<OrderSummary>[]>(
    () => [
      { header: "Order", accessorKey: "order_number", cell: ({ row }) => (
        <span className="font-medium">{row.original.order_number}</span>
      )},
      { header: "Customer", accessorKey: "customer_name" },
      { header: "Scheduled", accessorKey: "scheduled_delivery_date", cell: ({ row }) =>
        new Date(row.original.scheduled_delivery_date).toLocaleDateString()},
      { header: "Requested", accessorKey: "requested_delivery_date", cell: ({ row }) =>
        new Date(row.original.requested_delivery_date).toLocaleDateString()},
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ row }) => (
          <EnumStatusBadge kind="order" value={row.original.status} />
        ),
      },
      { header: "Revenue", accessorKey: "total_revenue_snapshot", cell: ({ row }) =>
        formatCurrency(row.original.total_revenue_snapshot)},
      { header: "Profit", accessorKey: "total_profit_snapshot", cell: ({ row }) =>
        formatCurrency(row.original.total_profit_snapshot)},
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <ListToolbar
        search={search}
        onSearchChange={(value) => { setSearch(value); setPage(1); }}
        sortBy={sortBy}
        sortOptions={SORT_OPTIONS}
        sortOrder={sortOrder}
        onSortByChange={setSortBy}
        onSortOrderChange={setSortOrder}
        actions={<PrimaryLink href={routes.orders.create}>New order</PrimaryLink>}
      />
      {isError ? (
        <p className="text-sm text-danger">Unable to load orders.</p>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={data?.items ?? []}
            isLoading={isLoading}
            onRowClick={(row) => router.push(routes.orders.detail(row.id))}
            emptyMessage="No orders found."
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
