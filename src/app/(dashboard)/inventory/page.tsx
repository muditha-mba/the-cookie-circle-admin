import { InventoryBalanceList } from "@/components/inventory/InventoryBalanceList";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";

export default function InventoryOverviewPage() {
  return (
    <DashboardPageShell
      title="Stock Overview"
      description="On-hand balances for tracked product items."
    >
      <InventoryBalanceList />
    </DashboardPageShell>
  );
}
