import { CollectionPackageList } from "@/components/collection-packages/CollectionPackageList";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";

export default function CollectionPackagesPage() {
  return (
    <DashboardPageShell
      title="Collection Packages"
      description="Manage package definitions used by collections."
    >
      <CollectionPackageList />
    </DashboardPageShell>
  );
}
