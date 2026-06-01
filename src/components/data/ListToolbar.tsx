import { Search } from "lucide-react";

import { cn } from "@/lib/utils";

export type SortOption = {
  value: string;
  label: string;
};

type ListToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  sortOptions: SortOption[];
  onSortByChange: (value: string) => void;
  onSortOrderChange: (value: "asc" | "desc") => void;
  actions?: React.ReactNode;
  className?: string;
};

const inputClassName = cn(
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm",
  "text-text-primary placeholder:text-text-muted",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info",
);

export function ListToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  sortBy,
  sortOrder,
  sortOptions,
  onSortByChange,
  onSortOrderChange,
  actions,
  className,
}: ListToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between",
        className,
      )}
    >
      <div className="relative max-w-md flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          className={cn(inputClassName, "pl-9")}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={sortBy}
          onChange={(event) => onSortByChange(event.target.value)}
          className={inputClassName}
          aria-label="Sort by"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              Sort: {option.label}
            </option>
          ))}
        </select>
        <select
          value={sortOrder}
          onChange={(event) =>
            onSortOrderChange(event.target.value as "asc" | "desc")
          }
          className={inputClassName}
          aria-label="Sort order"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
        {actions}
      </div>
    </div>
  );
}
