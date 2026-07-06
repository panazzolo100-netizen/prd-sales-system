export function FollowUpList() {
  const clientes = [
    "Fazenda Santa Luzia",
    "Mercado União",
    "Auto Elétrica Silva",
    "Agro MT",
    "Posto Brasil",
  ];

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="mb-6 text-xl font-semibold">
        Próximos Follow-ups
      </h2>

      <div className="space-y-3">
        {clientes.map((cliente) => (
          <div
            key={cliente}
            className="rounded-xl bg-zinc-800 p-4 hover:bg-zinc-700 transition"
          >
            {cliente}
          </div>
        ))}
      </div>
    </div>
  );
}