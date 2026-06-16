import type { CreateTableActionsColumnOptions } from "@/lib/table-actions-column";
import { createTableActionsColumn } from "@/lib/table-actions-column";
import { DEFAULT_DELETE_CONFIRM_MESSAGE } from "@/components/data/ConfirmDeleteDialog";

type CrudRoutes = {
  detail: (id: string) => string;
  edit: (id: string) => string;
};

type BuildCrudActionsColumnOptions<T extends { id: string; name?: string }> = {
  routes: CrudRoutes;
  onDelete: (row: T) => void;
  confirmDelete: CreateTableActionsColumnOptions<T>["confirmDelete"];
  deleteDisabled?: boolean;
  getDeleteMessage?: (row: T) => string;
  showView?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
};

export function buildCrudActionsColumn<T extends { id: string; name?: string }>({
  routes,
  onDelete,
  confirmDelete,
  deleteDisabled,
  getDeleteMessage,
  showView = true,
  showEdit = true,
  showDelete = true,
}: BuildCrudActionsColumnOptions<T>) {
  return createTableActionsColumn<T>({
    showView,
    showEdit,
    showDelete,
    getViewHref: (row) => routes.detail(row.id),
    getEditHref: (row) => routes.edit(row.id),
    onDelete,
    confirmDelete,
    deleteDisabled,
    getDeleteMessage:
      getDeleteMessage ??
      ((row) =>
        row.name
          ? `Are you sure you want to delete "${row.name}"? This action cannot be undone.`
          : DEFAULT_DELETE_CONFIRM_MESSAGE),
  });
}
