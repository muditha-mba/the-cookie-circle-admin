import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SidebarNavSectionProps = {
  title: string;
  collapsed: boolean;
  showDivider: boolean;
  children: ReactNode;
};

export function SidebarNavSection({
  title,
  collapsed,
  showDivider,
  children,
}: SidebarNavSectionProps) {
  return (
    <div className={cn(showDivider && "mt-2")}>
      {showDivider && collapsed ? (
        <div className="mx-2 mb-2 border-t border-border" aria-hidden />
      ) : null}
      {!collapsed ? (
        <p className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
          {title}
        </p>
      ) : null}
      <div className="space-y-1">{children}</div>
    </div>
  );
}
