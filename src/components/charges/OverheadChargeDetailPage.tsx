"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";

import { DetailField } from "@/components/data/DetailField";
import { MultilineText } from "@/components/data/MultilineText";
import { DetailMetadataCard } from "@/components/data/DetailMetadataCard";
import { PageActions, PrimaryLink, SecondaryButton } from "@/components/data/PageActions";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DataTable } from "@/components/data/DataTable";
import { BillEntryForm } from "@/components/charges/BillEntryForm";
import type { OverheadModuleMeta } from "@/config/charge-modules";
import { useConfirmDelete } from "@/hooks/useConfirmDelete";
import type { ApiError } from "@/lib/api/types";
import type { BillEntry, OverheadChargeApi } from "@/lib/api/charge-types";
import { formatCurrency, formatDateTime, formatYearMonth } from "@/lib/format";
import { cacheEntityRemove } from "@/lib/query/mutation-cache";
import type { BillEntryFormValues } from "@/lib/validation/charge";
import { notifyActionError, notifyActionSuccess } from "@/lib/forms/feedback";

type OverheadChargeDetailPageProps = {
  module: OverheadModuleMeta;
  api: OverheadChargeApi;
};

export function OverheadChargeDetailPage({ module, api }: OverheadChargeDetailPageProps) {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { confirmDelete, deleteDialog, isConfirming } = useConfirmDelete();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showAddBill, setShowAddBill] = useState(false);
  const [addBillError, setAddBillError] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: [module.queryKey, params.id],
    queryFn: () => api.get(params.id),
    enabled: Boolean(params.id),
  });

  const deleteMutation = useMutation({
    meta: { successMessage: "Overhead charge deleted successfully." },
    mutationFn: () => api.delete(params.id),
  });

  const addBillMutation = useMutation({
    meta: { successMessage: "Bill entry added successfully." },
    mutationFn: (payload: BillEntryFormValues) =>
      api.addBillEntry(params.id, {
        year: payload.year,
        month: payload.month,
        amount: payload.amount,
        notes: payload.notes || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [module.queryKey, params.id] });
      setShowAddBill(false);
      setAddBillError(null);
    },
    onError: (err: ApiError) => {
      setAddBillError(err.message ?? "Unable to add bill entry.");
    },
  });

  const deleteBillMutation = useMutation({
    meta: { successMessage: "Bill entry removed successfully." },
    mutationFn: (entryId: string) => api.deleteBillEntry(params.id, entryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [module.queryKey, params.id] });
    },
  });

  const handleDelete = () => {
    if (!data) return;
    confirmDelete({
      message: `Are you sure you want to delete "${data.name}"? All monthly bill entries will also be deleted.`,
      onConfirm: async () => {
        setDeleteError(null);
        try {
          await deleteMutation.mutateAsync();
          notifyActionSuccess(`${module.singular} deleted successfully.`);
          cacheEntityRemove(queryClient, [module.queryKey, data.id], [module.queryKey]);
          router.push(module.routes.list);
        } catch (err) {
          notifyActionError(err, `Unable to delete ${module.singular.toLowerCase()}.`, setDeleteError);
        }
      },
    });
  };

  const handleDeleteBill = (entry: BillEntry) => {
    confirmDelete({
      message: `Delete the ${formatYearMonth(entry.year, entry.month)} bill entry (${formatCurrency(entry.amount)})?`,
      onConfirm: async () => {
        await deleteBillMutation.mutateAsync(entry.id);
      },
    });
  };

  const billColumns: ColumnDef<BillEntry>[] = [
    {
      header: "Period",
      accessorKey: "month",
      cell: ({ row }) => formatYearMonth(row.original.year, row.original.month),
    },
    {
      header: "Amount",
      accessorKey: "amount",
      cell: ({ row }) => (
        <span className="font-medium">{formatCurrency(row.original.amount)}</span>
      ),
    },
    {
      header: "Notes",
      accessorKey: "notes",
      cell: ({ row }) => <MultilineText value={row.original.notes} />,
    },
    {
      header: "Added",
      accessorKey: "created_at",
      cell: ({ row }) => formatDateTime(row.original.created_at),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <SecondaryButton
          type="button"
          variant="danger"
          onClick={() => handleDeleteBill(row.original)}
          className="py-1 px-2 text-xs"
        >
          Delete
        </SecondaryButton>
      ),
    },
  ];

  if (isLoading) {
    return (
      <DashboardPageShell title={module.singular} description="Loading...">
        <div className="h-40 animate-pulse rounded-lg bg-surface-hover" />
      </DashboardPageShell>
    );
  }

  if (isError || !data) {
    return (
      <DashboardPageShell title={module.singular} description="Not found">
        <p className="text-sm text-danger">{module.singular} not found.</p>
        <PageActions backHref={module.routes.list} className="mt-6" />
      </DashboardPageShell>
    );
  }

  const sortedEntries = [...(data.bill_entries ?? [])].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });

  const totalThisYear = sortedEntries
    .filter((e) => e.year === new Date().getFullYear())
    .reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <DashboardPageShell title={data.name} description={`${module.singular} details and monthly records.`}>
      {deleteDialog}

      <PageActions backHref={module.routes.list} className="mb-6">
        <PrimaryLink href={module.routes.edit(data.id)}>Edit</PrimaryLink>
        <SecondaryButton variant="danger" disabled={isConfirming} onClick={handleDelete}>
          {isConfirming ? "Deleting..." : "Delete"}
        </SecondaryButton>
      </PageActions>

      {deleteError ? <p className="mb-4 text-sm text-danger">{deleteError}</p> : null}

      <DetailMetadataCard className="mb-8">
        <DetailField label="Name" value={data.name} />
        <DetailField label="Status" value={<StatusBadge active={data.is_active} />} />
        <DetailField
          label={`Total ${new Date().getFullYear()}`}
          value={<span className="font-medium">{formatCurrency(totalThisYear)}</span>}
        />
        <DetailField label="Total entries" value={String(sortedEntries.length)} />
        <DetailField label="Created" value={formatDateTime(data.created_at)} />
        <DetailField label="Description" value={data.description || "—"} />
      </DetailMetadataCard>

      {/* Monthly bill entries */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-text-primary">Monthly Bills</h2>
            <p className="mt-0.5 text-sm text-text-secondary">
              One entry per month. Each entry records the actual bill amount for that period.
            </p>
          </div>
          {!showAddBill ? (
            <button
              type="button"
              onClick={() => setShowAddBill(true)}
              className="flex items-center gap-1.5 rounded-md bg-brand px-3 py-2 text-sm font-medium text-brand-foreground transition hover:bg-brand/90"
            >
              <Plus className="h-4 w-4" />
              Add bill
            </button>
          ) : null}
        </div>

        {showAddBill ? (
          <div className="mb-6">
            <BillEntryForm
              submitLabel="Add entry"
              isSubmitting={addBillMutation.isPending}
              error={addBillError}
              onSubmit={async (values) => {
                await addBillMutation.mutateAsync(values);
              }}
              onCancel={() => {
                setShowAddBill(false);
                setAddBillError(null);
              }}
            />
          </div>
        ) : null}

        {sortedEntries.length === 0 && !showAddBill ? (
          <div className="rounded-lg border border-border bg-surface px-6 py-10 text-center">
            <p className="text-sm text-text-secondary">
              No monthly bills recorded yet.
            </p>
            <button
              type="button"
              onClick={() => setShowAddBill(true)}
              className="mt-2 text-sm text-text-primary underline-offset-4 hover:underline"
            >
              Add the first bill
            </button>
          </div>
        ) : (
          <DataTable
            columns={billColumns}
            data={sortedEntries}
            isLoading={false}
          />
        )}
      </div>
    </DashboardPageShell>
  );
}
