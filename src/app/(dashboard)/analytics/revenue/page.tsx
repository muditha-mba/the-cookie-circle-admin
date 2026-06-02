import { AnalyticsErrorBoundary } from "@/components/analytics/AnalyticsErrorBoundary";
import { RevenueAnalyticsDashboard } from "@/components/analytics/revenue/RevenueAnalyticsDashboard";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";

export default function RevenueAnalyticsPage() {
  return (
    <DashboardPageShell
      title="Revenue Analytics"
      description="Executive view of revenue, profit, margins, and order performance from snapshot data."
    >
      <AnalyticsErrorBoundary title="Revenue analytics unavailable">
        <RevenueAnalyticsDashboard />
      </AnalyticsErrorBoundary>
    </DashboardPageShell>
  );
}
