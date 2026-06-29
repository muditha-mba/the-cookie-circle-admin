import { DeliveryAreaList } from "@/components/delivery-areas/DeliveryAreaList";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";

export default function DeliveryAreasPage() {
  return (
    <DashboardPageShell
      title="Delivery Areas"
      description="Manage delivery zones, fee overrides, and pickup-only areas."
    >
      <DeliveryAreaList />
    </DashboardPageShell>
  );
}
