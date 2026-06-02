import { AnalyticsLanding } from "@/components/analytics/AnalyticsLanding";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";

export default function AnalyticsPage() {
  return (
    <DashboardPageShell
      title="Analytics"
      description="Metrics foundation for revenue, customers, products, production, and orders."
    >
      <AnalyticsLanding />
    </DashboardPageShell>
  );
}
