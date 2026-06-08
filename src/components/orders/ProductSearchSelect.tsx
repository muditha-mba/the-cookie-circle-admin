"use client";

import { ChevronDown, Search, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { formInputClassName } from "@/components/forms/FormField";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { ProductSummary } from "@/lib/api/products";
import { productsApi } from "@/lib/api/products";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

export type ProductSearchOption = Pick<ProductSummary, "id" | "name" | "selling_price">;

type ProductSearchSelectProps = {
  value: string;
  onChange: (productId: string) => void;
  initialProduct?: ProductSearchOption | null;
  disabled?: boolean;
};

export function ProductSearchSelect({
  value,
  onChange,
  initialProduct = null,
  disabled = false,
}: ProductSearchSelectProps) {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<ProductSearchOption | null>(initialProduct);
  const [results, setResults] = useState<ProductSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const debouncedQuery = useDebouncedValue(query, 300);

  useEffect(() => {
    if (!value) {
      setSelected(null);
      return;
    }
    if (selected?.id === value) {
      return;
    }
    if (initialProduct?.id === value) {
      setSelected(initialProduct);
      return;
    }
    void productsApi
      .get(value)
      .then((product) =>
        setSelected({
          id: product.id,
          name: product.name,
          selling_price: product.selling_price,
        }),
      )
      .catch(() => setSelected(null));
  }, [value, initialProduct, selected?.id]);

  useEffect(() => {
    if (!open) {
      return;
    }

    void (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const response = await productsApi.list({
          search: debouncedQuery.trim() || undefined,
          page: 1,
          page_size: 25,
          sort_by: "name",
          sort_order: "asc",
        });
        setResults(response.items.filter((product) => product.is_active));
      } catch {
        setResults([]);
        setLoadError("Unable to search products.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [debouncedQuery, open]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const handleSelect = (product: ProductSummary) => {
    const option: ProductSearchOption = {
      id: product.id,
      name: product.name,
      selling_price: product.selling_price,
    };
    setSelected(option);
    setQuery("");
    setOpen(false);
    onChange(product.id);
  };

  const handleClear = () => {
    setSelected(null);
    setQuery("");
    onChange("");
  };

  const inputValue = open
    ? query
    : selected
      ? `${selected.name} · ${formatCurrency(selected.selling_price)}`
      : "";

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          autoComplete="off"
          disabled={disabled}
          placeholder={selected ? undefined : "Search by name or product ID"}
          className={cn(formInputClassName, "pl-9 pr-16")}
          value={inputValue}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            if (selected) {
              setSelected(null);
              onChange("");
            }
          }}
          onFocus={() => setOpen(true)}
        />
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {selected ? (
            <button
              type="button"
              onClick={handleClear}
              className="rounded p-1 text-text-muted hover:bg-surface-hover hover:text-text-primary"
              aria-label="Clear product"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="rounded p-1 text-text-muted hover:bg-surface-hover hover:text-text-primary"
            aria-label="Toggle product list"
          >
            <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
          </button>
        </div>
      </div>

      {open ? (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-md border border-border bg-surface py-1 shadow-lg"
        >
          {isLoading ? (
            <li className="px-3 py-2 text-sm text-text-muted">Searching…</li>
          ) : loadError ? (
            <li className="px-3 py-2 text-sm text-danger">{loadError}</li>
          ) : results.length === 0 ? (
            <li className="px-3 py-2 text-sm text-text-muted">No products found.</li>
          ) : (
            results.map((product) => (
              <li key={product.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={value === product.id}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm hover:bg-surface-hover",
                    value === product.id && "bg-surface-hover",
                  )}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSelect(product)}
                >
                  <span className="block font-medium text-text-primary">
                    {product.name}
                    <span className="font-normal text-text-muted">
                      {" "}
                      · {formatCurrency(product.selling_price)}
                    </span>
                  </span>
                  <span className="mt-0.5 block font-mono text-xs text-text-muted">
                    {product.id}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}

      {selected && !open ? (
        <p className="mt-1 font-mono text-xs text-text-muted">ID: {selected.id}</p>
      ) : null}
    </div>
  );
}
