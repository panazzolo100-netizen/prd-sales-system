import { AppLayout } from "@/components/layout/AppLayout";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { PipelineOverview } from "@/components/dashboard/PipelineOverview";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { Card } from "@/components/ui/Card";
import { getDashboardData } from "@/services/dashboard";

function moeda(valor: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(valor);
}

export default async function Dashboard() {
  const data = await getDashboardData();

  return (
    <AppLayout>
      <div className="mb-10">
        <h1 className="text-5xl font-black">
          Dashboard
        </h1>

        <p className="mt-2 text-zinc-400">
          Visão geral da operação da PRD Engenharia.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          titulo="Leads"
          valor={data.totalLeads}
        />

        <DashboardCard
          titulo="Clientes"
          valor={data.totalClientes}
          cor="text-green-500"
        />

        <DashboardCard
          titulo="Projetos"
          valor={data.projetos}
          cor="text-cyan-500"
        />

        <DashboardCard
          titulo="OS Abertas"
          valor={data.ordensServico}
          cor="text-orange-500"
        />

        <DashboardCard
          titulo="OS Concluídas"
          valor={data.ordensConcluidas}
          cor="text-emerald-500"
        />

        <DashboardCard
          titulo="OS Atrasadas"
          valor={data.ordensAtrasadas}
          cor="text-red-500"
        />

        <DashboardCard
          titulo="Documentos"
          valor={data.documentos}
          cor="text-cyan-500"
        />

        <DashboardCard
          titulo="Conversão"
          valor={`${data.conversao}%`}
          cor="text-emerald-500"
        />
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-sm text-zinc-500">
            Total vendido
          </p>

          <h2 className="mt-2 text-3xl font-bold text-green-500">
            {moeda(data.totalVendido)}
          </h2>
        </Card>

        <Card>
          <p className="text-sm text-zinc-500">
            Recebido
          </p>

          <h2 className="mt-2 text-3xl font-bold text-blue-500">
            {moeda(data.totalRecebido)}
          </h2>

          <p className="mt-2 text-sm text-zinc-500">
            {data.percentualRecebido}% do total
          </p>
        </Card>

        <Card>
          <p className="text-sm text-zinc-500">
            Pendente
          </p>

          <h2 className="mt-2 text-3xl font-bold text-orange-500">
            {moeda(data.totalPendente)}
          </h2>
        </Card>

        <Card>
          <p className="text-sm text-zinc-500">
            Margem estimada
          </p>

          <h2 className="mt-2 text-3xl font-bold text-emerald-500">
            {data.margem}%
          </h2>

          <p className="mt-2 text-sm text-zinc-500">
            Custos: {moeda(data.totalCustos)}
          </p>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <PipelineOverview
            pipeline={data.pipeline}
          />
        </div>

        <ActivityFeed />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-3">
        <Card>
          <h2 className="mb-5 text-2xl font-bold">
            Operação
          </h2>

          <div className="space-y-4 text-zinc-300">
            <Linha
              label="Projetos em andamento"
              value={data.projetosAndamento}
            />

            <Linha
              label="Projetos concluídos"
              value={data.projetosConcluidos}
            />

            <Linha
              label="OS em andamento"
              value={data.ordensAndamento}
            />

            <Linha
              label="OS concluídas"
              value={data.ordensConcluidas}
            />

            <Linha
              label="Documentos"
              value={data.documentos}
            />
          </div>
        </Card>

        <Card>
          <h2 className="mb-5 text-2xl font-bold">
            Comercial
          </h2>

          <div className="space-y-4 text-zinc-300">
            <Linha
              label="Leads"
              value={data.totalLeads}
            />

            <Linha
              label="Propostas"
              value={data.propostas}
            />

            <Linha
              label="Ganhos"
              value={data.ganhos}
            />

            <Linha
              label="Conversão"
              value={`${data.conversao}%`}
            />

            <Linha
              label="Clientes"
              value={data.totalClientes}
            />
          </div>
        </Card>

        <Card>
          <h2 className="mb-5 text-2xl font-bold">
            Alertas
          </h2>

          <div className="space-y-4">
            {data.ordensAtrasadas > 0 ? (
              <Alerta
                title={`${data.ordensAtrasadas} OS atrasada(s)`}
                description="Existem ordens com data vencida e execução pendente."
                type="danger"
              />
            ) : (
              <Alerta
                title="Nenhuma OS atrasada"
                description="As ordens de serviço estão dentro do prazo."
                type="success"
              />
            )}

            {data.totalPendente > 0 ? (
              <Alerta
                title="Recebimentos pendentes"
                description={`${moeda(
                  data.totalPendente
                )} ainda não recebidos.`}
                type="warning"
              />
            ) : (
              <Alerta
                title="Financeiro em dia"
                description="Não existem valores pendentes."
                type="success"
              />
            )}

            {data.projetosAndamento > 0 && (
              <Alerta
                title={`${data.projetosAndamento} projeto(s) em andamento`}
                description="Acompanhe engenharia, documentos e execução."
                type="info"
              />
            )}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}

function Linha({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-800 pb-3 last:border-none last:pb-0">
      <span>{label}</span>

      <strong className="text-white">
        {value}
      </strong>
    </div>
  );
}

function Alerta({
  title,
  description,
  type,
}: {
  title: string;
  description: string;
  type:
    | "danger"
    | "warning"
    | "success"
    | "info";
}) {
  const className = {
    danger:
      "border-red-500/30 bg-red-500/10 text-red-300",
    warning:
      "border-orange-500/30 bg-orange-500/10 text-orange-300",
    success:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    info:
      "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  }[type];

  return (
    <div
      className={`rounded-xl border p-4 ${className}`}
    >
      <h3 className="font-bold">
        {title}
      </h3>

      <p className="mt-1 text-sm opacity-80">
        {description}
      </p>
    </div>
  );
}