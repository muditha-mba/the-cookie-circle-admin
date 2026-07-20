import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Boxes,
  ClipboardList,
  Layers,
  ListChecks,
  LayoutDashboard,
  Factory,
  Image,
  MapPin,
  Megaphone,
  Truck,
  Package,
  Percent,
  ScrollText,
  Settings,
  ShoppingCart,
  Star,
  Tags,
  TicketPercent,
  Users,
  Wallet,
  Wrench,
  QrCode,
  Calculator,
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
  /** Hidden from clerk-admin users when true. */
  requiresFinancialAccess?: boolean;
  /** Super-admin only modules (activity logs, etc.). */
  requiresSuperAdmin?: boolean;
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
        requiresFinancialAccess: true,
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
        title: "Collections",
        href: routes.collectionPackages.list,
        icon: Layers,
        enabled: true,
      },
      {
        id: "collections",
        title: "Packages",
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
        requiresFinancialAccess: true,
      },
      {
        id: "labour-charges",
        title: "Labour Charges",
        href: routes.labourCharges.list,
        icon: Wallet,
        enabled: true,
        requiresFinancialAccess: true,
      },
      {
        id: "tax-charges",
        title: "Tax Charges",
        href: routes.taxCharges.list,
        icon: Percent,
        enabled: true,
        requiresFinancialAccess: true,
      },
      {
        id: "discount-rules",
        title: "Discount Rules",
        href: routes.discounts.rules.list,
        icon: TicketPercent,
        enabled: true,
        requiresSuperAdmin: true,
      },
      {
        id: "eligible-customers",
        title: "Eligible Customers",
        href: routes.discounts.eligibleCustomers,
        icon: Users,
        enabled: true,
        requiresSuperAdmin: true,
      },
      {
        id: "discount-history",
        title: "Discount History",
        href: routes.discounts.history,
        icon: ScrollText,
        enabled: true,
        requiresSuperAdmin: true,
      },
    ],
  },
  {
    id: "marketing",
    title: "Marketing",
    items: [
      {
        id: "promotion-slides",
        title: "Promotion Slides",
        href: routes.promotions.slides.list,
        icon: Image,
        enabled: true,
        requiresSuperAdmin: true,
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
        requiresFinancialAccess: true,
      },
    ],
  },
  {
    id: "tools",
    title: "Tools",
    items: [
      {
        id: "qr-generator",
        title: "QR Generator",
        href: routes.tools.qrGenerator,
        icon: QrCode,
        enabled: true,
      },
      {
        id: "recipe-calculator",
        title: "Recipe Calculator",
        href: routes.tools.recipeCalculator,
        icon: Calculator,
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
        requiresFinancialAccess: true,
      },
      {
        id: "activity-logs",
        title: "Activity Log",
        href: routes.activityLogs.list,
        icon: ScrollText,
        enabled: true,
        requiresSuperAdmin: true,
      },
    ],
  },
  /**
   * Inventory & stock management (Phase 1).
   */
  {
    id: "inventory",
    title: "Inventory",
    items: [
      {
        id: "inventory-overview",
        title: "Stock Overview",
        href: routes.inventory.overview,
        icon: Boxes,
        enabled: true,
        requiresFinancialAccess: true,
      },
      {
        id: "inventory-lots",
        title: "Lots",
        href: routes.inventory.lots,
        icon: Layers,
        enabled: true,
        requiresFinancialAccess: true,
      },
      {
        id: "inventory-movements",
        title: "Movements",
        href: routes.inventory.movements,
        icon: ClipboardList,
        enabled: true,
        requiresFinancialAccess: true,
      },
      {
        id: "purchase-receipts",
        title: "Purchase Receipts",
        href: routes.inventory.receipts.list,
        icon: Wallet,
        enabled: true,
        requiresFinancialAccess: true,
      },
      {
        id: "consumption-proposals",
        title: "Stock Reviews",
        href: routes.inventory.consumption.list,
        icon: ListChecks,
        enabled: true,
        requiresFinancialAccess: true,
      },
    ],
  },
];

function filterNavItems(items: NavItemConfig[], isSuperAdmin: boolean): NavItemConfig[] {
  return items.filter((item) => {
    if (!item.enabled) {
      return false;
    }
    if (item.requiresSuperAdmin || item.requiresFinancialAccess) {
      return isSuperAdmin;
    }
    return true;
  });
}

/** Sections with at least one nav item (empty reserved sections are hidden). */
export function getVisibleNavigationSections(isSuperAdmin = true): NavSectionConfig[] {
  return navigationSections
    .map((section) => ({
      ...section,
      items: filterNavItems(section.items, isSuperAdmin),
    }))
    .filter((section) => section.items.length > 0);
}

/** Flat list of all nav items — used by dashboard placeholders and legacy helpers. */
export const navigation: NavItemConfig[] = [
  dashboardNavItem,
  ...navigationSections.flatMap((section) => section.items),
];

function navItemMatchesPath(item: NavItemConfig, pathname: string): boolean {
  if (item.href === routes.dashboard) {
    return pathname === routes.dashboard;
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function isNavItemActive(item: NavItemConfig, pathname: string): boolean {
  const matches = navigation.filter((nav) => navItemMatchesPath(nav, pathname));
  if (matches.length === 0) {
    return false;
  }

  const bestMatch = matches.reduce((best, current) =>
    current.href.length > best.href.length ? current : best,
  );

  return bestMatch.id === item.id;
}

/** Modules not yet enabled — used for dashboard placeholders. */
export function getUpcomingModules(): NavItemConfig[] {
  return navigation.filter((item) => !item.enabled && item.id !== "dashboard");
}
