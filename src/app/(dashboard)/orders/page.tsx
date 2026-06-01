import { OrderList } from "@/components/orders/OrderList";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";

export default function OrdersPage() {
  return (
    <DashboardPageShell
      title="Orders"
      description="Manage collection orders with snapshots and profitability."
    >
      <OrderList />
    </DashboardPageShell>
  );
}
