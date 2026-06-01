"use client";

import { ChevronDown, Search, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { formInputClassName } from "@/components/forms/FormField";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { CustomerListItem } from "@/lib/api/customers";
import { customersApi } from "@/lib/api/customers";
import { cn } from "@/lib/utils";

export type CustomerSearchOption = Pick<
  CustomerListItem,
  "id" | "first_name" | "last_name" | "email" | "phone"
>;

type CustomerSearchSelectProps = {
  value: string;
  onChange: (customerId: string, customer: CustomerSearchOption | null) => void;
  initialCustomer?: CustomerSearchOption | null;
  error?: string;
  disabled?: boolean;
};

function customerDisplayName(customer: CustomerSearchOption) {
  return `${customer.first_name} ${customer.last_name}`.trim();
}

function customerSubtitle(customer: CustomerSearchOption) {
  return customer.email ?? customer.phone ?? "No contact details";
}

export function CustomerSearchSelect({
  value,
  onChange,
  initialCustomer = null,
  error,
  disabled = false,
}: CustomerSearchSelectProps) {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<CustomerSearchOption | null>(initialCustomer);
  const [results, setResults] = useState<CustomerListItem[]>([]);
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
    if (initialCustomer?.id === value) {
      setSelected(initialCustomer);
      return;
    }
    void customersApi
      .get(value)
      .then((customer) => setSelected(customer))
      .catch(() => setSelected(null));
  }, [value, initialCustomer, selected?.id]);

  useEffect(() => {
    if (!open) {
      return;
    }

    void (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const response = await customersApi.list({
          search: debouncedQuery.trim() || undefined,
          page: 1,
          page_size: 25,
          sort_by: "first_name",
          sort_order: "asc",
        });
        setResults(response.items.filter((customer) => customer.is_active));
      } catch {
        setResults([]);
        setLoadError("Unable to search customers.");
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

  const handleSelect = (customer: CustomerListItem) => {
    const option: CustomerSearchOption = {
      id: customer.id,
      first_name: customer.first_name,
      last_name: customer.last_name,
      email: customer.email,
      phone: customer.phone,
    };
    setSelected(option);
    setQuery("");
    setOpen(false);
    onChange(customer.id, option);
  };

  const handleClear = () => {
    setSelected(null);
    setQuery("");
    onChange("", null);
  };

  const inputValue = open
    ? query
    : selected
      ? `${customerDisplayName(selected)} · ${customerSubtitle(selected)}`
      : "";

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          id="customer_id"
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          autoComplete="off"
          disabled={disabled}
          placeholder={selected ? undefined : "Search by name, email, phone, or customer ID"}
          className={cn(formInputClassName, "pl-9 pr-16")}
          value={inputValue}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            if (selected) {
              setSelected(null);
              onChange("", null);
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
              aria-label="Clear customer"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="rounded p-1 text-text-muted hover:bg-surface-hover hover:text-text-primary"
            aria-label="Toggle customer list"
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
            <li className="px-3 py-2 text-sm text-text-muted">No customers found.</li>
          ) : (
            results.map((customer) => (
              <li key={customer.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={value === customer.id}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm hover:bg-surface-hover",
                    value === customer.id && "bg-surface-hover",
                  )}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSelect(customer)}
                >
                  <span className="block font-medium text-text-primary">
                    {customerDisplayName(customer)}
                    <span className="font-normal text-text-muted">
                      {" "}
                      · {customerSubtitle(customer)}
                    </span>
                  </span>
                  <span className="mt-0.5 block font-mono text-xs text-text-muted">
                    {customer.id}
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

      {error ? <p className="mt-1 text-sm text-danger">{error}</p> : null}
    </div>
  );
}
