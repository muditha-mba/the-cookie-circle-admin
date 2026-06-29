import { apiClient } from "@/lib/api/client";

export type SocialPlatform = "instagram" | "facebook" | "tiktok" | "youtube";

export type SharedMemory = {
  id: string;
  title: string;
  preview_image_url: string;
  post_url: string;
  platform: SocialPlatform;
  platform_label: string;
  sort_order: number;
  is_active: boolean;
};

export type SharedMemoryCreate = {
  title?: string;
  preview_image_url: string;
  post_url: string;
  platform: SocialPlatform;
  sort_order?: number;
  is_active?: boolean;
};

export type SharedMemoryUpdate = Partial<SharedMemoryCreate>;

export type SharedMemoriesSectionSettings = {
  section_enabled: boolean;
};

const BASE = "/api/v1/shared-memories";
const SETTINGS_BASE = "/api/v1/business-settings/shared-memories";

export const sharedMemoriesApi = {
  list: () => apiClient.get<SharedMemory[]>(BASE),

  get: (id: string) => apiClient.get<SharedMemory>(`${BASE}/${id}`),

  create: (payload: SharedMemoryCreate) => apiClient.post<SharedMemory>(BASE, payload),

  update: (id: string, payload: SharedMemoryUpdate) =>
    apiClient.patch<SharedMemory>(`${BASE}/${id}`, payload),

  delete: (id: string) => apiClient.delete<void>(`${BASE}/${id}`),

  getSectionSettings: () =>
    apiClient.get<SharedMemoriesSectionSettings>(SETTINGS_BASE),

  updateSectionSettings: (section_enabled: boolean) =>
    apiClient.patch<SharedMemoriesSectionSettings>(SETTINGS_BASE, { section_enabled }),
};
