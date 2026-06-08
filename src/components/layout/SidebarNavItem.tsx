import Link from "next/link";

import type { NavItemConfig } from "@/config/navigation";
import { cn } from "@/lib/utils";

type SidebarNavItemProps = {
  item: NavItemConfig;
  collapsed: boolean;
  isActive: boolean;
};

const badgeStyles = {
  default: "bg-surface-hover text-text-muted",
  info: "bg-info/10 text-info",
  warning: "bg-warning/10 text-warning",
} as const;

function NavBadge({ label, variant = "default" }: NonNullable<NavItemConfig["badge"]>) {
  return (
    <span
      className={cn(
        "ml-auto shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
        badgeStyles[variant],
      )}
    >
      {label}
    </span>
  );
}

export function SidebarNavItem({
  item,
  collapsed,
  isActive,
}: SidebarNavItemProps) {
  const Icon = item.icon;

  if (!item.enabled) {
    return (
      <span
        aria-disabled="true"
        title="Coming in a future phase"
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-text-muted opacity-50",
          collapsed && "justify-center px-2",
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {!collapsed && (
          <>
            <span className="truncate">{item.title}</span>
            {item.badge ? <NavBadge {...item.badge} /> : null}
          </>
        )}
      </span>
    );
  }

  return (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
        collapsed && "justify-center px-2",
        isActive
          ? "bg-surface-hover text-text-primary"
          : "text-text-secondary hover:bg-surface-hover hover:text-text-primary",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && (
        <>
          <span className="truncate">{item.title}</span>
          {item.badge ? <NavBadge {...item.badge} /> : null}
        </>
      )}
    </Link>
  );
}
