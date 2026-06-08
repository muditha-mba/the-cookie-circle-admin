"use client";

import { ChevronLeft, ChevronRight, Shield } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Logo } from "@/components/brand/Logo";
import { SidebarNavItem } from "@/components/layout/SidebarNavItem";
import { branding } from "@/config/branding";
import { env } from "@/config/env";
import {
  dashboardNavItem,
  getVisibleNavigationSections,
  isNavItemActive,
} from "@/config/navigation";
import { SidebarNavSection } from "@/components/layout/SidebarNavSection";
import { routes } from "@/config/routes";
import { formatUserRole } from "@/lib/user-display";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();

  return (
    <aside
      className={cn(
        "flex h-dvh shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-200",
        collapsed ? "w-20" : "w-[280px]",
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center border-b border-border px-4",
          collapsed ? "h-16 justify-center" : "h-[72px] justify-between gap-3",
        )}
      >
        {collapsed ? (
          <Link
            href={routes.dashboard}
            aria-label={`${branding.name} dashboard`}
          >
            <Logo variant="mark" priority />
          </Link>
        ) : (
          <>
            <Link
              href={routes.dashboard}
              className="flex min-w-0 flex-1 items-center gap-3"
              aria-label={`${branding.name} dashboard`}
            >
              <Logo variant="mark" priority />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-text-primary">
                  {branding.name}
                </p>
                <p className="truncate text-xs text-text-muted">
                  {branding.tagline}
                </p>
              </div>
            </Link>
            <button
              type="button"
              aria-label="Collapse sidebar"
              onClick={() => setCollapsed(true)}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {collapsed ? (
        <div className="flex shrink-0 justify-center border-b border-border py-2">
          <button
            type="button"
            aria-label="Expand sidebar"
            onClick={() => setCollapsed(false)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <nav
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3"
        aria-label="Main"
      >
        <div className="space-y-1">
          <SidebarNavItem
            item={dashboardNavItem}
            collapsed={collapsed}
            isActive={isNavItemActive(dashboardNavItem, pathname)}
          />
        </div>
        {getVisibleNavigationSections().map((section, index) => (
          <SidebarNavSection
            key={section.id}
            title={section.title}
            collapsed={collapsed}
            showDivider={index > 0 || collapsed}
          >
            {section.items.map((item) => (
              <SidebarNavItem
                key={item.id}
                item={item}
                collapsed={collapsed}
                isActive={isNavItemActive(item, pathname)}
              />
            ))}
          </SidebarNavSection>
        ))}
      </nav>

      <div
        className={cn(
          "shrink-0 border-t border-border p-3",
          collapsed && "px-2",
        )}
      >
        {!collapsed ? (
          <div className="rounded-lg border border-border bg-background px-3 py-2.5">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-surface-hover text-info">
                    <Shield className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-text-muted">
                      Signed in as
                    </p>
                    <p className="truncate text-sm font-medium text-text-primary">
                      {formatUserRole(user.role)}
                    </p>
                  </div>
                </div>
                {!env.isProduction ? (
                  <p className="truncate pl-8 text-[10px] uppercase tracking-wide text-text-muted">
                    {env.appEnv}
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="space-y-1">
                <p className="truncate text-xs text-text-muted">
                  {branding.name}
                </p>
                {!env.isProduction ? (
                  <p className="truncate text-[10px] uppercase tracking-wide text-text-muted">
                    {env.appEnv}
                  </p>
                ) : null}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            {user ? (
              <span
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-surface-hover text-info"
                title={formatUserRole(user.role)}
                aria-label={`Role: ${formatUserRole(user.role)}`}
              >
                <Shield className="h-4 w-4" />
              </span>
            ) : (
              <span
                className="h-2 w-2 rounded-full bg-text-muted"
                title={env.appEnv}
                aria-label={`Environment: ${env.appEnv}`}
              />
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
