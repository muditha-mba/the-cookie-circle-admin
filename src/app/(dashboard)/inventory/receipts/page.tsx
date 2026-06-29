import { PurchaseReceiptList } from "@/components/inventory/PurchaseReceiptList";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";

export default function PurchaseReceiptsPage() {
  return (
    <DashboardPageShell
      title="Purchase Receipts"
      description="Record supplier purchases and receive stock into inventory."
    >
      <PurchaseReceiptList />
    </DashboardPageShell>
  );
}
