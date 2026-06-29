import { CustomerList } from "@/components/customers/CustomerList";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";

export default function CustomersPage() {
  return (
    <DashboardPageShell
      title="Customers"
      description="Manage registered, guest, and manually entered customers."
    >
      <CustomerList />
    </DashboardPageShell>
  );
}
