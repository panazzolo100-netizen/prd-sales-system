import Link from "next/link";
import { BarChart3, BriefcaseBusiness, CircleDollarSign, ClipboardList, FileText, Users } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { getDashboardData } from "@/services/dashboard";

const money = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export default async function ReportsPage() {
  const data = await getDashboardData();
  const reports = [
    { title: "Comercial", description: "Leads, propostas e conversão", value: `${data.conversao}%`, detail: `${data.totalLeads} oportunidades • ${data.ganhos} ganhos`, icon: Users, href: "/pipeline", color: "text-violet-400 bg-violet-500/15" },
    { title: "Projetos", description: "Carteira operacional", value: String(data.projetos), detail: `${data.projetosAndamento} em andamento • ${data.projetosConcluidos} concluídos`, icon: BriefcaseBusiness, href: "/projetos", color: "text-cyan-400 bg-cyan-500/15" },
    { title: "Ordens de Serviço", description: "Execuções e prazos", value: String(data.ordensServico), detail: `${data.ordensAndamento} em execução • ${data.ordensAtrasadas} atrasadas`, icon: ClipboardList, href: "/os", color: "text-orange-400 bg-orange-500/15" },
    { title: "Financeiro", description: "Vendas e recebimentos", value: money(data.totalRecebido), detail: `${money(data.totalPendente)} pendentes`, icon: CircleDollarSign, href: "/financeiro", color: "text-emerald-400 bg-emerald-500/15" },
    { title: "Fluxo de Caixa", description: "Entradas, saídas e vencimentos", value: "Movimentações", detail: "Acompanhar caixa realizado e previsto", icon: BarChart3, href: "/financeiro/fluxo-caixa", color: "text-blue-400 bg-blue-500/15" },
    { title: "Documentos", description: "Arquivos dos projetos", value: String(data.documentos), detail: "Documentos cadastrados", icon: FileText, href: "/projetos", color: "text-zinc-300 bg-zinc-500/15" },
  ];

  return <AppLayout><main className="space-y-8">
    <section className="rounded-[28px] border border-white/[0.07] bg-gradient-to-br from-zinc-900 to-orange-950/20 p-7 lg:p-9"><p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-400">Central de indicadores</p><h1 className="mt-3 text-4xl font-black text-white">Relatórios gerenciais</h1><p className="mt-3 max-w-2xl text-zinc-400">Uma visão consolidada da operação com acesso direto aos dados detalhados de cada área.</p></section>
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{reports.map(({ icon: Icon, ...report }) => <Link key={report.title} href={report.href} className="group rounded-2xl border border-white/[0.07] bg-zinc-900 p-6 transition hover:-translate-y-0.5 hover:border-orange-500/40"><div className={`flex h-12 w-12 items-center justify-center rounded-xl ${report.color}`}><Icon size={23} /></div><p className="mt-6 text-sm font-medium text-zinc-500">{report.description}</p><h2 className="mt-1 text-xl font-bold text-white">{report.title}</h2><p className="mt-5 text-2xl font-black text-white">{report.value}</p><p className="mt-2 text-sm text-zinc-500">{report.detail}</p><span className="mt-6 inline-flex text-sm font-bold text-orange-400 group-hover:text-orange-300">Abrir relatório →</span></Link>)}</div>
  </main></AppLayout>;
}
