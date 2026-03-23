export function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string | number;
  helper: string;
}) {
  return (
    <div className="panel p-6">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-slate">{label}</p>
      <p className="mt-4 text-4xl font-bold text-brand-navy">{value}</p>
      <p className="mt-3 text-sm text-brand-slate">{helper}</p>
    </div>
  );
}

