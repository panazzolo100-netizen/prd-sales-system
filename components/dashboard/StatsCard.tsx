type Props = {
  title: string;
  value: string;
  color?: string;
};

export function StatsCard({
  title,
  value,
  color = "text-orange-500",
}: Props) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <p className="text-zinc-400">{title}</p>

      <h2 className={`mt-3 text-4xl font-bold ${color}`}>
        {value}
      </h2>
    </div>
  );
}