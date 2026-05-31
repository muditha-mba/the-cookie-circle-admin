import type { User, UserRole } from "@/lib/api/types";

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Administrator",
  CUSTOMER: "Customer",
};

export function formatUserRole(role: UserRole): string {
  return ROLE_LABELS[role];
}

export function getUserInitials(user: User): string {
  const first = user.first_name?.trim().charAt(0) ?? "";
  const last = user.last_name?.trim().charAt(0) ?? "";

  if (first || last) {
    return `${first}${last}`.toUpperCase();
  }

  return user.email.charAt(0).toUpperCase();
}

export function getUserDisplayName(user: User): string {
  const name = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
  return name || user.email.split("@")[0];
}
