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
import type { Faq } from "@/lib/api/faqs";
import { faqsApi } from "@/lib/api/faqs";

export function FaqList() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["faqs"],
    queryFn: () => faqsApi.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => faqsApi.delete(id),
    onSuccess: () => {
      setActionError(null);
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
    },
    onError: (err: ApiError) => {
      setActionError(err.message ?? "Unable to delete FAQ.");
    },
  });

  const columns = useMemo<ColumnDef<Faq>[]>(
    () => [
      {
        header: "Category",
        accessorKey: "category.name",
        cell: ({ row }) => (
          <span className="text-text-secondary">{row.original.category.name}</span>
        ),
      },
      {
        header: "Question",
        accessorKey: "question",
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">{row.original.question}</span>
        ),
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
                router.push(routes.businessSettings.faqs.edit(row.original.id));
              }}
            >
              Edit
            </button>
            <button
              type="button"
              className="text-sm text-danger hover:underline"
              onClick={(event) => {
                event.stopPropagation();
                if (window.confirm("Delete this FAQ?")) {
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
    <div className="space-y-4">
      <div className="flex justify-end">
        <PrimaryLink href={routes.businessSettings.faqs.create}>New FAQ</PrimaryLink>
      </div>

      {actionError ? <p className="text-sm text-danger">{actionError}</p> : null}

      {isError ? (
        <p className="text-sm text-danger">Unable to load FAQs.</p>
      ) : (
        <DataTable
          columns={columns}
          data={data ?? []}
          isLoading={isLoading}
          onRowClick={(row) => router.push(routes.businessSettings.faqs.edit(row.id))}
          emptyMessage="No FAQs yet. Add your first question for the website."
        />
      )}
    </div>
  );
}
