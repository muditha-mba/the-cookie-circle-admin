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
import type { SharedMemory } from "@/lib/api/shared-memories";
import { sharedMemoriesApi } from "@/lib/api/shared-memories";

export function SharedMemoryList() {
  const router = useRouter();
  const queryClient = useQueryClient();
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

  const columns = useMemo<ColumnDef<SharedMemory>[]>(
    () => [
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
      {
        header: "Actions",
        id: "actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="text-sm text-accent hover:underline"
              disabled={toggleMutation.isPending}
              onClick={(event) => {
                event.stopPropagation();
                toggleMutation.mutate({
                  id: row.original.id,
                  is_active: !row.original.is_active,
                });
              }}
            >
              {row.original.is_active ? "Hide" : "Show"}
            </button>
            <button
              type="button"
              className="text-sm text-accent hover:underline"
              onClick={(event) => {
                event.stopPropagation();
                router.push(routes.businessSettings.sharedMemories.edit(row.original.id));
              }}
            >
              Edit
            </button>
            <button
              type="button"
              className="text-sm text-danger hover:underline"
              onClick={(event) => {
                event.stopPropagation();
                if (window.confirm("Delete this shared memory?")) {
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
    [deleteMutation, router, toggleMutation],
  );

  return (
    <div className="space-y-4">
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
