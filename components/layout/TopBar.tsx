export function Topbar() {
  return (
    <header className="mb-8 flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold">CRM PRD Engenharia</h2>
        <p className="text-zinc-400">Sistema Comercial e Engenharia</p>
      </div>

      <div className="flex items-center gap-4">
        <input
          placeholder="Pesquisar..."
          className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-orange-500"
        />

        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-500 font-bold">
          PR
        </div>
      </div>
    </header>
  );
}