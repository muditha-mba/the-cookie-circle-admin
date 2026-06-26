import { env } from "@/config/env";
import { purchaseReceiptsApi, type PurchaseReceiptAttachment } from "@/lib/api/purchase-receipts";
import { getAccessToken } from "@/lib/auth/token-storage";
import type { ApiError, ApiErrorBody } from "@/lib/api/types";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_FILES = 10;
const ACCEPTED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

export function isAcceptedReceiptFile(file: File): boolean {
  return ACCEPTED_TYPES.has(file.type);
}

export function validateReceiptFiles(files: File[]): string | null {
  if (files.length > MAX_FILES) {
    return `You can attach up to ${MAX_FILES} files per receipt.`;
  }
  for (const file of files) {
    if (!isAcceptedReceiptFile(file)) {
      return `${file.name} must be a PDF or image (JPEG, PNG, WebP).`;
    }
    if (file.size > MAX_FILE_BYTES) {
      return `${file.name} exceeds the 10 MB limit.`;
    }
  }
  return null;
}

async function parseUploadError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as ApiErrorBody;
    if (typeof body.detail === "string") {
      return body.detail;
    }
    if (Array.isArray(body.detail) && body.detail.length > 0) {
      return body.detail.map((item) => item.msg).join(", ");
    }
    return body.message ?? `Upload failed with status ${response.status}`;
  } catch {
    return `Upload failed with status ${response.status}`;
  }
}

export async function uploadPurchaseReceiptAttachment(
  receiptId: string,
  file: File,
): Promise<PurchaseReceiptAttachment> {
  const validationError = validateReceiptFiles([file]);
  if (validationError) {
    throw new Error(validationError);
  }

  const token = getAccessToken();
  if (!token) {
    throw new Error("You are not signed in. Refresh the page and try again.");
  }

  const formData = new FormData();
  formData.append("file", file);

  let response: Response;
  try {
    response = await fetch(
      `${env.apiUrl}/api/v1/purchase-receipts/${receiptId}/attachments/upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      },
    );
  } catch {
    throw new Error(
      "Unable to reach the API. Check that the API is running and NEXT_PUBLIC_API_URL is correct.",
    );
  }

  if (!response.ok) {
    const message = await parseUploadError(response);
    const error: ApiError = { status: response.status, message };
    throw error;
  }

  return (await response.json()) as PurchaseReceiptAttachment;
}

export async function uploadPurchaseReceiptAttachments(
  receiptId: string,
  files: File[],
): Promise<PurchaseReceiptAttachment[]> {
  const validationError = validateReceiptFiles(files);
  if (validationError) {
    throw new Error(validationError);
  }

  const uploaded: PurchaseReceiptAttachment[] = [];
  for (const file of files) {
    uploaded.push(await uploadPurchaseReceiptAttachment(receiptId, file));
  }
  return uploaded;
}

export { MAX_FILES };
