export function Topbar() {
  return (
    <header className="flex items-center justify-between mb-10">
      <div>
        <h2 className="text-4xl font-bold">Dashboard</h2>
        <p className="text-zinc-400 mt-2">
          Visão geral comercial da PRD Energia Solar
        </p>
      </div>

      <button className="bg-orange-500 hover:bg-orange-600 transition px-5 py-3 rounded-xl font-semibold">
        Novo Lead
      </button>
    </header>
  );
}