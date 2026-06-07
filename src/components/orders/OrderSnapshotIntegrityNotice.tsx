export function OrderSnapshotIntegrityNotice() {
  return (
    <section className="rounded-lg border border-border/80 bg-surface-hover/40 p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
        Snapshot integrity
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-text-muted">
        All financial values shown on this page are historical snapshots captured when the order
        was placed and do not change when catalog prices or costs are updated later.
      </p>
    </section>
  );
}
