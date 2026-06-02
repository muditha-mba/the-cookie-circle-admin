import { ExecutiveOverviewDashboard } from "@/components/analytics/executive/ExecutiveOverviewDashboard";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";

export default function AnalyticsPage() {
  return (
    <DashboardPageShell
      title="Analytics Executive Overview"
      description="Executive KPIs, highlights, trends, and operations snapshot."
    >
      <ExecutiveOverviewDashboard />
    </DashboardPageShell>
  );
}
