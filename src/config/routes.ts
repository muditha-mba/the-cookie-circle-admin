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
  businessSettings: "/business-settings",
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
  | "productItemTypes"
  | "productItems"
  | "utilityCharges"
  | "labourCharges"
  | "taxCharges"
  | "analytics"
>;

const protectedPrefixes = [
  routes.products.list,
  routes.collections.list,
  routes.collectionPackages.list,
  routes.businessSettings,
  routes.customers.list,
  routes.deliveryAreas.list,
  routes.orders.list,
  routes.production,
  routes.suppliers.list,
  routes.analytics.home,
  routes.productItemTypes.list,
  routes.productItems.list,
  routes.utilityCharges.list,
  routes.labourCharges.list,
  routes.taxCharges.list,
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
