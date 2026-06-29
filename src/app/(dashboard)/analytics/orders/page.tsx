import { AnalyticsErrorBoundary } from "@/components/analytics/AnalyticsErrorBoundary";
import { OrderAnalyticsDashboard } from "@/components/analytics/orders/OrderAnalyticsDashboard";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";

export default function OrderAnalyticsPage() {
  return (
    <DashboardPageShell
      title="Order Analytics"
      description="Order lifecycle, fulfillment, delivery, payment, and operational performance."
    >
      <AnalyticsErrorBoundary title="Order analytics unavailable">
        <OrderAnalyticsDashboard />
      </AnalyticsErrorBoundary>
    </DashboardPageShell>
  );
}
