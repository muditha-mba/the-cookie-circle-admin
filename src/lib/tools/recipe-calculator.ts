import type { RecipeCalculatorResponse } from "@/lib/api/recipe-calculator";
import { formatCount, formatCurrency, formatDecimal } from "@/lib/format";

export function formatScaledQuantity(
  value: string | number,
  unit: string,
  isDiscrete: boolean,
): string {
  const formatted = isDiscrete ? formatDecimal(value) : formatDecimal(value);
  if (formatted === "—") {
    return unit;
  }
  return `${formatted} ${unit}`;
}

export function buildRecipeCalculatorSheet(result: RecipeCalculatorResponse): string {
  const lines: string[] = [
    "Recipe Calculator",
    "=================",
    `Product: ${result.product_name}`,
    `Target quantity: ${formatCount(result.target_quantity)} cookies`,
    `Recipe yield: ${formatCount(result.yield_quantity)} cookies`,
    `Scale factor: ${formatDecimal(result.scale_factor)}×`,
    "",
    "Ingredients",
    "-----------",
  ];

  for (const line of result.ingredients) {
    const scaled = formatScaledQuantity(
      line.scaled_quantity,
      line.unit,
      line.is_discrete,
    );
    const recipe = formatScaledQuantity(
      line.recipe_quantity,
      line.unit,
      line.is_discrete,
    );

    lines.push(`${line.product_item_name}`);
    lines.push(`  Original recipe quantity: ${recipe}`);
    lines.push(`  Scaled: ${scaled}`);
    if (line.is_discrete && line.suggested_quantity != null) {
      lines.push(`  Suggested: Use ${formatCount(line.suggested_quantity)} ${line.unit}`);
    }
    lines.push("");
  }

  if (result.production_notes?.trim()) {
    lines.push("Production notes");
    lines.push("----------------");
    lines.push(result.production_notes.trim());
    lines.push("");
  }

  if (result.cost_summary) {
    lines.push("Cost estimate");
    lines.push("-------------");
    lines.push(
      `Ingredients subtotal: ${formatCurrency(result.cost_summary.ingredients_subtotal)}`,
    );
    lines.push(`Buffer: ${formatCurrency(result.cost_summary.buffer_amount)}`);
    lines.push(`Total cost: ${formatCurrency(result.cost_summary.total_cost)}`);
    lines.push(`Cost per cookie: ${formatCurrency(result.cost_summary.cost_per_unit)}`);
  }

  return lines.join("\n").trimEnd();
}
