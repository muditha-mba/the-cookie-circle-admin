import { BusinessSettingsPageShell } from "@/components/business-settings/BusinessSettingsPageShell";
import { FaqCategoryList } from "@/components/business-settings/FaqCategoryList";
import { FaqList } from "@/components/business-settings/FaqList";

export default function FaqsPage() {
  return (
    <BusinessSettingsPageShell>
      <div className="space-y-8">
        <FaqCategoryList />
        <FaqList />
      </div>
    </BusinessSettingsPageShell>
  );
}
