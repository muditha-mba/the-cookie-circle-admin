import { AnalyticsErrorBoundary } from "@/components/analytics/AnalyticsErrorBoundary";
import { ProductionAnalyticsDashboard } from "@/components/analytics/production/ProductionAnalyticsDashboard";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";

export default function ProductionAnalyticsPage() {
  return (
    <DashboardPageShell
      title="Production Analytics"
      description="Production volume, ingredient and packaging demand, and delivery batch utilization."
    >
      <AnalyticsErrorBoundary title="Production analytics unavailable">
        <ProductionAnalyticsDashboard />
      </AnalyticsErrorBoundary>
    </DashboardPageShell>
  );
}
