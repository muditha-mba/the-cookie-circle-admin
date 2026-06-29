import { AnalyticsErrorBoundary } from "@/components/analytics/AnalyticsErrorBoundary";
import { CustomerAnalyticsDashboard } from "@/components/analytics/customers/CustomerAnalyticsDashboard";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";

export default function CustomerAnalyticsPage() {
  return (
    <DashboardPageShell
      title="Customer Analytics"
      description="Growth, retention, value, and acquisition insights from CRM and order data."
    >
      <AnalyticsErrorBoundary title="Customer analytics unavailable">
        <CustomerAnalyticsDashboard />
      </AnalyticsErrorBoundary>
    </DashboardPageShell>
  );
}
