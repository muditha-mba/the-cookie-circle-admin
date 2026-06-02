import { AnalyticsErrorBoundary } from "@/components/analytics/AnalyticsErrorBoundary";
import { CollectionAnalyticsDashboard } from "@/components/analytics/collections/CollectionAnalyticsDashboard";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";

export default function CollectionAnalyticsPage() {
  return (
    <DashboardPageShell
      title="Collection Analytics"
      description="Collection revenue, profit, volume, and margin from order line snapshots."
    >
      <AnalyticsErrorBoundary title="Collection analytics unavailable">
        <CollectionAnalyticsDashboard />
      </AnalyticsErrorBoundary>
    </DashboardPageShell>
  );
}
