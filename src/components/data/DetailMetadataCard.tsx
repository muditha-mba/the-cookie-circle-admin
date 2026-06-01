import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type DetailMetadataCardProps = {
  children: ReactNode;
  className?: string;
};

/** Full-width card; fields flow into as many columns as fit (auto-fill). */
export function DetailMetadataCard({ children, className }: DetailMetadataCardProps) {
  return (
    <dl
      className={cn(
        "mb-8 grid w-full gap-x-10 gap-y-5 rounded-lg border border-border bg-surface p-5",
        "grid-cols-[repeat(auto-fill,minmax(min(100%,10.5rem),1fr))]",
        className,
      )}
    >
      {children}
    </dl>
  );
}
