export function Topbar() {
  return (
    <header className="mb-8 flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900 px-8 py-5 shadow-xl">
      <div>
        <h1 className="text-2xl font-bold text-white">
          CRM Comercial
        </h1>

        <p className="text-sm text-zinc-400">
          PRD Soluções em Engenharia
        </p>
      </div>

      <div className="flex items-center gap-5">
        <input
          placeholder="Pesquisar..."
          className="w-80 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 outline-none focus:border-orange-500"
        />

        <button className="rounded-xl bg-orange-500 px-5 py-2 font-semibold transition hover:bg-orange-600">
          + Novo Lead
        </button>

        <img
          src="/icone-prd.png"
          alt="PRD"
          className="h-11 w-11 rounded-full border border-zinc-700 bg-zinc-800 p-1"
        />
      </div>
    </header>
  );
}