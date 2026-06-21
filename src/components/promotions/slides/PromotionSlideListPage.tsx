"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { DataTable } from "@/components/data/DataTable";
import { ListToolbar, type SortOption } from "@/components/data/ListToolbar";
import { Pagination } from "@/components/data/Pagination";
import { PrimaryLink } from "@/components/data/PageActions";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { useConfirmDelete } from "@/hooks/useConfirmDelete";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { PromotionSlide } from "@/lib/api/promotion-slides";
import { promotionSlidesApi } from "@/lib/api/promotion-slides";
import { formatDateTime } from "@/lib/format";
import { buildCrudActionsColumn } from "@/lib/list-table-actions";
import { routes } from "@/config/routes";

const SORT_OPTIONS: SortOption[] = [
  { value: "sort_order", label: "Sort order" },
  { value: "created_at", label: "Created" },
];

const QUERY_KEY = "promotion-slides";

export function PromotionSlideListPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isSuperAdmin } = useAdminPermissions();
  const { confirmDelete, deleteDialog } = useConfirmDelete();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("sort_order");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const debouncedSearch = useDebouncedValue(search);

  const { data, isLoading, isError } = useQuery({
    queryKey: [QUERY_KEY, page, debouncedSearch, sortBy, sortOrder],
    queryFn: () =>
      promotionSlidesApi.list({
        page,
        page_size: 20,
        search: debouncedSearch || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      }),
  });

  const deleteMutation = useMutation({
    meta: { successMessage: "Promotion slide deleted successfully." },
    mutationFn: (id: string) => promotionSlidesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });

  const columns = useMemo<ColumnDef<PromotionSlide>[]>(() => {
    const base: ColumnDef<PromotionSlide>[] = [
      {
        header: "Slide",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            {row.original.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={row.original.image_url}
                alt={row.original.title}
                className="h-10 w-16 rounded object-cover"
              />
            ) : null}
            <div>
              <span className="font-medium text-text-primary">{row.original.title}</span>
              {row.original.cta_text ? (
                <p className="text-xs text-text-muted">{row.original.cta_text}</p>
              ) : null}
            </div>
          </div>
        ),
      },
      {
        header: "Order",
        accessorKey: "sort_order",
      },
      {
        header: "Status",
        accessorKey: "is_active",
        cell: ({ row }) => <StatusBadge active={row.original.is_active} />,
      },
      {
        header: "Schedule",
        cell: ({ row }) => {
          const { starts_at, ends_at } = row.original;
          if (!starts_at && !ends_at) return <span className="text-text-muted">Always</span>;
          return (
            <span className="text-xs">
              {starts_at ? formatDateTime(starts_at) : "—"}
              {" → "}
              {ends_at ? formatDateTime(ends_at) : "∞"}
            </span>
          );
        },
      },
      {
        header: "Created",
        accessorKey: "created_at",
        cell: ({ row }) => formatDateTime(row.original.created_at),
      },
    ];

    if (isSuperAdmin) {
      base.push(
        buildCrudActionsColumn<PromotionSlide>({
          routes: {
            detail: (id) => routes.promotions.slides.edit(id),
            edit: routes.promotions.slides.edit,
          },
          onDelete: (row) => deleteMutation.mutate(row.id),
          confirmDelete,
          deleteDisabled: deleteMutation.isPending,
        }),
      );
    }

    return base;
  }, [isSuperAdmin, confirmDelete, deleteMutation]);

  return (
    <DashboardPageShell
      title="Promotion Slides"
      description="Manage the marketing carousel shown on the client website."
    >
      {deleteDialog}
      <ListToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search slides..."
        sortBy={sortBy}
        sortOrder={sortOrder}
        sortOptions={SORT_OPTIONS}
        onSortByChange={(value) => {
          setSortBy(value);
          setPage(1);
        }}
        onSortOrderChange={setSortOrder}
        actions={
          isSuperAdmin ? (
            <PrimaryLink href={routes.promotions.slides.create}>Add slide</PrimaryLink>
          ) : null
        }
      />

      {isError ? (
        <p className="text-sm text-danger">Unable to load promotion slides.</p>
      ) : (
        <DataTable
          columns={columns}
          data={data?.items ?? []}
          isLoading={isLoading}
          onRowClick={(row) => router.push(routes.promotions.slides.edit(row.id))}
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
          No promotion slides yet.{" "}
          <Link
            href={routes.promotions.slides.create}
            className="text-text-primary underline-offset-4 hover:underline"
          >
            Create the first slide
          </Link>
        </p>
      ) : null}
    </DashboardPageShell>
  );
}
