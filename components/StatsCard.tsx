type StatsCardProps = {
  label: string;
  value: string;
  description?: string;
};

export function StatsCard({
  label,
  value,
  description,
}: StatsCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <p className="text-sm text-zinc-400">{label}</p>

      <h3 className="mt-4 text-4xl font-bold">{value}</h3>

      {description ? (
        <p className="mt-3 text-sm text-zinc-500">
          {description}
        </p>
      ) : null}
    </div>
  );
}