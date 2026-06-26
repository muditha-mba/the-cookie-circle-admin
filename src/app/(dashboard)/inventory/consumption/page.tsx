import { ConsumptionProposalList } from "@/components/inventory/ConsumptionProposalList";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";

export default function ConsumptionProposalsPage() {
  return (
    <DashboardPageShell
      title="Stock Reviews"
      description="Review and approve ingredient and packaging deductions for delivered orders."
    >
      <ConsumptionProposalList />
    </DashboardPageShell>
  );
}
