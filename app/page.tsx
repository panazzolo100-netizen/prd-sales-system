import { AppLayout } from "@/components/layout/AppLayout";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { getDashboardData } from "@/services/dashboard";

export default async function Dashboard() {
  const data = await getDashboardData();

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <p className="text-zinc-400">
          Resumo comercial da PRD Soluções em Engenharia.
        </p>
      </div>

      <div className="grid grid-cols-5 gap-5">
        <DashboardCard titulo="Leads" valor={data.totalLeads} />
        <DashboardCard titulo="Clientes" valor={data.totalClientes} cor="text-green-500" />
        <DashboardCard titulo="Propostas" valor={data.propostas} cor="text-blue-500" />
        <DashboardCard titulo="Ganhos" valor={data.ganhos} cor="text-emerald-500" />
        <DashboardCard titulo="Conversão" valor={`${data.conversao}%`} />
      </div>

      <div className="mt-8 grid grid-cols-2 gap-6">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-6 text-2xl font-bold">Funil Comercial</h2>

          <div className="space-y-4">
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span>Novo</span>
                <span>{data.totalLeads}</span>
              </div>
              <div className="h-4 rounded-full bg-zinc-800">
                <div className="h-4 w-full rounded-full bg-orange-500" />
              </div>
            </div>

            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span>Propostas</span>
                <span>{data.propostas}</span>
              </div>
              <div className="h-4 rounded-full bg-zinc-800">
                <div className="h-4 w-2/3 rounded-full bg-blue-500" />
              </div>
            </div>

            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span>Ganhos</span>
                <span>{data.ganhos}</span>
              </div>
              <div className="h-4 rounded-full bg-zinc-800">
                <div className="h-4 w-1/3 rounded-full bg-green-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-6 text-2xl font-bold">Resumo Executivo</h2>

          <div className="space-y-4 text-zinc-300">
            <p>
              Leads cadastrados: <strong>{data.totalLeads}</strong>
            </p>
            <p>
              Clientes ativos: <strong>{data.totalClientes}</strong>
            </p>
            <p>
              Negócios ganhos: <strong>{data.ganhos}</strong>
            </p>
            <p>
              Taxa de conversão:{" "}
              <strong className="text-orange-500">{data.conversao}%</strong>
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}