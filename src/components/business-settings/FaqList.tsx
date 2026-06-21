"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { DataTable } from "@/components/data/DataTable";
import { PrimaryLink } from "@/components/data/PageActions";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { routes } from "@/config/routes";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import { useConfirmDelete } from "@/hooks/useConfirmDelete";
import type { ApiError } from "@/lib/api/types";
import type { Faq } from "@/lib/api/faqs";
import { faqsApi } from "@/lib/api/faqs";
import { createTableActionsColumn } from "@/lib/table-actions-column";

export function FaqList() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { canManageFinancialRecords } = useAdminPermissions();
  const { confirmDelete, deleteDialog } = useConfirmDelete();
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["faqs"],
    queryFn: () => faqsApi.list(),
  });

  const deleteMutation = useMutation({
    meta: { successMessage: "FAQ deleted successfully." },
    mutationFn: (id: string) => faqsApi.delete(id),
    onSuccess: () => {
      setActionError(null);
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
    },
    onError: (err: ApiError) => {
      setActionError(err.message ?? "Unable to delete FAQ.");
    },
  });

  const columns = useMemo<ColumnDef<Faq>[]>(() => {
    const base: ColumnDef<Faq>[] = [
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
    ];

    if (canManageFinancialRecords) {
      base.push(
        createTableActionsColumn<Faq>({
          showView: false,
          getEditHref: (row) => routes.businessSettings.faqs.edit(row.id),
          onDelete: (row) => deleteMutation.mutate(row.id),
          confirmDelete,
          deleteDisabled: deleteMutation.isPending,
          getDeleteMessage: () =>
            "Are you sure you want to delete this FAQ? This action cannot be undone.",
        }),
      );
    }

    return base;
  }, [canManageFinancialRecords, confirmDelete, deleteMutation]);

  return (
    <div className="space-y-4">
      {deleteDialog}
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
