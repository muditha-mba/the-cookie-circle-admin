import type { ReactNode } from "react";

import { BusinessSettingsTabs } from "@/components/business-settings/BusinessSettingsTabs";
import { AppShell } from "@/components/layout/AppShell";

type BusinessSettingsPageShellProps = {
  children: ReactNode;
};

export function BusinessSettingsPageShell({ children }: BusinessSettingsPageShellProps) {
  return (
    <AppShell
      title="Business Settings"
      description="Configure delivery operations, website contact details, social links, and FAQs."
    >
      <div className="space-y-6">
        <BusinessSettingsTabs />
        {children}
      </div>
    </AppShell>
  );
}
