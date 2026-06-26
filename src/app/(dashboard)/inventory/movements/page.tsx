import { InventoryMovementList } from "@/components/inventory/InventoryMovementList";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";

export default function InventoryMovementsPage() {
  return (
    <DashboardPageShell title="Inventory Movements" description="Audit trail of stock changes.">
      <InventoryMovementList />
    </DashboardPageShell>
  );
}
