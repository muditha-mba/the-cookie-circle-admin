import { InventoryLotList } from "@/components/inventory/InventoryLotList";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";

export default function InventoryLotsPage() {
  return (
    <DashboardPageShell title="Inventory Lots" description="Lot balances with expiry dates.">
      <InventoryLotList />
    </DashboardPageShell>
  );
}
