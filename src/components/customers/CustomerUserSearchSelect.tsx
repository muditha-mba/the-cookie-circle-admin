"use client";

import { ChevronDown, Search, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { formInputClassName } from "@/components/forms/FormField";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { LinkableUser } from "@/lib/api/users";
import { usersApi } from "@/lib/api/users";
import { cn } from "@/lib/utils";

type CustomerUserSearchSelectProps = {
  value: string;
  onChange: (userId: string, user: LinkableUser | null) => void;
  initialUser?: LinkableUser | null;
  error?: string;
  disabled?: boolean;
};

export function CustomerUserSearchSelect({
  value,
  onChange,
  initialUser = null,
  error,
  disabled = false,
}: CustomerUserSearchSelectProps) {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<LinkableUser | null>(initialUser);
  const [results, setResults] = useState<LinkableUser[]>([]);
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
    if (initialUser?.id === value) {
      setSelected(initialUser);
      return;
    }
    void usersApi.getLinkable(value).then(setSelected).catch(() => setSelected(null));
  }, [value, initialUser, selected?.id]);

  useEffect(() => {
    if (!open) {
      return;
    }

    void (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const response = await usersApi.listLinkable({
          search: debouncedQuery.trim() || undefined,
          limit: 25,
        });
        setResults(response.items);
      } catch {
        setResults([]);
        setLoadError("Unable to search users.");
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

  const handleSelect = (user: LinkableUser) => {
    setSelected(user);
    setQuery("");
    setOpen(false);
    onChange(user.id, user);
  };

  const handleClear = () => {
    setSelected(null);
    setQuery("");
    onChange("", null);
  };

  const inputValue = open
    ? query
    : selected
      ? `${selected.display_name} · ${selected.email}`
      : "";

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          id="user_id"
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          autoComplete="off"
          disabled={disabled}
          placeholder={selected ? undefined : "Search by name, email, or user ID"}
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
              aria-label="Clear linked user"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="rounded p-1 text-text-muted hover:bg-surface-hover hover:text-text-primary"
            aria-label="Toggle user list"
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
            <li className="px-3 py-2 text-sm text-text-muted">No users found.</li>
          ) : (
            results.map((user) => (
              <li key={user.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={value === user.id}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm hover:bg-surface-hover",
                    value === user.id && "bg-surface-hover",
                  )}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSelect(user)}
                >
                  <span className="block font-medium text-text-primary">
                    {user.display_name}
                    <span className="font-normal text-text-muted"> · {user.email}</span>
                  </span>
                  <span className="mt-0.5 block font-mono text-xs text-text-muted">
                    {user.id}
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
