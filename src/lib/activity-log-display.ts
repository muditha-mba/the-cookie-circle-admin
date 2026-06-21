import type {
  ActivityAction,
  ActivityLogSummary,
  ActivityResourceType,
  ClientDeviceType,
} from "@/lib/api/activity-logs";

const ACTION_LABELS: Record<ActivityAction, string> = {
  created: "Created",
  updated: "Updated",
  deleted: "Deleted",
  exported: "Exported",
  login: "Login",
  login_failed: "Login failed",
  logout: "Logout",
  logout_all: "Logout all sessions",
};

const RESOURCE_LABELS: Record<ActivityResourceType, string> = {
  order: "Order",
  product: "Product",
  customer: "Customer",
  collection: "Collection",
  collection_package: "Collection package",
  product_item: "Product item",
  product_item_type: "Item type",
  product_category: "Product category",
  supplier: "Supplier",
  delivery_area: "Delivery area",
  utility_charge: "Utility charge",
  labour_charge: "Labour charge",
  tax_charge: "Tax charge",
  business_settings: "Business settings",
  faq: "FAQ",
  faq_category: "FAQ category",
  shared_memory: "Shared memory",
  review: "Review",
  production: "Production",
  analytics: "Analytics",
  dashboard: "Dashboard",
  auth: "Authentication",
  user: "User",
  system: "System",
};

const DEVICE_LABELS: Record<ClientDeviceType, string> = {
  desktop: "Desktop",
  mobile: "Mobile",
  tablet: "Tablet",
  bot: "Bot",
  unknown: "Unknown",
};

export function formatActivityAction(action: ActivityAction): string {
  return ACTION_LABELS[action];
}

export function formatActivityResourceType(resourceType: ActivityResourceType): string {
  return RESOURCE_LABELS[resourceType];
}

export function formatAdminRoleLabel(role: string | null): string {
  if (role === "super_admin") {
    return "Super Admin";
  }
  if (role === "clerk_admin") {
    return "Clerk Admin";
  }
  return "Admin";
}

export function formatClientSummary(log: ActivityLogSummary): string {
  const browser = [log.browser_name, log.browser_version].filter(Boolean).join(" ");
  const os = [log.os_name, log.os_version].filter(Boolean).join(" ");
  const device = DEVICE_LABELS[log.device_type];
  const parts = [browser || null, os ? `on ${os}` : null, device ? `(${device})` : null].filter(
    Boolean,
  );
  return parts.length > 0 ? parts.join(" ") : "—";
}
