import type { ProductionOutOfRangeHint } from "@/lib/api/analytics";
import { formatDate, formatQuantity } from "@/lib/format";

export function buildProductionChartEmptyDescription(
  baseDescription: string,
  hint: ProductionOutOfRangeHint | undefined,
): string {
  if (!hint?.has_upcoming_outside_range || !hint.delivery_date) {
    return baseDescription;
  }

  const collectionCount = Number(hint.collection_count) || 0;
  const productCount = Number(hint.product_count) || 0;
  const detailParts = [
    `${hint.order_count.toLocaleString("en-LK")} orders`,
    `${collectionCount.toLocaleString("en-LK")} collections`,
  ];
  if (productCount > 0) {
    detailParts.push(`${formatQuantity(hint.product_count, "product units")}`);
  }

  return [
    "No data exists within the selected range.",
    "",
    `Upcoming production is scheduled for ${formatDate(hint.delivery_date)}.`,
    detailParts.join(" · "),
  ].join("\n");
}
