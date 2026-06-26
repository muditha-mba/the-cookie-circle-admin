import { toast as sonner } from "sonner";

const DEDUP_WINDOW_MS = 2500;
const recentToasts = new Map<string, number>();

function shouldSkipDuplicate(id: string): boolean {
  const now = Date.now();
  const lastShown = recentToasts.get(id);
  if (lastShown !== undefined && now - lastShown < DEDUP_WINDOW_MS) {
    return true;
  }
  recentToasts.set(id, now);
  return false;
}

function showToast(
  variant: "success" | "error" | "warning" | "info",
  message: string,
): void {
  const trimmed = message.trim();
  if (!trimmed) {
    return;
  }

  const id = `${variant}:${trimmed}`;
  if (shouldSkipDuplicate(id)) {
    return;
  }

  sonner[variant](trimmed, { id, duration: 4800 });
}

export const appToast = {
  success: (message: string) => showToast("success", message),
  error: (message: string) => showToast("error", message),
  warning: (message: string) => showToast("warning", message),
  info: (message: string) => showToast("info", message),
};
