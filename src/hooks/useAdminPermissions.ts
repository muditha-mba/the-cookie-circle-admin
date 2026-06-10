import { useMemo } from "react";

import {
  canViewFinancials,
  isClerkAdmin,
  isSuperAdmin,
} from "@/lib/permissions";
import { useAuth } from "@/providers/AuthProvider";

export function useAdminPermissions() {
  const { user } = useAuth();

  return useMemo(
    () => ({
      user,
      isSuperAdmin: isSuperAdmin(user),
      isClerkAdmin: isClerkAdmin(user),
      canViewFinancials: canViewFinancials(user),
    }),
    [user],
  );
}
