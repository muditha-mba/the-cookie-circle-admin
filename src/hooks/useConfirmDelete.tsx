"use client";

import { useCallback, useState } from "react";

import {
  ConfirmDeleteDialog,
  DEFAULT_DELETE_CONFIRM_MESSAGE,
} from "@/components/data/ConfirmDeleteDialog";

type ConfirmDeleteRequest = {
  message?: string;
  title?: string;
  onConfirm: () => void | Promise<void>;
};

export function useConfirmDelete() {
  const [pending, setPending] = useState<ConfirmDeleteRequest | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const confirmDelete = useCallback((request: ConfirmDeleteRequest) => {
    setPending(request);
  }, []);

  const handleCancel = useCallback(() => {
    if (isConfirming) {
      return;
    }
    setPending(null);
  }, [isConfirming]);

  const handleConfirm = useCallback(async () => {
    if (!pending) {
      return;
    }

    setIsConfirming(true);
    try {
      await pending.onConfirm();
      setPending(null);
    } finally {
      setIsConfirming(false);
    }
  }, [pending]);

  const deleteDialog = (
    <ConfirmDeleteDialog
      open={Boolean(pending)}
      title={pending?.title}
      message={pending?.message ?? DEFAULT_DELETE_CONFIRM_MESSAGE}
      isConfirming={isConfirming}
      onConfirm={() => void handleConfirm()}
      onCancel={handleCancel}
    />
  );

  return {
    confirmDelete,
    deleteDialog,
    isConfirming,
  };
}
