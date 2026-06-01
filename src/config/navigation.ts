import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Boxes,
  Layers,
  LayoutDashboard,
  Package,
  Percent,
  ShoppingCart,
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

/**
 * Primary sidebar navigation structure.
 * Set `enabled: true` when a module is ready — no sidebar refactor required.
 */
export const navigation: NavItemConfig[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    href: routes.dashboard,
    icon: LayoutDashboard,
    enabled: true,
  },
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
  {
    id: "products",
    title: "Products",
    href: routes.products.list,
    icon: Package,
    enabled: true,
  },
  {
    id: "collections",
    title: "Collections",
    href: routes.collections.list,
    icon: Layers,
    enabled: true,
  },
  {
    id: "customers",
    title: "Customers",
    href: routes.customers,
    icon: Users,
    enabled: false,
  },
  {
    id: "orders",
    title: "Orders",
    href: routes.orders,
    icon: ShoppingCart,
    enabled: false,
  },
  {
    id: "analytics",
    title: "Analytics",
    href: routes.analytics,
    icon: BarChart3,
    enabled: false,
  },
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
