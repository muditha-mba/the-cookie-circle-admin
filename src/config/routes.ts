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
  products: "/products",
  collections: "/collections",
  customers: "/customers",
  orders: "/orders",
  analytics: "/analytics",
} as const;

export type RouteKey = keyof Omit<typeof routes, "auth">;

export const protectedRoutes = [
  routes.dashboard,
  routes.products,
  routes.collections,
  routes.customers,
  routes.orders,
  routes.analytics,
] as const;

export const publicRoutes = [
  routes.auth.login,
  routes.auth.forgotPassword,
  routes.auth.resetPassword,
] as const;

export function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some((route) =>
    route === "/"
      ? pathname === "/"
      : pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function isPublicAuthRoute(pathname: string): boolean {
  return publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}
