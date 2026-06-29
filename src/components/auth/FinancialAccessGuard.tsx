"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { routes } from "@/config/routes";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";

type FinancialAccessGuardProps = {
  children: React.ReactNode;
};

export function FinancialAccessGuard({ children }: FinancialAccessGuardProps) {
  const router = useRouter();
  const { canViewFinancials, user } = useAdminPermissions();

  useEffect(() => {
    if (user && !canViewFinancials) {
      router.replace(routes.dashboard);
    }
  }, [canViewFinancials, router, user]);

  if (!user || !canViewFinancials) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-text-muted">Checking access…</p>
      </div>
    );
  }

  return children;
}
