"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

const TAB_ITEMS = [
  { href: routes.businessSettings.operations, label: "Operations" },
  { href: routes.businessSettings.contact, label: "Contact" },
  { href: routes.businessSettings.socialMedia, label: "Social Media" },
  { href: routes.businessSettings.faqs.list, label: "FAQs" },
  { href: routes.businessSettings.sharedMemories.list, label: "Shared Memories" },
] as const;

export function BusinessSettingsTabs() {
  const pathname = usePathname();

  return (
    <div className="rounded-lg border border-border bg-surface">
      <nav
        aria-label="Business settings sections"
        className="flex flex-wrap gap-1 p-1.5"
      >
        {TAB_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-surface-elevated text-text-primary shadow-sm"
                  : "text-text-secondary hover:bg-surface-hover hover:text-text-primary",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
