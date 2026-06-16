import type { AdminRole, User } from "@/lib/api/types";

export function isSuperAdmin(user: User | null | undefined): boolean {
  return user?.role === "ADMIN" && user.admin_role === "super_admin";
}

export function isClerkAdmin(user: User | null | undefined): boolean {
  return user?.role === "ADMIN" && user.admin_role === "clerk_admin";
}

/** Owner-level financials, analytics, and costing. */
export function canViewFinancials(user: User | null | undefined): boolean {
  return isSuperAdmin(user);
}

/** Super-admin activity log and audit modules. */
export function canViewActivityLogs(user: User | null | undefined): boolean {
  return isSuperAdmin(user);
}

/** Standard CRUD modules available to authenticated admin users. */
export function canManageRecords(user: User | null | undefined): boolean {
  return isSuperAdmin(user) || isClerkAdmin(user);
}

/** Financial and costing modules (product items, charges, etc.). */
export function canManageFinancialRecords(user: User | null | undefined): boolean {
  return canViewFinancials(user);
}

export function formatAdminRole(adminRole: AdminRole | null | undefined): string {
  if (adminRole === "super_admin") {
    return "Super Admin";
  }
  if (adminRole === "clerk_admin") {
    return "Clerk Admin";
  }
  return "Administrator";
}
