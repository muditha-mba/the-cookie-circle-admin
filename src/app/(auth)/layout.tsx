import type { ReactNode } from "react";

import { Logo } from "@/components/brand/Logo";
import { branding } from "@/config/branding";

/**
 * Auth route group layout.
 * Login and related pages will be added in Phase 2.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 py-10">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <Logo variant="full" className="h-20 w-20" priority />
        <div>
          <p className="text-sm font-semibold text-text-primary">
            {branding.name}
          </p>
          <p className="text-xs text-text-muted">{branding.tagline}</p>
        </div>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
