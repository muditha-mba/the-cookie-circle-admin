"use client";

import dynamic from "next/dynamic";

import type { DeliveryLocationPickerProps } from "@/components/orders/DeliveryLocationPicker";

const DeliveryLocationPicker = dynamic(
  () =>
    import("@/components/orders/DeliveryLocationPicker").then(
      (module) => module.DeliveryLocationPicker,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[280px] items-center justify-center rounded-lg border border-border bg-surface-hover text-sm text-text-muted">
        Loading map…
      </div>
    ),
  },
);

export function DeliveryLocationPickerLazy(props: DeliveryLocationPickerProps) {
  return <DeliveryLocationPicker {...props} />;
}
