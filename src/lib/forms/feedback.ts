import { getErrorMessage } from "@/lib/api/error-message";
import { appToast } from "@/lib/toast";

export function notifyActionSuccess(message: string): void {
  appToast.success(message);
}

export function notifyActionError(
  error: unknown,
  fallback: string,
  setInlineError?: (message: string | null) => void,
): string {
  const message = getErrorMessage(error, fallback);
  setInlineError?.(message);
  appToast.error(message);
  return message;
}

export function notifyActionWarning(
  message: string,
  setInlineError?: (message: string | null) => void,
): void {
  const trimmed = message.trim();
  if (!trimmed) {
    return;
  }
  setInlineError?.(trimmed);
  appToast.warning(trimmed);
}
