type DetailFieldProps = {
  label: string;
  value: React.ReactNode;
};

export function DetailField({ label, value }: DetailFieldProps) {
  return (
    <div className="space-y-1">
      <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">
        {label}
      </dt>
      <dd className="text-sm text-text-primary">{value}</dd>
    </div>
  );
}
