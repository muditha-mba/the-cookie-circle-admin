import { ProductionDashboard } from "@/components/production/ProductionDashboard";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";

export default function ProductionPage() {
  return (
    <DashboardPageShell
      title="Production"
      description="Weekly batch planning — product demand, ingredients, packaging, and fulfillment status."
    >
      <ProductionDashboard />
    </DashboardPageShell>
  );
}
