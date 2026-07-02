"use client";

import { Check, Copy, Printer, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { PrimaryButton, SecondaryButton } from "@/components/data/PageActions";
import { formInputClassName, FormField } from "@/components/forms/FormField";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import {
  recipeCalculatorApi,
  type RecipeCalculatorProductOption,
  type RecipeCalculatorResponse,
} from "@/lib/api/recipe-calculator";
import { formatCount, formatCurrency, formatDecimal } from "@/lib/format";
import {
  buildRecipeCalculatorSheet,
  formatScaledQuantity,
} from "@/lib/tools/recipe-calculator";
import { cn } from "@/lib/utils";

const tableHeadClass = "border-b border-border text-text-secondary";
const tableThClass = "pb-2 font-medium";
const tableRowClass = "border-b border-border/60 last:border-0";
const tableTdClass = "py-2.5";

export function RecipeCalculatorPage() {
  const { canViewFinancials } = useAdminPermissions();
  const [products, setProducts] = useState<RecipeCalculatorProductOption[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [productId, setProductId] = useState("");
  const [targetQuantity, setTargetQuantity] = useState("");
  const [result, setResult] = useState<RecipeCalculatorResponse | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [calculationError, setCalculationError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === productId) ?? null,
    [productId, products],
  );

  const parsedTargetQuantity = useMemo(() => {
    const trimmed = targetQuantity.trim();
    if (!trimmed) {
      return null;
    }

    const value = Number(trimmed);
    if (!Number.isInteger(value) || value <= 0) {
      return null;
    }

    return value;
  }, [targetQuantity]);

  const formError = useMemo(() => {
    if (!productId) {
      return null;
    }

    if (!targetQuantity.trim()) {
      return null;
    }

    if (parsedTargetQuantity == null) {
      return "Enter a whole number greater than zero.";
    }

    return null;
  }, [parsedTargetQuantity, productId, targetQuantity]);

  const canCalculate =
    Boolean(productId) && parsedTargetQuantity != null && !calculating && !productsLoading;

  const loadProducts = useCallback(async () => {
    setProductsLoading(true);
    setProductsError(null);

    try {
      const response = await recipeCalculatorApi.listProducts();
      setProducts(response.products);
    } catch {
      setProducts([]);
      setProductsError("Unable to load products with recipes.");
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const handleCalculate = async () => {
    if (!productId || parsedTargetQuantity == null) {
      return;
    }

    setCalculating(true);
    setCalculationError(null);

    try {
      const response = await recipeCalculatorApi.calculate({
        product_id: productId,
        target_quantity: parsedTargetQuantity,
      });
      setResult(response);
    } catch {
      setResult(null);
      setCalculationError("Unable to calculate recipe quantities.");
      toast.error("Unable to calculate recipe quantities.");
    } finally {
      setCalculating(false);
    }
  };

  const handleReset = () => {
    setProductId("");
    setTargetQuantity("");
    setResult(null);
    setCalculationError(null);
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!result) {
      return;
    }

    try {
      await navigator.clipboard.writeText(buildRecipeCalculatorSheet(result));
      setCopied(true);
      toast.success("Kitchen sheet copied to clipboard.");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Unable to copy kitchen sheet.");
    }
  };

  const handlePrint = () => {
    if (!result) {
      return;
    }

    const printWindow = window.open("", "_blank", "noopener,noreferrer,width=720,height=900");
    if (!printWindow) {
      toast.error("Unable to open print window.");
      return;
    }

    const sheet = buildRecipeCalculatorSheet(result)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    printWindow.document.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${result.product_name} — Recipe Calculator</title>
    <style>
      body { font-family: ui-sans-serif, system-ui, sans-serif; padding: 24px; color: #111; }
      pre { white-space: pre-wrap; font-size: 14px; line-height: 1.5; }
    </style>
  </head>
  <body>
    <pre>${sheet}</pre>
    <script>window.onload = () => { window.print(); };</script>
  </body>
</html>`);
    printWindow.document.close();
  };

  return (
    <DashboardPageShell
      title="Recipe Calculator"
      description="Scale a product recipe to any cookie count using the recipe yield and ingredient lines already in your catalog."
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <section className="space-y-6 rounded-lg border border-border bg-surface p-6">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">Calculation settings</h2>
            <p className="mt-1 text-xs text-text-muted">
              Select a product with a recipe, enter how many cookies you need, then calculate
              scaled ingredient quantities.
            </p>
          </div>

          <FormField
            label="Product"
            htmlFor="recipe-product"
            hint="Only products with recipe lines and a positive recipe yield are listed."
            error={productsError ?? undefined}
          >
            <select
              id="recipe-product"
              className={formInputClassName}
              value={productId}
              disabled={productsLoading || Boolean(productsError)}
              onChange={(event) => {
                setProductId(event.target.value);
                setResult(null);
                setCalculationError(null);
              }}
            >
              <option value="">
                {productsLoading
                  ? "Loading products..."
                  : products.length === 0
                    ? "No eligible products"
                    : "Select a product"}
              </option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} (yield: {formatCount(product.yield_quantity)})
                </option>
              ))}
            </select>
          </FormField>

          {selectedProduct ? (
            <div className="rounded-md border border-border/70 bg-surface-elevated px-4 py-3 text-sm text-text-secondary">
              Recipe yield for this product:{" "}
              <span className="font-medium text-text-primary">
                {formatCount(selectedProduct.yield_quantity)} cookies
              </span>
            </div>
          ) : null}

          <FormField
            label="Target cookie count"
            htmlFor="target-quantity"
            error={formError ?? undefined}
            hint="Enter the number of cookies you want to make."
          >
            <input
              id="target-quantity"
              type="number"
              min={1}
              step={1}
              inputMode="numeric"
              className={formInputClassName}
              value={targetQuantity}
              onChange={(event) => {
                setTargetQuantity(event.target.value);
                setResult(null);
                setCalculationError(null);
              }}
              placeholder="e.g. 8"
            />
          </FormField>

          <div className="flex flex-wrap gap-3">
            <PrimaryButton
              type="button"
              onClick={() => void handleCalculate()}
              disabled={!canCalculate}
            >
              {calculating ? "Calculating..." : "Calculate"}
            </PrimaryButton>
            <SecondaryButton type="button" onClick={handleReset}>
              <span className="inline-flex items-center gap-2">
                <RotateCcw className="size-4" aria-hidden />
                Reset
              </span>
            </SecondaryButton>
          </div>

          {calculationError ? (
            <p className="text-sm text-danger">{calculationError}</p>
          ) : null}
        </section>

        <section className="space-y-6 rounded-lg border border-border bg-surface p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-text-primary">Scaled recipe</h2>
              <p className="mt-1 text-xs text-text-muted">
                Ingredient quantities are scaled linearly from the recipe yield. Count and packaging
                units also show a suggested whole-number amount.
              </p>
            </div>

            {result ? (
              <div className="flex flex-wrap gap-2">
                <SecondaryButton type="button" onClick={() => void handleCopy()}>
                  <span className="inline-flex items-center gap-2">
                    {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
                    {copied ? "Copied" : "Copy sheet"}
                  </span>
                </SecondaryButton>
                <SecondaryButton type="button" onClick={handlePrint}>
                  <span className="inline-flex items-center gap-2">
                    <Printer className="size-4" aria-hidden />
                    Print
                  </span>
                </SecondaryButton>
              </div>
            ) : null}
          </div>

          {!result ? (
            <div className="rounded-md border border-dashed border-border px-4 py-10 text-center text-sm text-text-muted">
              Choose a product and target quantity, then calculate to see scaled ingredients here.
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-3">
                <SummaryStat label="Recipe yield" value={`${formatCount(result.yield_quantity)} cookies`} />
                <SummaryStat label="Target quantity" value={`${formatCount(result.target_quantity)} cookies`} />
                <SummaryStat label="Scale factor" value={`${formatDecimal(result.scale_factor)}×`} />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className={tableHeadClass}>
                      <th className={tableThClass}>Ingredient</th>
                      <th className={tableThClass}>Original recipe quantity</th>
                      <th className={tableThClass}>Scaled quantity</th>
                      {canViewFinancials ? (
                        <th className={cn(tableThClass, "text-right")}>Scaled cost</th>
                      ) : null}
                    </tr>
                  </thead>
                  <tbody>
                    {result.ingredients.map((line) => (
                      <tr key={line.product_item_id} className={tableRowClass}>
                        <td className={cn(tableTdClass, "font-medium text-text-primary")}>
                          {line.product_item_name}
                        </td>
                        <td className={cn(tableTdClass, "text-text-secondary")}>
                          {formatScaledQuantity(
                            line.recipe_quantity,
                            line.unit,
                            line.is_discrete,
                          )}
                        </td>
                        <td className={tableTdClass}>
                          <div className="text-text-primary">
                            {formatScaledQuantity(
                              line.scaled_quantity,
                              line.unit,
                              line.is_discrete,
                            )}
                          </div>
                          {line.is_discrete && line.suggested_quantity != null ? (
                            <p className="mt-1 text-xs text-text-muted">
                              Suggested: Use {formatCount(line.suggested_quantity)} {line.unit}
                            </p>
                          ) : null}
                        </td>
                        {canViewFinancials ? (
                          <td className={cn(tableTdClass, "text-right tabular-nums")}>
                            {line.scaled_line_cost ? formatCurrency(line.scaled_line_cost) : "—"}
                          </td>
                        ) : null}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {result.production_notes?.trim() ? (
                <div className="rounded-md border border-border/70 bg-surface-elevated px-4 py-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    Production notes
                  </h3>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-text-primary">
                    {result.production_notes.trim()}
                  </p>
                </div>
              ) : null}

              {canViewFinancials && result.cost_summary ? (
                <div className="rounded-md border border-border/70 bg-surface-elevated px-4 py-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
                    Cost estimate
                  </h3>
                  <dl className="mt-3 divide-y divide-border text-sm">
                    <CostRow
                      label="Ingredients subtotal"
                      value={formatCurrency(result.cost_summary.ingredients_subtotal)}
                    />
                    <CostRow
                      label="Buffer"
                      value={formatCurrency(result.cost_summary.buffer_amount)}
                    />
                    <CostRow
                      label="Total cost"
                      value={formatCurrency(result.cost_summary.total_cost)}
                    />
                    <CostRow
                      label="Cost per cookie"
                      value={formatCurrency(result.cost_summary.cost_per_unit)}
                    />
                  </dl>
                </div>
              ) : null}
            </div>
          )}
        </section>
      </div>
    </DashboardPageShell>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/70 bg-surface-elevated px-4 py-3">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="mt-1 text-sm font-medium text-text-primary">{value}</p>
    </div>
  );
}

function CostRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <dt className="text-text-secondary">{label}</dt>
      <dd className="font-medium tabular-nums text-text-primary">{value}</dd>
    </div>
  );
}
