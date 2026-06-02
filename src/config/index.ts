export type { AppEnv } from "@/config/env";
export { env } from "@/config/env";
export { branding } from "@/config/branding";
export {
  dashboardNavItem,
  getUpcomingModules,
  getVisibleNavigationSections,
  isNavItemActive,
  navigation,
  navigationSections,
  type NavBadge,
  type NavBadgeVariant,
  type NavItemConfig,
  type NavSectionConfig,
} from "@/config/navigation";
export {
  CUSTOMER_SEGMENT_BADGES,
  ORDER_STATUS_BADGES,
  ORDER_STATUS_OPTIONS,
  PAYMENT_STATUS_BADGES,
  PAYMENT_STATUS_OPTIONS,
  PRODUCTION_BATCH_STATUS_BADGES,
  PRODUCTION_BATCH_STATUS_OPTIONS,
  PURCHASE_PLANNING_STATUS_BADGES,
  PURCHASE_PLANNING_STATUS_OPTIONS,
  getStatusBadgeDefinition,
  getStatusLabel,
  statusSelectOptions,
  type StatusBadgeDefinition,
  type StatusBadgeKind,
} from "@/config/status-badges";
export {
  isProtectedRoute,
  isPublicAuthRoute,
  protectedRoutes,
  publicRoutes,
  routes,
  type RouteKey,
} from "@/config/routes";
