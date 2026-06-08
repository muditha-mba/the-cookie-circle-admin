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
import type { Supplier } from "@/lib/api/suppliers";
import { suppliersApi } from "@/lib/api/suppliers";

const SORT_OPTIONS: SortOption[] = [
  { value: "supplier_name", label: "Name" },
  { value: "created_at", label: "Created" },
  { value: "is_active", label: "Status" },
];

export function SupplierList() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("supplier_name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const debouncedSearch = useDebouncedValue(search);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["suppliers", page, debouncedSearch, sortBy, sortOrder],
    queryFn: () =>
      suppliersApi.list({
        page,
        page_size: 20,
        search: debouncedSearch || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      }),
  });

  const columns = useMemo<ColumnDef<Supplier>[]>(
    () => [
      {
        header: "Supplier",
        accessorKey: "supplier_name",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.supplier_name}</span>
        ),
      },
      { header: "Contact", accessorKey: "contact_person" },
      { header: "Email", accessorKey: "email" },
      { header: "Phone", accessorKey: "phone" },
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
        actions={<PrimaryLink href={routes.suppliers.create}>New supplier</PrimaryLink>}
      />

      {isError ? (
        <p className="text-sm text-danger">Unable to load suppliers.</p>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={data?.items ?? []}
            isLoading={isLoading}
            onRowClick={(row) => router.push(routes.suppliers.detail(row.id))}
            emptyMessage="No suppliers found."
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
