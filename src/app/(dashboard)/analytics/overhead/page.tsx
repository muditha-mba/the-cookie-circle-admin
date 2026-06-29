import { AnalyticsErrorBoundary } from "@/components/analytics/AnalyticsErrorBoundary";
import { OverheadAnalyticsDashboard } from "@/components/analytics/overhead/OverheadAnalyticsDashboard";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";

export default function OverheadAnalyticsPage() {
  return (
    <DashboardPageShell
      title="Overhead Analytics"
      description="Utility and labour monthly costs, operating profit after overhead, and spend by category."
    >
      <AnalyticsErrorBoundary title="Overhead analytics unavailable">
        <OverheadAnalyticsDashboard />
      </AnalyticsErrorBoundary>
    </DashboardPageShell>
  );
}
