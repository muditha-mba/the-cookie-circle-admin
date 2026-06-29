import { BusinessSettingsPageShell } from "@/components/business-settings/BusinessSettingsPageShell";
import { SharedMemoriesSectionToggle } from "@/components/business-settings/SharedMemoriesSectionToggle";
import { SharedMemoryList } from "@/components/business-settings/SharedMemoryList";

export default function SharedMemoriesPage() {
  return (
    <BusinessSettingsPageShell>
      <div className="space-y-8">
        <SharedMemoriesSectionToggle />
        <SharedMemoryList />
      </div>
    </BusinessSettingsPageShell>
  );
}
