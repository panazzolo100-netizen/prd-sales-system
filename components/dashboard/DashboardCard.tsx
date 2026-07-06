type Props = {
  titulo: string;
  valor: string | number;
  cor?: string;
};

export function DashboardCard({
  titulo,
  valor,
  cor = "text-orange-500",
}: Props) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <p className="text-zinc-400">{titulo}</p>

      <h2 className={`mt-3 text-4xl font-bold ${cor}`}>
        {valor}
      </h2>
    </div>
  );
}