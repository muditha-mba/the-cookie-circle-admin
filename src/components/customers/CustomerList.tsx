"use client";

import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { CustomerSegmentBadge } from "@/components/customers/CustomerSegmentBadge";
import { DataTable } from "@/components/data/DataTable";
import { ListToolbar, type SortOption } from "@/components/data/ListToolbar";
import { Pagination } from "@/components/data/Pagination";
import { PrimaryLink } from "@/components/data/PageActions";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { routes } from "@/config/routes";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type {
  CustomerListItem,
  CustomerSegment,
  MarketingSource,
} from "@/lib/api/customers";
import { customersApi } from "@/lib/api/customers";
import { formatCurrency } from "@/lib/format";

const SORT_OPTIONS: SortOption[] = [
  { value: "created_at", label: "Created" },
  { value: "first_name", label: "First name" },
  { value: "lifetime_spend", label: "Lifetime spend" },
  { value: "order_count", label: "Order count" },
  { value: "last_order_date", label: "Last order" },
];

function formatSource(source: string) {
  return source.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function CustomerList() {
  const router = useRouter();
  const { canViewFinancials } = useAdminPermissions();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [segment, setSegment] = useState<CustomerSegment | "">("");
  const [marketingSource, setMarketingSource] = useState<MarketingSource | "">("");
  const [minOrderCount, setMinOrderCount] = useState("");
  const [minLifetimeSpend, setMinLifetimeSpend] = useState("");
  const debouncedSearch = useDebouncedValue(search);

  const { data, isLoading, isError } = useQuery({
    queryKey: [
      "customers",
      page,
      debouncedSearch,
      sortBy,
      sortOrder,
      segment,
      marketingSource,
      minOrderCount,
      minLifetimeSpend,
    ],
    queryFn: () =>
      customersApi.list({
        page,
        page_size: 20,
        search: debouncedSearch || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        segment: segment || undefined,
        marketing_source: marketingSource || undefined,
        min_order_count: minOrderCount ? Number(minOrderCount) : undefined,
        min_lifetime_spend: minLifetimeSpend ? Number(minLifetimeSpend) : undefined,
      }),
  });

  const sortOptions = useMemo(
    () =>
      SORT_OPTIONS.filter(
        (option) => canViewFinancials || option.value !== "lifetime_spend",
      ),
    [canViewFinancials],
  );

  const columns = useMemo<ColumnDef<CustomerListItem>[]>(() => {
    const base: ColumnDef<CustomerListItem>[] = [
      {
        header: "Name",
        accessorKey: "first_name",
        cell: ({ row }) => (
          <span className="font-medium">
            {row.original.first_name} {row.original.last_name}
          </span>
        ),
      },
      {
        header: "Segment",
        accessorKey: "segment",
        cell: ({ row }) => <CustomerSegmentBadge segment={row.original.segment} />,
      },
      {
        header: "Orders",
        accessorKey: "total_orders",
        cell: ({ row }) => row.original.total_orders,
      },
      {
        header: "Last order",
        accessorKey: "last_order_date",
        cell: ({ row }) =>
          row.original.last_order_date
            ? new Date(row.original.last_order_date).toLocaleDateString()
            : "—",
      },
      {
        header: "Marketing",
        accessorKey: "marketing_source",
        cell: ({ row }) =>
          row.original.marketing_source
            ? formatSource(row.original.marketing_source)
            : "—",
      },
      {
        header: "Source",
        accessorKey: "source",
        cell: ({ row }) => formatSource(row.original.source),
      },
      {
        header: "Status",
        accessorKey: "is_active",
        cell: ({ row }) => <StatusBadge active={row.original.is_active} />,
      },
    ];

    if (canViewFinancials) {
      base.splice(3, 0, {
        header: "Lifetime spend",
        accessorKey: "lifetime_spend",
        cell: ({ row }) => formatCurrency(row.original.lifetime_spend),
      });
    }

    return base;
  }, [canViewFinancials]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-lg border border-border bg-surface p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="block text-xs font-medium text-text-secondary">Segment</label>
          <select
            value={segment}
            onChange={(event) => {
              setSegment(event.target.value as CustomerSegment | "");
              setPage(1);
            }}
            className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
          >
            <option value="">All segments</option>
            <option value="new">New</option>
            <option value="returning">Returning</option>
            <option value="vip">VIP</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary">
            Marketing source
          </label>
          <select
            value={marketingSource}
            onChange={(event) => {
              setMarketingSource(event.target.value as MarketingSource | "");
              setPage(1);
            }}
            className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
          >
            <option value="">All sources</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="referral">Referral</option>
            <option value="google">Google</option>
            <option value="walk_in">Walk In</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary">
            Min order count
          </label>
          <input
            type="number"
            min={0}
            value={minOrderCount}
            onChange={(event) => {
              setMinOrderCount(event.target.value);
              setPage(1);
            }}
            className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
          />
        </div>
        {canViewFinancials ? (
          <div>
            <label className="block text-xs font-medium text-text-secondary">
              Min lifetime spend
            </label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={minLifetimeSpend}
              onChange={(event) => {
                setMinLifetimeSpend(event.target.value);
                setPage(1);
              }}
              className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
            />
          </div>
        ) : null}
      </div>

      <ListToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        sortBy={sortBy}
        sortOptions={sortOptions}
        sortOrder={sortOrder}
        onSortByChange={setSortBy}
        onSortOrderChange={setSortOrder}
        actions={<PrimaryLink href={routes.customers.create}>New customer</PrimaryLink>}
      />

      {isError ? (
        <p className="text-sm text-danger">Unable to load customers.</p>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={data?.items ?? []}
            isLoading={isLoading}
            onRowClick={(row) => router.push(routes.customers.detail(row.id))}
            emptyMessage="No customers found."
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
