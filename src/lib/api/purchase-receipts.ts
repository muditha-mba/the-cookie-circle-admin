import { apiClient } from "@/lib/api/client";
import type { ListQueryParams, PaginatedResponse } from "@/lib/api/pagination";
import type { Supplier } from "@/lib/api/suppliers";
import { env } from "@/config/env";

export type PurchaseReceiptStatus = "draft" | "confirmed";

export type PurchaseReceiptLine = {
  id: string;
  product_item_id: string;
  product_item_name: string;
  quantity: string;
  unit: string;
  unit_cost: string;
  line_total: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PurchaseReceiptLineInput = {
  product_item_id: string;
  quantity: number;
  unit: string;
  line_total: number;
  expires_at?: string | null;
};

export type PurchaseReceiptSummary = {
  id: string;
  supplier: Supplier;
  receipt_date: string;
  reference_number: string | null;
  total_amount: string;
  status: PurchaseReceiptStatus;
  has_bill: boolean;
  created_at: string;
  updated_at: string;
};

export type PurchaseReceipt = PurchaseReceiptSummary & {
  notes: string | null;
  bill_asset_id: string | null;
  bill_content_type: string | null;
  bill_extension: string | null;
  attachments: PurchaseReceiptAttachment[];
  lines: PurchaseReceiptLine[];
  confirmed_at: string | null;
  created_by_user_id: string | null;
  confirmed_by_user_id: string | null;
};

export type PurchaseReceiptAttachment = {
  id: string;
  asset_id: string;
  content_type: string;
  extension: string;
  file_name: string | null;
  sort_order: number;
  is_image: boolean;
  created_at: string;
};

export type PurchaseReceiptAttachmentRegister = {
  asset_id: string;
  content_type: string;
  extension: string;
  file_name?: string | null;
};

export type PurchaseReceiptCreate = {
  supplier_id: string;
  receipt_date: string;
  reference_number?: string | null;
  notes?: string | null;
  lines: PurchaseReceiptLineInput[];
};

export type PurchaseReceiptUpdate = Partial<
  Omit<PurchaseReceiptCreate, "lines">
> & {
  lines?: PurchaseReceiptLineInput[];
  bill_asset_id?: string | null;
  bill_content_type?: string | null;
  bill_extension?: string | null;
};

export type BillUploadUrlResponse = {
  asset_id: string;
  upload_url: string;
  extension: string;
  expires_in: number;
};

const BASE = "/api/v1/purchase-receipts";

export const purchaseReceiptsApi = {
  list: (
    params?: ListQueryParams & { status?: PurchaseReceiptStatus; supplier_id?: string },
  ) => apiClient.get<PaginatedResponse<PurchaseReceiptSummary>>(BASE, { params }),

  get: (id: string) => apiClient.get<PurchaseReceipt>(`${BASE}/${id}`),

  create: (payload: PurchaseReceiptCreate) =>
    apiClient.post<PurchaseReceipt>(BASE, payload),

  update: (id: string, payload: PurchaseReceiptUpdate) =>
    apiClient.patch<PurchaseReceipt>(`${BASE}/${id}`, payload),

  delete: (id: string) => apiClient.delete<void>(`${BASE}/${id}`),

  confirm: (id: string) => apiClient.post<PurchaseReceipt>(`${BASE}/${id}/confirm`),

  createBillUploadUrl: (id: string, content_type: string) =>
    apiClient.post<BillUploadUrlResponse>(`${BASE}/${id}/bill-upload-url`, {
      content_type,
    }),

  createAttachmentUploadUrl: (id: string, content_type: string) =>
    apiClient.post<BillUploadUrlResponse>(`${BASE}/${id}/attachments/upload-url`, {
      content_type,
    }),

  registerAttachment: (id: string, payload: PurchaseReceiptAttachmentRegister) =>
    apiClient.post<PurchaseReceiptAttachment>(`${BASE}/${id}/attachments`, payload),

  deleteAttachment: (receiptId: string, attachmentId: string) =>
    apiClient.delete<void>(`${BASE}/${receiptId}/attachments/${attachmentId}`),

  attachmentUrl: (receiptId: string, attachmentId: string) =>
    `${env.apiUrl}${BASE}/${receiptId}/attachments/${attachmentId}`,

  billUrl: (id: string) => `${env.apiUrl}${BASE}/${id}/bill`,
};
