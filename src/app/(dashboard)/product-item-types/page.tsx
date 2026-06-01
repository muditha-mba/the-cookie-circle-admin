import { ProductItemTypeList } from "@/components/product-item-types/ProductItemTypeList";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";

export default function ProductItemTypesPage() {
  return (
    <DashboardPageShell
      title="Product Item Types"
      description="Manage categories of resources used in costing."
    >
      <ProductItemTypeList />
    </DashboardPageShell>
  );
}
