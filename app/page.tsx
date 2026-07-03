import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import { StatsCard } from "../components/StatsCard";

export default function Home() {
  return (
    <main className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />

      <section className="flex-1 p-10">
        <Topbar />

        <div className="grid grid-cols-4 gap-5">
          <StatsCard
            label="Leads"
            value="28"
            description="Novos contatos no mês"
          />

          <StatsCard
            label="Propostas"
            value="11"
            description="Em aberto no funil"
          />

          <StatsCard
            label="Vendas"
            value="R$ 320 mil"
            description="Fechadas no mês"
          />

          <StatsCard
            label="Follow-ups"
            value="17"
            description="Pendentes para hoje"
          />
        </div>

        <div className="mt-8 grid grid-cols-3 gap-6">
          <div className="col-span-2 h-[420px] rounded-2xl bg-zinc-900 p-6">
            <h2 className="mb-6 text-xl font-semibold">
              Evolução das Vendas
            </h2>

            <div className="flex h-[300px] items-end gap-4">
              <div className="h-24 w-12 rounded-t-lg bg-orange-500" />
              <div className="h-36 w-12 rounded-t-lg bg-orange-500" />
              <div className="h-20 w-12 rounded-t-lg bg-orange-500" />
              <div className="h-44 w-12 rounded-t-lg bg-orange-500" />
              <div className="h-56 w-12 rounded-t-lg bg-orange-500" />
              <div className="h-72 w-12 rounded-t-lg bg-orange-500" />
            </div>
          </div>

          <div className="rounded-2xl bg-zinc-900 p-6">
            <h2 className="mb-6 text-xl font-semibold">
              Próximos Follow-ups
            </h2>

            <div className="space-y-4">
              <div className="rounded-xl bg-zinc-800 p-4">
                Fazenda Santa Luzia
              </div>

              <div className="rounded-xl bg-zinc-800 p-4">
                Mercado União
              </div>

              <div className="rounded-xl bg-zinc-800 p-4">
                Auto Elétrica Silva
              </div>

              <div className="rounded-xl bg-zinc-800 p-4">
                Agro MT
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}