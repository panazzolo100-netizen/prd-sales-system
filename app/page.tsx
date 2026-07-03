import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white flex">
      <Sidebar />

      <section className="flex-1 p-10">
        <Topbar />

        <div className="grid grid-cols-4 gap-5">
          <div className="bg-zinc-900 rounded-2xl p-6">
            <p className="text-zinc-400">Leads</p>
            <h3 className="text-4xl mt-4 font-bold">28</h3>
          </div>

          <div className="bg-zinc-900 rounded-2xl p-6">
            <p className="text-zinc-400">Propostas</p>
            <h3 className="text-4xl mt-4 font-bold">11</h3>
          </div>

          <div className="bg-zinc-900 rounded-2xl p-6">
            <p className="text-zinc-400">Vendas</p>
            <h3 className="text-4xl mt-4 font-bold">R$ 320 mil</h3>
          </div>

          <div className="bg-zinc-900 rounded-2xl p-6">
            <p className="text-zinc-400">Follow-ups</p>
            <h3 className="text-4xl mt-4 font-bold">17</h3>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mt-8">
          <div className="col-span-2 bg-zinc-900 rounded-2xl p-6 h-[420px]">
            <h2 className="text-xl font-semibold mb-6">
              Evolução das Vendas
            </h2>

            <div className="flex items-end gap-4 h-[300px]">
              <div className="bg-orange-500 w-12 h-24 rounded-t-lg"></div>
              <div className="bg-orange-500 w-12 h-36 rounded-t-lg"></div>
              <div className="bg-orange-500 w-12 h-20 rounded-t-lg"></div>
              <div className="bg-orange-500 w-12 h-44 rounded-t-lg"></div>
              <div className="bg-orange-500 w-12 h-56 rounded-t-lg"></div>
              <div className="bg-orange-500 w-12 h-72 rounded-t-lg"></div>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-6">
              Próximos Follow-ups
            </h2>

            <div className="space-y-4">
              <div className="bg-zinc-800 rounded-xl p-4">
                Fazenda Santa Luzia
              </div>

              <div className="bg-zinc-800 rounded-xl p-4">
                Mercado União
              </div>

              <div className="bg-zinc-800 rounded-xl p-4">
                Auto Elétrica Silva
              </div>

              <div className="bg-zinc-800 rounded-xl p-4">
                Agro MT
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}