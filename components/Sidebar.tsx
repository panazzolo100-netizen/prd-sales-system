export function Sidebar() {
  const items = [
    "Painel",
    "Comercial",
    "Clientes",
    "Pipeline",
    "Agenda",
    "Propostas",
    "Engenharia",
    "Financeiro",
  ];

  return (
    <aside className="w-72 bg-zinc-900 border-r border-zinc-800 p-6 min-h-screen">
      <h1 className="text-3xl font-bold text-orange-500">PRD</h1>
      <p className="text-zinc-400 mb-10">Sistema de Vendas</p>

      <nav className="space-y-3">
        {items.map((item, index) => (
          <div
            key={item}
            className={`p-3 rounded-xl cursor-pointer ${
              index === 0 ? "bg-orange-500 font-semibold" : "hover:bg-zinc-800"
            }`}
          >
            {item}
          </div>
        ))}
      </nav>
    </aside>
  );
}