import { AnalyticsErrorBoundary } from "@/components/analytics/AnalyticsErrorBoundary";
import { ProductAnalyticsDashboard } from "@/components/analytics/products/ProductAnalyticsDashboard";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";

export default function ProductAnalyticsPage() {
  return (
    <DashboardPageShell
      title="Product Analytics"
      description="Product and collection performance from order snapshot data."
    >
      <AnalyticsErrorBoundary title="Product analytics unavailable">
        <ProductAnalyticsDashboard />
      </AnalyticsErrorBoundary>
    </DashboardPageShell>
  );
}
