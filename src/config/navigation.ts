import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Boxes,
  Layers,
  LayoutDashboard,
  Factory,
  MapPin,
  Truck,
  Package,
  Percent,
  Settings,
  ShoppingCart,
  Star,
  Tags,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";

import { routes } from "@/config/routes";

export type NavBadgeVariant = "default" | "info" | "warning";

export type NavBadge = {
  label: string;
  variant?: NavBadgeVariant;
};

export type NavItemConfig = {
  /** Stable identifier for module activation in future phases. */
  id: string;
  title: string;
  href: string;
  icon: LucideIcon;
  enabled: boolean;
  badge?: NavBadge;
  children?: NavItemConfig[];
};

export type NavSectionConfig = {
  /** Stable section id — used when adding modules (e.g. inventory). */
  id: string;
  title: string;
  items: NavItemConfig[];
};

/** Top-level dashboard link (not grouped). */
export const dashboardNavItem: NavItemConfig = {
  id: "dashboard",
  title: "Dashboard",
  href: routes.dashboard,
  icon: LayoutDashboard,
  enabled: true,
};

/**
 * Grouped sidebar navigation. Add future modules by appending items to the
 * appropriate section (e.g. `inventory` for Phase 8 stock features).
 */
export const navigationSections: NavSectionConfig[] = [
  {
    id: "catalog",
    title: "Catalog",
    items: [
      {
        id: "product-item-types",
        title: "Item Types",
        href: routes.productItemTypes.list,
        icon: Tags,
        enabled: true,
      },
      {
        id: "product-items",
        title: "Product Items",
        href: routes.productItems.list,
        icon: Boxes,
        enabled: true,
      },
      {
        id: "products",
        title: "Products",
        href: routes.products.list,
        icon: Package,
        enabled: true,
      },
      {
        id: "collection-packages",
        title: "Collection Packages",
        href: routes.collectionPackages.list,
        icon: Layers,
        enabled: true,
      },
      {
        id: "collections",
        title: "Collections",
        href: routes.collections.list,
        icon: Layers,
        enabled: true,
      },
    ],
  },
  {
    id: "procurement",
    title: "Procurement",
    items: [
      {
        id: "suppliers",
        title: "Suppliers",
        href: routes.suppliers.list,
        icon: Truck,
        enabled: true,
      },
    ],
  },
  {
    id: "operations",
    title: "Operations",
    items: [
      {
        id: "customers",
        title: "Customers",
        href: routes.customers.list,
        icon: Users,
        enabled: true,
      },
      {
        id: "orders",
        title: "Orders",
        href: routes.orders.list,
        icon: ShoppingCart,
        enabled: true,
      },
      {
        id: "reviews",
        title: "Reviews",
        href: routes.reviews.list,
        icon: Star,
        enabled: true,
      },
      {
        id: "delivery-areas",
        title: "Delivery Areas",
        href: routes.deliveryAreas.list,
        icon: MapPin,
        enabled: true,
      },
      {
        id: "production",
        title: "Production",
        href: routes.production,
        icon: Factory,
        enabled: true,
      },
    ],
  },
  {
    id: "finance",
    title: "Finance",
    items: [
      {
        id: "utility-charges",
        title: "Utility Charges",
        href: routes.utilityCharges.list,
        icon: Wrench,
        enabled: true,
      },
      {
        id: "labour-charges",
        title: "Labour Charges",
        href: routes.labourCharges.list,
        icon: Wallet,
        enabled: true,
      },
      {
        id: "tax-charges",
        title: "Tax Charges",
        href: routes.taxCharges.list,
        icon: Percent,
        enabled: true,
      },
    ],
  },
  {
    id: "insights",
    title: "Insights",
    items: [
      {
        id: "analytics",
        title: "Analytics",
        href: routes.analytics.home,
        icon: BarChart3,
        enabled: true,
      },
    ],
  },
  {
    id: "system",
    title: "System",
    items: [
      {
        id: "business-settings",
        title: "Business Settings",
        href: routes.businessSettings.operations,
        icon: Settings,
        enabled: true,
      },
    ],
  },
  /**
   * Reserved for Phase 8+ inventory modules. Add items here when stock
   * management ships — no sidebar structure changes required.
   */
  {
    id: "inventory",
    title: "Inventory",
    items: [],
  },
];

/** Sections with at least one nav item (empty reserved sections are hidden). */
export function getVisibleNavigationSections(): NavSectionConfig[] {
  return navigationSections.filter((section) => section.items.length > 0);
}

/** Flat list of all nav items — used by dashboard placeholders and legacy helpers. */
export const navigation: NavItemConfig[] = [
  dashboardNavItem,
  ...navigationSections.flatMap((section) => section.items),
];

export function isNavItemActive(item: NavItemConfig, pathname: string): boolean {
  if (item.href === routes.dashboard) {
    return pathname === routes.dashboard;
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/** Modules not yet enabled — used for dashboard placeholders. */
export function getUpcomingModules(): NavItemConfig[] {
  return navigation.filter((item) => !item.enabled && item.id !== "dashboard");
}
