"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, ImageIcon, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { PurchaseReceiptAttachment } from "@/lib/api/purchase-receipts";
import { purchaseReceiptsApi } from "@/lib/api/purchase-receipts";
import type { ApiError } from "@/lib/api/types";
import { getAccessToken } from "@/lib/auth/token-storage";
import {
  MAX_FILES,
  uploadPurchaseReceiptAttachment,
  validateReceiptFiles,
} from "@/lib/purchase-receipt-attachments";

type PurchaseReceiptAttachmentsProps = {
  receiptId?: string | null;
  attachments?: PurchaseReceiptAttachment[];
  isDraft?: boolean;
  pendingFiles?: File[];
  onPendingFilesChange?: (files: File[]) => void;
};

async function fetchAttachmentBlob(receiptId: string, attachmentId: string): Promise<Blob | null> {
  const token = getAccessToken();
  if (!token) {
    return null;
  }

  const response = await fetch(purchaseReceiptsApi.attachmentUrl(receiptId, attachmentId), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    return null;
  }
  return response.blob();
}

function useAttachmentPreviewUrl(
  receiptId: string,
  attachment: PurchaseReceiptAttachment,
): { previewUrl: string | null; isLoading: boolean } {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(attachment.is_image);

  useEffect(() => {
    if (!attachment.is_image) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    let objectUrl: string | null = null;

    const load = async () => {
      setIsLoading(true);
      try {
        const blob = await fetchAttachmentBlob(receiptId, attachment.id);
        if (!blob || cancelled) {
          return;
        }
        objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [attachment.id, attachment.is_image, receiptId]);

  return { previewUrl, isLoading };
}

function PendingPreview({ file, onRemove }: { file: File; onRemove: () => void }) {
  const previewUrl = useMemo(
    () => (file.type.startsWith("image/") ? URL.createObjectURL(file) : null),
    [file],
  );

  useEffect(() => {
    if (!previewUrl) {
      return;
    }
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  return (
    <div className="relative overflow-hidden rounded-lg border border-border bg-surface">
      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={previewUrl} alt={file.name} className="h-40 w-full object-cover" />
      ) : (
        <div className="flex h-40 items-center justify-center bg-surface-hover text-text-muted">
          <FileText className="h-8 w-8" />
        </div>
      )}
      <div className="space-y-1 px-3 py-2">
        <p className="truncate text-xs font-medium text-text-primary">{file.name}</p>
        <p className="text-[11px] text-text-muted">Queued until draft is saved</p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-2 top-2 rounded-md bg-background/90 p-1 text-text-secondary hover:text-danger"
        aria-label={`Remove ${file.name}`}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function AttachmentCard({
  receiptId,
  attachment,
  canDelete,
  onDelete,
}: {
  receiptId: string;
  attachment: PurchaseReceiptAttachment;
  canDelete: boolean;
  onDelete: () => void;
}) {
  const label = attachment.file_name ?? `Receipt file .${attachment.extension}`;
  const { previewUrl, isLoading } = useAttachmentPreviewUrl(receiptId, attachment);

  const openAttachment = async () => {
    const blob = await fetchAttachmentBlob(receiptId, attachment.id);
    if (!blob) {
      return;
    }
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  return (
    <div className="relative overflow-hidden rounded-lg border border-border bg-surface">
      <button
        type="button"
        onClick={() => void openAttachment()}
        className="flex h-40 w-full items-center justify-center overflow-hidden bg-surface-hover text-text-muted hover:bg-surface-elevated"
      >
        {attachment.is_image && previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt={label} className="h-full w-full object-cover" />
        ) : attachment.is_image && isLoading ? (
          <div className="h-full w-full animate-pulse bg-surface-elevated" />
        ) : attachment.is_image ? (
          <ImageIcon className="h-8 w-8" />
        ) : (
          <FileText className="h-8 w-8" />
        )}
      </button>
      <div className="space-y-1 px-3 py-2">
        <button
          type="button"
          onClick={() => void openAttachment()}
          className="block w-full truncate text-left text-xs font-medium text-primary hover:underline"
        >
          {label}
        </button>
        <p className="text-[11px] uppercase tracking-wide text-text-muted">
          {attachment.extension}
        </p>
      </div>
      {canDelete ? (
        <button
          type="button"
          onClick={onDelete}
          className="absolute right-2 top-2 rounded-md bg-background/90 p-1 text-text-secondary hover:text-danger"
          aria-label={`Delete ${label}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}

export function PurchaseReceiptAttachments({
  receiptId,
  attachments = [],
  isDraft = true,
  pendingFiles = [],
  onPendingFilesChange,
}: PurchaseReceiptAttachmentsProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const totalCount = attachments.length + pendingFiles.length;
  const canAddMore = totalCount < MAX_FILES && Boolean(receiptId || onPendingFilesChange);

  const deleteMutation = useMutation({
    mutationFn: (attachmentId: string) =>
      purchaseReceiptsApi.deleteAttachment(receiptId!, attachmentId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["purchase-receipts"] });
    },
  });

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files?.length) {
      return;
    }
    setError(null);
    const selected = Array.from(files);
    const combined = [...pendingFiles, ...selected];
    const validationError = validateReceiptFiles(
      receiptId ? selected : combined.slice(0, MAX_FILES - attachments.length),
    );
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!receiptId) {
      onPendingFilesChange?.(combined.slice(0, MAX_FILES));
      return;
    }

    if (attachments.length + selected.length > MAX_FILES) {
      setError(`You can attach up to ${MAX_FILES} files per receipt.`);
      return;
    }

    setIsUploading(true);
    try {
      for (const file of selected) {
        await uploadPurchaseReceiptAttachment(receiptId, file);
      }
      await queryClient.invalidateQueries({ queryKey: ["purchase-receipts", receiptId] });
      await queryClient.invalidateQueries({ queryKey: ["purchase-receipts"] });
    } catch (err) {
      const apiError = err as ApiError;
      setError(
        apiError.message ?? (err instanceof Error ? err.message : "Unable to upload receipt files."),
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section className="space-y-4 rounded-lg border border-border p-4">
      <div>
        <h3 className="text-sm font-medium text-text-primary">Receipt images & files</h3>
        <p className="mt-1 text-sm text-text-secondary">
          Attach photos or PDFs of the supplier invoice. Up to {MAX_FILES} files, 10 MB each.
          {!isDraft && receiptId
            ? " You can add files after confirming stock; line items stay locked."
            : null}
        </p>
      </div>

      {(attachments.length > 0 || pendingFiles.length > 0) && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {attachments.map((attachment) => (
            <AttachmentCard
              key={attachment.id}
              receiptId={receiptId!}
              attachment={attachment}
              canDelete={Boolean(isDraft && receiptId)}
              onDelete={() => {
                if (!receiptId) {
                  return;
                }
                void deleteMutation.mutateAsync(attachment.id);
              }}
            />
          ))}
          {pendingFiles.map((file, index) => (
            <PendingPreview
              key={`${file.name}-${file.lastModified}-${index}`}
              file={file}
              onRemove={() =>
                onPendingFilesChange?.(pendingFiles.filter((_, itemIndex) => itemIndex !== index))
              }
            />
          ))}
        </div>
      )}

      {canAddMore ? (
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-text-primary hover:bg-surface-hover">
            <input
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp"
              multiple
              disabled={isUploading}
              className="hidden"
              onChange={(event) => {
                void handleFilesSelected(event.target.files);
                event.target.value = "";
              }}
            />
            {isUploading ? "Uploading..." : "Add receipt files"}
          </label>
          {!receiptId ? (
            <p className="text-xs text-text-muted">Files are uploaded after you save the draft.</p>
          ) : null}
        </div>
      ) : null}

      {!isDraft && attachments.length === 0 && !canAddMore ? (
        <p className="text-sm text-text-muted">No receipt files attached.</p>
      ) : null}

      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </section>
  );
}
