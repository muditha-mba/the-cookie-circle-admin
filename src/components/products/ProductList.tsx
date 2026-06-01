"use client";

import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { DataTable } from "@/components/data/DataTable";
import { ListToolbar, type SortOption } from "@/components/data/ListToolbar";
import { Pagination } from "@/components/data/Pagination";
import { PrimaryLink } from "@/components/data/PageActions";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { routes } from "@/config/routes";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { ProductSummary } from "@/lib/api/products";
import { productsApi } from "@/lib/api/products";
import { formatCurrency } from "@/lib/format";

const SORT_OPTIONS: SortOption[] = [
  { value: "name", label: "Name" },
  { value: "selling_price", label: "Selling price" },
  { value: "created_at", label: "Created" },
];

export function ProductList() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const debouncedSearch = useDebouncedValue(search);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", page, debouncedSearch, sortBy, sortOrder],
    queryFn: () =>
      productsApi.list({
        page,
        page_size: 20,
        search: debouncedSearch || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      }),
  });

  const columns = useMemo<ColumnDef<ProductSummary>[]>(
    () => [
      {
        header: "Name",
        accessorKey: "name",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
      },
      {
        header: "Selling price",
        accessorKey: "selling_price",
        cell: ({ row }) => formatCurrency(row.original.selling_price),
      },
      {
        header: "Buffer",
        accessorKey: "buffer_amount",
        cell: ({ row }) => formatCurrency(row.original.buffer_amount),
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
    <div className="space-y-6">
      <ListToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search products..."
        sortBy={sortBy}
        sortOrder={sortOrder}
        sortOptions={SORT_OPTIONS}
        onSortByChange={(value) => {
          setSortBy(value);
          setPage(1);
        }}
        onSortOrderChange={setSortOrder}
        actions={<PrimaryLink href={routes.products.create}>Add product</PrimaryLink>}
      />

      {isError ? (
        <p className="text-sm text-danger">Unable to load products.</p>
      ) : (
        <DataTable
          columns={columns}
          data={data?.items ?? []}
          isLoading={isLoading}
          onRowClick={(row) => router.push(routes.products.detail(row.id))}
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
          No products yet.{" "}
          <Link
            href={routes.products.create}
            className="text-text-primary underline-offset-4 hover:underline"
          >
            Create your first product
          </Link>
        </p>
      ) : null}
    </div>
  );
}
