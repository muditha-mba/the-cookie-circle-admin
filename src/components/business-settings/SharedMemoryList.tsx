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
import type { SharedMemory } from "@/lib/api/shared-memories";
import { sharedMemoriesApi } from "@/lib/api/shared-memories";
import { createTableActionsColumn } from "@/lib/table-actions-column";
import { TableRowActionButton } from "@/components/data/TableRowActions";

export function SharedMemoryList() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { canManageFinancialRecords } = useAdminPermissions();
  const { confirmDelete, deleteDialog } = useConfirmDelete();
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["shared-memories"],
    queryFn: () => sharedMemoriesApi.list(),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      sharedMemoriesApi.update(id, { is_active }),
    onSuccess: () => {
      setActionError(null);
      queryClient.invalidateQueries({ queryKey: ["shared-memories"] });
    },
    onError: (err: ApiError) => {
      setActionError(err.message ?? "Unable to update post visibility.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => sharedMemoriesApi.delete(id),
    onSuccess: () => {
      setActionError(null);
      queryClient.invalidateQueries({ queryKey: ["shared-memories"] });
    },
    onError: (err: ApiError) => {
      setActionError(err.message ?? "Unable to delete shared memory.");
    },
  });

  const columns = useMemo<ColumnDef<SharedMemory>[]>(() => {
    const base: ColumnDef<SharedMemory>[] = [
      {
        header: "Preview",
        id: "preview",
        cell: ({ row }) => (
          <div className="h-12 w-12 overflow-hidden rounded-md border border-border bg-surface-hover">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={row.original.preview_image_url}
              alt={row.original.title || "Social post preview"}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        ),
      },
      {
        header: "Caption",
        accessorKey: "title",
        cell: ({ row }) => (
          <span className="font-medium text-text-primary">
            {row.original.title || "—"}
          </span>
        ),
      },
      {
        header: "Platform",
        accessorKey: "platform_label",
        cell: ({ row }) => (
          <span className="text-text-secondary">{row.original.platform_label}</span>
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
        createTableActionsColumn<SharedMemory>({
          showView: false,
          getEditHref: (row) => routes.businessSettings.sharedMemories.edit(row.id),
          onDelete: (row) => deleteMutation.mutate(row.id),
          confirmDelete,
          deleteDisabled: deleteMutation.isPending || toggleMutation.isPending,
          getDeleteMessage: () =>
            "Are you sure you want to delete this shared memory? This action cannot be undone.",
          extraActions: (row) => (
            <TableRowActionButton
              variant="edit"
              disabled={toggleMutation.isPending}
              onClick={() =>
                toggleMutation.mutate({
                  id: row.id,
                  is_active: !row.is_active,
                })
              }
            >
              {row.is_active ? "Hide" : "Show"}
            </TableRowActionButton>
          ),
        }),
      );
    }

    return base;
  }, [canManageFinancialRecords, confirmDelete, deleteMutation, toggleMutation]);

  return (
    <div className="space-y-4">
      {deleteDialog}
      <div className="flex justify-end">
        <PrimaryLink href={routes.businessSettings.sharedMemories.create}>
          New post
        </PrimaryLink>
      </div>

      {actionError ? <p className="text-sm text-danger">{actionError}</p> : null}

      {isError ? (
        <p className="text-sm text-danger">Unable to load shared memories.</p>
      ) : (
        <DataTable
          columns={columns}
          data={data ?? []}
          isLoading={isLoading}
          onRowClick={(row) =>
            router.push(routes.businessSettings.sharedMemories.edit(row.id))
          }
          emptyMessage="No social posts yet. Add customer memories for the home page carousel."
        />
      )}
    </div>
  );
}
