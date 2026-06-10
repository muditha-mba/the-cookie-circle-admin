"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { DataTable } from "@/components/data/DataTable";
import { PrimaryLink } from "@/components/data/PageActions";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { routes } from "@/config/routes";
import type { ApiError } from "@/lib/api/types";
import type { FaqCategory } from "@/lib/api/faq-categories";
import { faqCategoriesApi } from "@/lib/api/faq-categories";

export function FaqCategoryList() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["faq-categories"],
    queryFn: () => faqCategoriesApi.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => faqCategoriesApi.delete(id),
    onSuccess: () => {
      setActionError(null);
      queryClient.invalidateQueries({ queryKey: ["faq-categories"] });
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
    },
    onError: (err: ApiError) => {
      setActionError(err.message ?? "Unable to delete category.");
    },
  });

  const columns = useMemo<ColumnDef<FaqCategory>[]>(
    () => [
      {
        header: "Category",
        accessorKey: "name",
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">{row.original.name}</span>
        ),
      },
      {
        header: "FAQs",
        accessorKey: "faq_count",
        cell: ({ row }) => row.original.faq_count,
      },
      {
        header: "Order",
        accessorKey: "sort_order",
        cell: ({ row }) => row.original.sort_order,
      },
      {
        header: "Status",
        accessorKey: "is_active",
        cell: ({ row }) => <StatusBadge active={row.original.is_active} />,
      },
      {
        header: "Actions",
        id: "actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="text-sm text-accent hover:underline"
              onClick={(event) => {
                event.stopPropagation();
                router.push(routes.businessSettings.faqCategories.edit(row.original.id));
              }}
            >
              Edit
            </button>
            <button
              type="button"
              className="text-sm text-danger hover:underline"
              onClick={(event) => {
                event.stopPropagation();
                if (window.confirm("Delete this category? It must have no FAQs assigned.")) {
                  deleteMutation.mutate(row.original.id);
                }
              }}
            >
              Delete
            </button>
          </div>
        ),
      },
    ],
    [deleteMutation, router],
  );

  return (
    <div className="space-y-4 rounded-lg border border-border bg-surface p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Categories</h3>
          <p className="mt-1 text-xs text-text-muted">
            Group FAQs by topic on the client website.
          </p>
        </div>
        <PrimaryLink href={routes.businessSettings.faqCategories.create}>New category</PrimaryLink>
      </div>

      {actionError ? <p className="text-sm text-danger">{actionError}</p> : null}

      {isError ? (
        <p className="text-sm text-danger">Unable to load FAQ categories.</p>
      ) : (
        <DataTable
          columns={columns}
          data={data ?? []}
          isLoading={isLoading}
          onRowClick={(row) =>
            router.push(routes.businessSettings.faqCategories.edit(row.id))
          }
          emptyMessage="No categories yet. Create one before adding FAQs."
        />
      )}
    </div>
  );
}
