import { SupplierList } from "@/components/suppliers/SupplierList";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";

export default function SuppliersPage() {
  return (
    <DashboardPageShell
      title="Suppliers"
      description="Manage vendors for ingredients, packaging, and other product items."
    >
      <SupplierList />
    </DashboardPageShell>
  );
}
