"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  isProtectedRoute,
  isPublicAuthRoute,
  routes,
} from "@/config/routes";
import { useAuth } from "@/providers/AuthProvider";

type AuthGuardProps = {
  children: ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (isProtectedRoute(pathname) && !isAuthenticated) {
      router.replace(routes.auth.login);
      return;
    }

    if (isPublicAuthRoute(pathname) && isAuthenticated) {
      router.replace(routes.dashboard);
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <p className="text-sm text-text-secondary">Loading...</p>
      </div>
    );
  }

  if (isProtectedRoute(pathname) && !isAuthenticated) {
    return null;
  }

  if (isPublicAuthRoute(pathname) && isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
