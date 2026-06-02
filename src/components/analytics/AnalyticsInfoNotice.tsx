"use client";

import { Info } from "lucide-react";

import { cn } from "@/lib/utils";

type AnalyticsInfoNoticeProps = {
  children: React.ReactNode;
  className?: string;
};

export function AnalyticsInfoNotice({ children, className }: AnalyticsInfoNoticeProps) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg border border-info/30 bg-info/10 px-4 py-3 text-sm text-text-primary",
        className,
      )}
      role="note"
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-info" aria-hidden />
      <div className="space-y-1 leading-relaxed text-text-secondary">{children}</div>
    </div>
  );
}
