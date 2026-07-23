import { CollectionList } from "@/components/collections/CollectionList";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";

export default function CollectionsPage() {
  return (
    <DashboardPageShell
      title="Packages"
      description="Size packages (Tea, Warm, Gathering, etc.). Keep one public orderable package per collection type for the website."
    >
      <CollectionList />
    </DashboardPageShell>
  );
}
