import { apiClient } from "@/lib/api/client";

export type LinkableUser = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string;
};

const BASE = "/api/v1/users";

export const usersApi = {
  listLinkable: (params?: { search?: string; limit?: number }) =>
    apiClient.get<{ items: LinkableUser[] }>(`${BASE}/linkable`, { params }),

  getLinkable: (id: string) => apiClient.get<LinkableUser>(`${BASE}/linkable/${id}`),
};
