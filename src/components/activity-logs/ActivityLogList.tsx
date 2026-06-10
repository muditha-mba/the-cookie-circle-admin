"use client";

import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";

import { DataTable } from "@/components/data/DataTable";
import { ListToolbar, type SortOption } from "@/components/data/ListToolbar";
import { Pagination } from "@/components/data/Pagination";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type {
  ActivityAction,
  ActivityLogDetail,
  ActivityLogSummary,
  ActivityResourceType,
} from "@/lib/api/activity-logs";
import { activityLogsApi } from "@/lib/api/activity-logs";
import {
  formatActivityAction,
  formatActivityResourceType,
  formatAdminRoleLabel,
  formatClientSummary,
} from "@/lib/activity-log-display";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const SORT_OPTIONS: SortOption[] = [
  { value: "created_at", label: "Time" },
  { value: "action", label: "Action" },
  { value: "resource_type", label: "Resource" },
  { value: "actor_email", label: "Actor" },
  { value: "status_code", label: "Status code" },
];

const ACTION_OPTIONS: { value: ActivityAction | ""; label: string }[] = [
  { value: "", label: "All actions" },
  { value: "created", label: "Created" },
  { value: "updated", label: "Updated" },
  { value: "deleted", label: "Deleted" },
  { value: "exported", label: "Exported" },
  { value: "login", label: "Login" },
  { value: "login_failed", label: "Login failed" },
  { value: "logout", label: "Logout" },
  { value: "logout_all", label: "Logout all" },
];

const RESOURCE_OPTIONS: { value: ActivityResourceType | ""; label: string }[] = [
  { value: "", label: "All resources" },
  { value: "order", label: "Order" },
  { value: "product", label: "Product" },
  { value: "customer", label: "Customer" },
  { value: "collection", label: "Collection" },
  { value: "production", label: "Production" },
  { value: "analytics", label: "Analytics" },
  { value: "business_settings", label: "Business settings" },
  { value: "auth", label: "Authentication" },
  { value: "system", label: "System" },
];

function ActivityLogDetailPanel({ detail }: { detail: ActivityLogDetail }) {
  return (
    <div className="rounded-lg border border-border bg-surface-elevated p-5 text-sm">
      <h3 className="text-sm font-semibold text-text-primary">Entry details</h3>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-text-secondary">Resource</dt>
          <dd className="text-text-primary">
            {detail.resource_label ?? formatActivityResourceType(detail.resource_type)}
          </dd>
        </div>
        <div>
          <dt className="text-text-secondary">HTTP</dt>
          <dd className="font-mono text-xs text-text-primary">
            {detail.http_method ?? "—"} {detail.path ?? ""}
          </dd>
        </div>
        <div>
          <dt className="text-text-secondary">IP address</dt>
          <dd className="text-text-primary">{detail.ip_address ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-text-secondary">Client</dt>
          <dd className="text-text-primary">{formatClientSummary(detail)}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-text-secondary">User-Agent</dt>
          <dd className="break-all font-mono text-xs text-text-primary">
            {detail.user_agent ?? "—"}
          </dd>
        </div>
        {detail.metadata && Object.keys(detail.metadata).length > 0 ? (
          <div className="sm:col-span-2">
            <dt className="mb-2 text-text-secondary">Metadata</dt>
            <dd>
              <pre className="overflow-x-auto rounded-md border border-border bg-background p-3 font-mono text-xs text-text-primary">
                {JSON.stringify(detail.metadata, null, 2)}
              </pre>
            </dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}

export function ActivityLogList() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [action, setAction] = useState<ActivityAction | "">("");
  const [resourceType, setResourceType] = useState<ActivityResourceType | "">("");
  const [successFilter, setSuccessFilter] = useState<"" | "true" | "false">("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search);

  const { data, isLoading, isError } = useQuery({
    queryKey: [
      "activity-logs",
      page,
      debouncedSearch,
      sortBy,
      sortOrder,
      action,
      resourceType,
      successFilter,
    ],
    queryFn: () =>
      activityLogsApi.list({
        page,
        page_size: 20,
        search: debouncedSearch || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        action: action || undefined,
        resource_type: resourceType || undefined,
        success: successFilter === "" ? undefined : successFilter === "true",
      }),
  });

  const detailQuery = useQuery({
    queryKey: ["activity-logs", selectedId],
    queryFn: () => activityLogsApi.get(selectedId!),
    enabled: Boolean(selectedId),
  });

  const columns = useMemo<ColumnDef<ActivityLogSummary>[]>(
    () => [
      {
        header: "Time",
        accessorKey: "created_at",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-text-secondary">
            {formatDateTime(row.original.created_at)}
          </span>
        ),
      },
      {
        header: "Actor",
        accessorKey: "actor_email",
        cell: ({ row }) => (
          <div className="min-w-[160px]">
            <p className="font-medium text-text-primary">
              {row.original.actor_email ?? "System"}
            </p>
            {row.original.actor_admin_role ? (
              <p className="text-xs text-text-muted">
                {formatAdminRoleLabel(row.original.actor_admin_role)}
              </p>
            ) : null}
          </div>
        ),
      },
      {
        header: "Action",
        accessorKey: "action",
        cell: ({ row }) => formatActivityAction(row.original.action),
      },
      {
        header: "Resource",
        accessorKey: "resource_label",
        cell: ({ row }) => (
          <div>
            <p className="text-text-primary">
              {row.original.resource_label ?? formatActivityResourceType(row.original.resource_type)}
            </p>
            <p className="text-xs text-text-muted">
              {formatActivityResourceType(row.original.resource_type)}
            </p>
          </div>
        ),
      },
      {
        header: "Client",
        accessorKey: "browser_name",
        cell: ({ row }) => (
          <span className="text-text-secondary">{formatClientSummary(row.original)}</span>
        ),
      },
      {
        header: "IP",
        accessorKey: "ip_address",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-text-secondary">
            {row.original.ip_address ?? "—"}
          </span>
        ),
      },
      {
        header: "Result",
        accessorKey: "success",
        cell: ({ row }) => (
          <span
            className={cn(
              "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
              row.original.success
                ? "bg-success/10 text-success"
                : "bg-danger/10 text-danger",
            )}
          >
            {row.original.success ? "Success" : "Failed"}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-lg border border-border bg-surface p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="block text-xs font-medium text-text-secondary">Action</label>
          <select
            value={action}
            onChange={(event) => {
              setAction(event.target.value as ActivityAction | "");
              setPage(1);
            }}
            className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
          >
            {ACTION_OPTIONS.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary">Resource</label>
          <select
            value={resourceType}
            onChange={(event) => {
              setResourceType(event.target.value as ActivityResourceType | "");
              setPage(1);
            }}
            className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
          >
            {RESOURCE_OPTIONS.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary">Result</label>
          <select
            value={successFilter}
            onChange={(event) => {
              setSuccessFilter(event.target.value as "" | "true" | "false");
              setPage(1);
            }}
            className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
          >
            <option value="">All results</option>
            <option value="true">Success only</option>
            <option value="false">Failed only</option>
          </select>
        </div>
      </div>

      <ListToolbar
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        searchPlaceholder="Search actor, resource, IP, browser, path..."
        sortBy={sortBy}
        sortOptions={SORT_OPTIONS}
        sortOrder={sortOrder}
        onSortByChange={setSortBy}
        onSortOrderChange={setSortOrder}
      />

      {isError ? (
        <p className="text-sm text-danger">Unable to load activity logs.</p>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={data?.items ?? []}
            isLoading={isLoading}
            onRowClick={(row) =>
              setSelectedId((current) => (current === row.id ? null : row.id))
            }
            emptyMessage="No activity recorded yet."
          />
          {data ? (
            <Pagination
              page={data.page}
              totalPages={data.total_pages}
              total={data.total}
              pageSize={data.page_size}
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}

      {selectedId ? (
        detailQuery.isLoading ? (
          <div className="h-32 animate-pulse rounded-lg bg-surface-hover" />
        ) : detailQuery.data ? (
          <ActivityLogDetailPanel detail={detailQuery.data} />
        ) : (
          <p className="text-sm text-danger">Unable to load entry details.</p>
        )
      ) : null}
    </div>
  );
}
