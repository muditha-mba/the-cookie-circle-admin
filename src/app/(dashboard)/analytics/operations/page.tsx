import { AnalyticsErrorBoundary } from "@/components/analytics/AnalyticsErrorBoundary";
import { OperationsAnalyticsDashboard } from "@/components/analytics/operations/OperationsAnalyticsDashboard";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";

export default function OperationsAnalyticsPage() {
  return (
    <DashboardPageShell
      title="Operations Analytics"
      description="Executive overview of revenue, fulfillment, deliveries, payments, and production workload."
    >
      <AnalyticsErrorBoundary title="Operations analytics unavailable">
        <OperationsAnalyticsDashboard />
      </AnalyticsErrorBoundary>
    </DashboardPageShell>
  );
}
