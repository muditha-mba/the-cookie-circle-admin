/**
 * Central route definitions for the Admin Panel.
 * Used for navigation, redirects, and future route protection.
 */

export const routes = {
  dashboard: "/",
  auth: {
    login: "/login",
  },
  products: "/products",
  collections: "/collections",
  customers: "/customers",
  orders: "/orders",
  analytics: "/analytics",
} as const;

export type RouteKey = keyof Omit<typeof routes, "auth">;

/** Routes that will require authentication in Phase 2. */
export const protectedRoutes = [
  routes.dashboard,
  routes.products,
  routes.collections,
  routes.customers,
  routes.orders,
  routes.analytics,
] as const;

/** Routes accessible without authentication (Phase 2). */
export const publicRoutes = [routes.auth.login] as const;
