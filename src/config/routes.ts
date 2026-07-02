/**
 * Central route definitions for the Admin Panel.
 */

export const routes = {
  dashboard: "/",
  auth: {
    login: "/login",
    forgotPassword: "/forgot-password",
    resetPassword: "/reset-password",
  },
  products: {
    list: "/products",
    create: "/products/new",
    detail: (id: string) => `/products/${id}`,
    edit: (id: string) => `/products/${id}/edit`,
  },
  collections: {
    list: "/collections",
    create: "/collections/new",
    detail: (id: string) => `/collections/${id}`,
    edit: (id: string) => `/collections/${id}/edit`,
  },
  collectionPackages: {
    list: "/collection-packages",
    create: "/collection-packages/new",
    detail: (id: string) => `/collection-packages/${id}`,
    edit: (id: string) => `/collection-packages/${id}/edit`,
  },
  activityLogs: {
    list: "/activity-logs",
    detail: (id: string) => `/activity-logs/${id}`,
  },
  businessSettings: {
    operations: "/business-settings",
    contact: "/business-settings/contact",
    socialMedia: "/business-settings/social-media",
    faqs: {
      list: "/business-settings/faqs",
      create: "/business-settings/faqs/new",
      edit: (id: string) => `/business-settings/faqs/${id}/edit`,
    },
    sharedMemories: {
      list: "/business-settings/shared-memories",
      create: "/business-settings/shared-memories/new",
      edit: (id: string) => `/business-settings/shared-memories/${id}/edit`,
    },
    faqCategories: {
      create: "/business-settings/faq-categories/new",
      edit: (id: string) => `/business-settings/faq-categories/${id}/edit`,
    },
  },
  customers: {
    list: "/customers",
    create: "/customers/new",
    detail: (id: string) => `/customers/${id}`,
    edit: (id: string) => `/customers/${id}/edit`,
  },
  deliveryAreas: {
    list: "/delivery-areas",
    create: "/delivery-areas/new",
    detail: (id: string) => `/delivery-areas/${id}`,
    edit: (id: string) => `/delivery-areas/${id}/edit`,
  },
  orders: {
    list: "/orders",
    create: "/orders/new",
    detail: (id: string) => `/orders/${id}`,
    edit: (id: string) => `/orders/${id}/edit`,
  },
  reviews: {
    list: "/reviews",
    detail: (id: string) => `/reviews/${id}`,
  },
  production: "/production",
  suppliers: {
    list: "/suppliers",
    create: "/suppliers/new",
    detail: (id: string) => `/suppliers/${id}`,
    edit: (id: string) => `/suppliers/${id}/edit`,
  },
  analytics: {
    home: "/analytics",
    revenue: "/analytics/revenue",
    products: "/analytics/products",
    customers: "/analytics/customers",
    production: "/analytics/production",
    collections: "/analytics/collections",
    orders: "/analytics/orders",
    operations: "/analytics/operations",
    overhead: "/analytics/overhead",
    discounts: "/analytics/discounts",
  },
  productItemTypes: {
    list: "/product-item-types",
    create: "/product-item-types/new",
    detail: (id: string) => `/product-item-types/${id}`,
    edit: (id: string) => `/product-item-types/${id}/edit`,
  },
  productItems: {
    list: "/product-items",
    create: "/product-items/new",
    detail: (id: string) => `/product-items/${id}`,
    edit: (id: string) => `/product-items/${id}/edit`,
  },
  utilityCharges: {
    list: "/utility-charges",
    create: "/utility-charges/new",
    detail: (id: string) => `/utility-charges/${id}`,
    edit: (id: string) => `/utility-charges/${id}/edit`,
  },
  labourCharges: {
    list: "/labour-charges",
    create: "/labour-charges/new",
    detail: (id: string) => `/labour-charges/${id}`,
    edit: (id: string) => `/labour-charges/${id}/edit`,
  },
  taxCharges: {
    list: "/tax-charges",
    create: "/tax-charges/new",
    detail: (id: string) => `/tax-charges/${id}`,
    edit: (id: string) => `/tax-charges/${id}/edit`,
  },
  discounts: {
    rules: {
      list: "/discounts/rules",
      create: "/discounts/rules/new",
      detail: (id: string) => `/discounts/rules/${id}`,
      edit: (id: string) => `/discounts/rules/${id}/edit`,
    },
    eligibleCustomers: "/discounts/eligible-customers",
    history: "/discounts/history",
    auditEvents: "/discounts/audit-events",
  },
  promotions: {
    slides: {
      list: "/promotions/slides",
      create: "/promotions/slides/new",
      edit: (id: string) => `/promotions/slides/${id}/edit`,
    },
  },
  tools: {
    qrGenerator: "/tools/qr-generator",
  },
  inventory: {
    overview: "/inventory",
    lots: "/inventory/lots",
    movements: "/inventory/movements",
    receipts: {
      list: "/inventory/receipts",
      create: "/inventory/receipts/new",
      detail: (id: string) => `/inventory/receipts/${id}`,
      edit: (id: string) => `/inventory/receipts/${id}/edit`,
    },
    consumption: {
      list: "/inventory/consumption",
      detail: (id: string) => `/inventory/consumption/${id}`,
    },
  },
} as const;

export type RouteKey = keyof Omit<
  typeof routes,
  | "auth"
  | "products"
  | "collections"
  | "collectionPackages"
  | "customers"
  | "deliveryAreas"
  | "orders"
  | "businessSettings"
  // businessSettings is nested — excluded from RouteKey
  | "productItemTypes"
  | "productItems"
  | "utilityCharges"
  | "labourCharges"
  | "taxCharges"
  | "inventory"
  | "analytics"
>;

const protectedPrefixes = [
  routes.products.list,
  routes.collections.list,
  routes.collectionPackages.list,
  routes.businessSettings.operations,
  routes.customers.list,
  routes.deliveryAreas.list,
  routes.orders.list,
  routes.production,
  routes.suppliers.list,
  routes.analytics.home,
  routes.activityLogs.list,
  routes.productItemTypes.list,
  routes.productItems.list,
  routes.utilityCharges.list,
  routes.labourCharges.list,
  routes.taxCharges.list,
  routes.discounts.rules.list,
  routes.discounts.eligibleCustomers,
  routes.discounts.history,
  routes.promotions.slides.list,
  routes.tools.qrGenerator,
  routes.inventory.overview,
  routes.inventory.consumption.list,
] as const;

export const protectedRoutes = [routes.dashboard, ...protectedPrefixes] as const;

export const publicRoutes = [
  routes.auth.login,
  routes.auth.forgotPassword,
  routes.auth.resetPassword,
] as const;

export function isProtectedRoute(pathname: string): boolean {
  if (pathname === routes.dashboard) {
    return true;
  }

  if (publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    return false;
  }

  return protectedPrefixes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function isPublicAuthRoute(pathname: string): boolean {
  return publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}
