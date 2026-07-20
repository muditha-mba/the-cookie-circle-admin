import { CollectionPackageList } from "@/components/collection-packages/CollectionPackageList";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";

export default function CollectionPackagesPage() {
  return (
    <DashboardPageShell
      title="Collections"
      description="Butter, Mix & Match, and Special Edition — customer-facing collection types with quantity ranges and packaging fees."
    >
      <CollectionPackageList />
    </DashboardPageShell>
  );
}
