export function SalesChart() {
  const bars = [90, 140, 80, 190, 230, 290];

  return (
    <div className="col-span-2 h-[420px] rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="mb-6 text-xl font-semibold">Evolução das Vendas</h2>

      <div className="flex h-[300px] items-end gap-4">
        {bars.map((height, index) => (
          <div
            key={index}
            className="w-12 rounded-t-lg bg-orange-500"
            style={{ height: `${height}px` }}
          />
        ))}
      </div>
    </div>
  );
}