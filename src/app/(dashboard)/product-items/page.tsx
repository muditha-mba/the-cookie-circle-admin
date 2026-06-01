import { ProductItemList } from "@/components/product-items/ProductItemList";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";

export default function ProductItemsPage() {
  return (
    <DashboardPageShell
      title="Product Items"
      description="Manage purchased resources and unit costs."
    >
      <ProductItemList />
    </DashboardPageShell>
  );
}
