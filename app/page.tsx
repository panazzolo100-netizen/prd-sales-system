import {
  AlertTriangle,
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  FileText,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { PipelineOverview } from "@/components/dashboard/PipelineOverview";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/Card";
import { getCurrentAppUser } from "@/lib/auth/current-user";
import { getDashboardData } from "@/services/dashboard";

function moeda(valor: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(valor);
}

function formatarData() {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

function obterSaudacao() {
  const hora = new Date().getHours();

  if (hora < 12) {
    return "Bom dia";
  }

  if (hora < 18) {
    return "Boa tarde";
  }

  return "Boa noite";
}

export default async function Dashboard() {
  const [data, usuario] = await Promise.all([
    getDashboardData(),
    getCurrentAppUser(),
  ]);

  const primeiroNome =
    usuario.name.split(" ")[0] || "Usuário";

  return (
    <AppLayout>
      <main className="space-y-8">
        <section className="relative overflow-hidden rounded-[28px] border border-white/[0.07] bg-gradient-to-br from-zinc-900 via-zinc-900 to-orange-950/30 p-7 shadow-2xl shadow-black/20 lg:p-9">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-orange-500/10 blur-[100px]" />

          <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-sm font-semibold capitalize text-zinc-500">
                {formatarData()}
              </p>

              <h1 className="mt-3 text-4xl font-black tracking-tight text-white lg:text-5xl">
                {obterSaudacao()}, {primeiroNome}
                <span className="ml-2">👋</span>
              </h1>

              <p className="mt-3 max-w-2xl text-zinc-400">
                Veja os principais números, pendências e atividades da PRD
                Engenharia.
              </p>
            </div>

            <a
              href="/agenda"
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold text-white transition hover:border-orange-500/50 hover:bg-orange-500/10"
            >
              <CalendarDays size={18} />

              Ver agenda

              <ArrowRight size={16} />
            </a>
          </div>

          <div className="relative mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <HeroIndicator
              icon={Target}
              label="Oportunidades"
              value={String(data.totalLeads)}
              description={`${data.propostas} em proposta`}
              iconClass="bg-orange-500/15 text-orange-400"
            />

            <HeroIndicator
              icon={BriefcaseBusiness}
              label="Projetos ativos"
              value={String(data.projetosAndamento)}
              description={`${data.projetosConcluidos} concluído(s)`}
              iconClass="bg-cyan-500/15 text-cyan-400"
            />

            <HeroIndicator
              icon={ClipboardList}
              label="OS em aberto"
              value={String(data.ordensServico)}
              description={`${data.ordensAtrasadas} atrasada(s)`}
              iconClass={
                data.ordensAtrasadas > 0
                  ? "bg-red-500/15 text-red-400"
                  : "bg-emerald-500/15 text-emerald-400"
              }
            />

            <HeroIndicator
              icon={CircleDollarSign}
              label="Valor pendente"
              value={moeda(data.totalPendente)}
              description={`${data.percentualRecebido}% recebido`}
              iconClass="bg-emerald-500/15 text-emerald-400"
            />
          </div>
        </section>

        <section>
          <SectionHeader
            title="Visão geral"
            description="Indicadores principais da operação."
          />

          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              icon={Target}
              label="Leads"
              value={String(data.totalLeads)}
              detail={`${data.ganhos} convertido(s)`}
              iconClass="bg-orange-500/15 text-orange-400"
            />

            <MetricCard
              icon={Users}
              label="Clientes"
              value={String(data.totalClientes)}
              detail="Clientes ativos"
              iconClass="bg-emerald-500/15 text-emerald-400"
            />

            <MetricCard
              icon={BriefcaseBusiness}
              label="Projetos"
              value={String(data.projetos)}
              detail={`${data.projetosAndamento} em andamento`}
              iconClass="bg-cyan-500/15 text-cyan-400"
            />

            <MetricCard
              icon={TrendingUp}
              label="Conversão"
              value={`${data.conversao}%`}
              detail="Leads convertidos"
              iconClass="bg-violet-500/15 text-violet-400"
            />

            <MetricCard
              icon={ClipboardList}
              label="OS abertas"
              value={String(data.ordensServico)}
              detail={`${data.ordensAndamento} em execução`}
              iconClass="bg-orange-500/15 text-orange-400"
            />

            <MetricCard
              icon={CheckCircle2}
              label="OS concluídas"
              value={String(data.ordensConcluidas)}
              detail="Execuções finalizadas"
              iconClass="bg-emerald-500/15 text-emerald-400"
            />

            <MetricCard
              icon={AlertTriangle}
              label="OS atrasadas"
              value={String(data.ordensAtrasadas)}
              detail={
                data.ordensAtrasadas > 0
                  ? "Precisam de atenção"
                  : "Operação dentro do prazo"
              }
              iconClass={
                data.ordensAtrasadas > 0
                  ? "bg-red-500/15 text-red-400"
                  : "bg-zinc-500/15 text-zinc-400"
              }
            />

            <MetricCard
              icon={FileText}
              label="Documentos"
              value={String(data.documentos)}
              detail="Arquivos cadastrados"
              iconClass="bg-blue-500/15 text-blue-400"
            />
          </div>
        </section>

        <section>
          <SectionHeader
            title="Financeiro"
            description="Resumo dos valores vendidos, recebidos e pendentes."
          />

          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <FinancialCard
              label="Total vendido"
              value={moeda(data.totalVendido)}
              description="Valor total dos projetos"
              valueClass="text-white"
            />

            <FinancialCard
              label="Total recebido"
              value={moeda(data.totalRecebido)}
              description={`${data.percentualRecebido}% do total vendido`}
              valueClass="text-emerald-400"
            />

            <FinancialCard
              label="Total pendente"
              value={moeda(data.totalPendente)}
              description="Valores ainda não recebidos"
              valueClass="text-orange-400"
            />

            <FinancialCard
              label="Margem estimada"
              value={`${data.margem}%`}
              description={`Custos: ${moeda(data.totalCustos)}`}
              valueClass="text-cyan-400"
            />
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <PipelineOverview pipeline={data.pipeline} />
          </div>

          <ActivityFeed />
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <Card>
            <SectionHeader
              title="Operação"
              description="Andamento dos projetos e serviços."
              compact
            />

            <div className="mt-6 space-y-4">
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
            <SectionHeader
              title="Comercial"
              description="Desempenho das oportunidades."
              compact
            />

            <div className="mt-6 space-y-4">
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
            <SectionHeader
              title="Atenção necessária"
              description="Pendências que precisam ser acompanhadas."
              compact
            />

            <div className="mt-6 space-y-4">
              {data.ordensAtrasadas > 0 ? (
                <Alerta
                  title={`${data.ordensAtrasadas} OS atrasada(s)`}
                  description="Existem ordens de serviço com prazo vencido."
                  type="danger"
                />
              ) : (
                <Alerta
                  title="Operação dentro do prazo"
                  description="Nenhuma ordem de serviço está atrasada."
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
        </section>
      </main>
    </AppLayout>
  );
}

function HeroIndicator({
  icon: Icon,
  label,
  value,
  description,
  iconClass,
}: {
  icon: typeof Target;
  label: string;
  value: string;
  description: string;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-black/20 p-5 backdrop-blur-sm">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
      >
        <Icon size={20} />
      </div>

      <p className="mt-5 text-sm font-medium text-zinc-500">
        {label}
      </p>

      <p className="mt-1 break-words text-2xl font-black text-white">
        {value}
      </p>

      <p className="mt-2 text-xs text-zinc-600">
        {description}
      </p>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  iconClass,
}: {
  icon: typeof Target;
  label: string;
  value: string;
  detail: string;
  iconClass: string;
}) {
  return (
    <div className="group rounded-2xl border border-white/[0.07] bg-zinc-900 p-5 transition duration-200 hover:-translate-y-0.5 hover:border-white/[0.12] hover:bg-zinc-900/80">
      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={21} />
        </div>

        <ArrowRight
          size={17}
          className="text-zinc-700 transition group-hover:translate-x-1 group-hover:text-zinc-400"
        />
      </div>

      <p className="mt-6 text-3xl font-black text-white">
        {value}
      </p>

      <p className="mt-2 text-sm font-semibold text-zinc-300">
        {label}
      </p>

      <p className="mt-1 text-xs text-zinc-600">
        {detail}
      </p>
    </div>
  );
}

function FinancialCard({
  label,
  value,
  description,
  valueClass,
}: {
  label: string;
  value: string;
  description: string;
  valueClass: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-zinc-900 p-6">
      <p className="text-sm font-medium text-zinc-500">
        {label}
      </p>

      <h2
        className={`mt-3 break-words text-2xl font-black ${valueClass}`}
      >
        {value}
      </h2>

      <p className="mt-3 text-xs text-zinc-600">
        {description}
      </p>
    </div>
  );
}

function SectionHeader({
  title,
  description,
  compact = false,
}: {
  title: string;
  description: string;
  compact?: boolean;
}) {
  return (
    <div>
      <h2
        className={
          compact
            ? "text-xl font-bold text-white"
            : "text-2xl font-black text-white"
        }
      >
        {title}
      </h2>

      <p className="mt-1 text-sm text-zinc-500">
        {description}
      </p>
    </div>
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
      <span className="text-sm text-zinc-400">
        {label}
      </span>

      <strong className="text-sm text-white">
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
  type: "danger" | "warning" | "success" | "info";
}) {
  const className = {
    danger:
      "border-red-500/20 bg-red-500/10 text-red-300",
    warning:
      "border-orange-500/20 bg-orange-500/10 text-orange-300",
    success:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
    info:
      "border-cyan-500/20 bg-cyan-500/10 text-cyan-300",
  }[type];

  return (
    <div className={`rounded-xl border p-4 ${className}`}>
      <h3 className="text-sm font-bold">
        {title}
      </h3>

      <p className="mt-1 text-xs leading-5 opacity-75">
        {description}
      </p>
    </div>
  );
}