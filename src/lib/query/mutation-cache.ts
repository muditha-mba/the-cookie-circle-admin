import type { QueryClient } from "@tanstack/react-query";

type CacheSyncOptions = {
  /** Additional query prefixes to mark stale (e.g. dropdown lists). */
  alsoInvalidate?: readonly (readonly unknown[])[];
};

/** After create/update: store fresh detail data and refresh list queries. */
export function cacheEntitySave<T>(
  queryClient: QueryClient,
  detailKey: readonly unknown[],
  listKey: readonly unknown[],
  entity: T,
  options?: CacheSyncOptions,
): void {
  queryClient.setQueryData(detailKey, entity);
  void queryClient.invalidateQueries({ queryKey: listKey });
  for (const key of options?.alsoInvalidate ?? []) {
    void queryClient.invalidateQueries({ queryKey: key });
  }
}

/** After delete: drop detail cache and refresh list queries. */
export function cacheEntityRemove(
  queryClient: QueryClient,
  detailKey: readonly unknown[],
  listKey: readonly unknown[],
  options?: CacheSyncOptions,
): void {
  queryClient.removeQueries({ queryKey: detailKey });
  void queryClient.invalidateQueries({ queryKey: listKey });
  for (const key of options?.alsoInvalidate ?? []) {
    void queryClient.invalidateQueries({ queryKey: key });
  }
}
