import { ProductList } from "@/components/products/ProductList";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";

export default function ProductsPage() {
  return (
    <DashboardPageShell
      title="Products"
      description="Manage sellable products, recipes, and profitability."
    >
      <ProductList />
    </DashboardPageShell>
  );
}
