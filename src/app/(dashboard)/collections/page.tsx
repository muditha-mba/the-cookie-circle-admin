import { CollectionList } from "@/components/collections/CollectionList";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";

export default function CollectionsPage() {
  return (
    <DashboardPageShell
      title="Collections"
      description="Manage customer-facing bundles and collection profitability."
    >
      <CollectionList />
    </DashboardPageShell>
  );
}
