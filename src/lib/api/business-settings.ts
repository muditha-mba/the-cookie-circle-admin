import { apiClient } from "@/lib/api/client";

export type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type BusinessSettings = {
  delivery_fee: string;
  use_fixed_delivery_fee: boolean;
  order_cutoff_day: Weekday;
  delivery_day: Weekday;
  business_phone: string;
  business_email: string;
  stripe_enabled: boolean;
  bank_transfer_enabled: boolean;
  cod_enabled: boolean;
};

export type BusinessSettingsUpdate = Partial<{
  delivery_fee: number;
  use_fixed_delivery_fee: boolean;
  order_cutoff_day: Weekday;
  delivery_day: Weekday;
  business_phone: string;
  business_email: string;
  stripe_enabled: boolean;
  bank_transfer_enabled: boolean;
  cod_enabled: boolean;
}>;

export type SuggestedDeliveryDate = {
  reference_date: string;
  suggested_delivery_date: string;
  order_cutoff_day: Weekday;
  delivery_day: Weekday;
};

const BASE = "/api/v1/business-settings";

export const businessSettingsApi = {
  get: () => apiClient.get<BusinessSettings>(BASE),

  update: (payload: BusinessSettingsUpdate) =>
    apiClient.patch<BusinessSettings>(BASE, payload),

  suggestDeliveryDate: (referenceDate?: string) =>
    apiClient.get<SuggestedDeliveryDate>(`${BASE}/suggested-delivery-date`, {
      params: referenceDate ? { reference_date: referenceDate } : undefined,
    }),
};
