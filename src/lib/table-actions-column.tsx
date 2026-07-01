import type { ColumnDef } from "@tanstack/react-table";
import type { ReactNode } from "react";

import { TableRowActions } from "@/components/data/TableRowActions";
import type { useConfirmDelete } from "@/hooks/useConfirmDelete";

type ConfirmDeleteFn = ReturnType<typeof useConfirmDelete>["confirmDelete"];

export type CreateTableActionsColumnOptions<T> = {
  getViewHref?: (row: T) => string | undefined;
  getEditHref?: (row: T) => string | undefined;
  onView?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  confirmDelete?: ConfirmDeleteFn;
  getDeleteMessage?: (row: T) => string;
  getDeleteTitle?: (row: T) => string;
  showView?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  deleteDisabled?: boolean;
  canDelete?: (row: T) => boolean;
  extraActions?: (row: T) => ReactNode;
  trailingActions?: (row: T) => ReactNode;
};

export function createTableActionsColumn<T>(
  options: CreateTableActionsColumnOptions<T>,
): ColumnDef<T> {
  const {
    getViewHref,
    getEditHref,
    onView,
    onEdit,
    onDelete,
    confirmDelete,
    getDeleteMessage,
    getDeleteTitle,
    showView = true,
    showEdit = true,
    showDelete = true,
    deleteDisabled = false,
    canDelete,
    extraActions,
    trailingActions,
  } = options;

  return {
    header: "Actions",
    id: "actions",
    cell: ({ row }) => {
      const record = row.original;

      return (
        <TableRowActions
          viewHref={showView ? getViewHref?.(record) : undefined}
          editHref={showEdit ? getEditHref?.(record) : undefined}
          onView={showView ? (onView ? () => onView(record) : undefined) : undefined}
          onEdit={showEdit ? (onEdit ? () => onEdit(record) : undefined) : undefined}
          onDelete={
            showDelete && onDelete && confirmDelete && (canDelete?.(record) ?? true)
              ? () =>
                  confirmDelete({
                    title: getDeleteTitle?.(record),
                    message: getDeleteMessage?.(record),
                    onConfirm: () => onDelete(record),
                  })
              : undefined
          }
          deleteDisabled={deleteDisabled}
          extra={extraActions?.(record)}
          trailingExtra={trailingActions?.(record)}
        />
      );
    },
  };
}
