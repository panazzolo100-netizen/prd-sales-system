import { revalidatePath } from "next/cache";
import Link from "next/link";
import {
  CalendarDays,
  CircleCheckBig,
  CirclePlay,
  ClipboardList,
  FileSignature,
  Search,
} from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { EntityDeleteButton } from "@/components/ui/EntityDeleteButton";
import {
  CompactMetricCard,
  OperationCardGrid,
  OperationEmptyState,
  OperationPageHeader,
} from "@/components/operations/OperationListing";
import { getCurrentCompanyId } from "@/lib/auth/current-user";
import {
  createServiceOrderData,
  listAvailableProjectsForServiceOrder,
  listServiceOrders,
} from "@/services/service-orders.service";

function formatDate(date: Date | null) {
  return date ? new Intl.DateTimeFormat("pt-BR").format(date) : "-";
}

function statusLabel(status: string) {
  return {
    ABERTA: "Aberta",
    AGENDADA: "Agendada",
    EM_ANDAMENTO: "Em andamento",
    CONCLUIDA: "Concluída",
    CANCELADA: "Cancelada",
  }[status] ?? status;
}

function statusClass(status: string) {
  return {
    CONCLUIDA: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    EM_ANDAMENTO: "border-sky-500/20 bg-sky-500/10 text-sky-400",
    CANCELADA: "border-red-500/20 bg-red-500/10 text-red-400",
    AGENDADA: "border-violet-500/20 bg-violet-500/10 text-violet-400",
  }[status] ?? "border-orange-500/20 bg-orange-500/10 text-orange-400";
}

function statusAccent(status: string) {
  return {
    CONCLUIDA: "before:bg-emerald-500",
    EM_ANDAMENTO: "before:bg-sky-500",
    CANCELADA: "before:bg-red-500",
    AGENDADA: "before:bg-violet-500",
  }[status] ?? "before:bg-orange-500";
}

async function createServiceOrder(formData: FormData) {
  "use server";

  const companyId = await getCurrentCompanyId();
  const projectId = String(formData.get("projectId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const responsible = String(formData.get("responsible") ?? "").trim();
  const scheduledDateValue = String(formData.get("scheduledDate") ?? "").trim();
  const services = String(formData.get("services") ?? "").trim();

  if (!projectId) throw new Error("Selecione um projeto.");
  if (!title) throw new Error("Informe o título da OS.");

  await createServiceOrderData({
    projectId,
    companyId,
    title,
    responsible,
    scheduledDate: scheduledDateValue
      ? new Date(`${scheduledDateValue}T12:00:00`)
      : null,
    services,
  });

  revalidatePath("/os");
  revalidatePath("/engenharia");
}

export default async function OrdensServicoPage({
  searchParams,
}: {
  searchParams: Promise<{ busca?: string; status?: string; ordem?: string }>;
}) {
  const companyId = await getCurrentCompanyId();
  const [ordens, projetos] = await Promise.all([
    listServiceOrders(companyId),
    listAvailableProjectsForServiceOrder(companyId),
  ]);
  const abertas = ordens.filter((ordem) =>
    ["ABERTA", "AGENDADA"].includes(ordem.status)
  ).length;
  const emAndamento = ordens.filter(
    (ordem) => ordem.status === "EM_ANDAMENTO"
  ).length;
  const concluidas = ordens.filter(
    (ordem) => ordem.status === "CONCLUIDA"
  ).length;
  const params = await searchParams;
  const busca = params.busca?.trim().toLocaleLowerCase("pt-BR") ?? "";
  const status = params.status ?? "TODOS";
  const ordem = params.ordem ?? "recentes";
  const filtradas = ordens
    .filter((item) =>
      (!busca ||
        item.number.toLocaleLowerCase("pt-BR").includes(busca) ||
        item.project.client.name.toLocaleLowerCase("pt-BR").includes(busca)) &&
      (status === "TODOS" || item.status === status)
    )
    .sort((a, b) =>
      ordem === "cliente"
        ? a.project.client.name.localeCompare(b.project.client.name, "pt-BR")
        : 0
    );

  return (
    <AppLayout>
      <main className="space-y-5">
        <OperationPageHeader
          breadcrumb="Operação / Ordens de Serviço"
          title="Ordens de Serviço"
          description="Acompanhe instalações, agendas e assinaturas."
          action={
          <details className="group relative">
            <summary className="cursor-pointer list-none rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600">
              Nova OS
            </summary>
            <div className="fixed inset-x-4 top-24 z-30 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-2xl sm:absolute sm:inset-auto sm:right-0 sm:top-auto sm:mt-3 sm:w-[460px]">
              <h2 className="text-xl font-bold text-white">Criar Ordem de Serviço</h2>
              <form action={createServiceOrder} className="mt-5 space-y-4">
                <Field label="Projeto">
                  <select name="projectId" required defaultValue="" className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-orange-500">
                    <option value="" disabled>Selecione um projeto</option>
                    {projetos.map((projeto) => (
                      <option key={projeto.id} value={projeto.id}>
                        {projeto.title} — {projeto.client.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Título da OS">
                  <input name="title" required placeholder="Ex.: Instalação do sistema solar" className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-orange-500" />
                </Field>
                <Field label="Responsável">
                  <input name="responsible" placeholder="Nome do responsável" className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-orange-500" />
                </Field>
                <Field label="Data agendada">
                  <input name="scheduledDate" type="date" className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-orange-500" />
                </Field>
                <Field label="Serviços">
                  <textarea name="services" rows={4} placeholder="Descreva os serviços que serão executados." className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-orange-500" />
                </Field>
                <button type="submit" disabled={projetos.length === 0} className="w-full rounded-xl bg-orange-500 px-5 py-3 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50">
                  Criar OS
                </button>
                {projetos.length === 0 && (
                  <p className="text-sm text-red-400">Todos os projetos já possuem uma Ordem de Serviço.</p>
                )}
              </form>
            </div>
          </details>
          }
        />

        <section className="grid gap-3 sm:grid-cols-3">
          <CompactMetricCard label="Abertas e agendadas" value={abertas} icon={ClipboardList} />
          <CompactMetricCard label="Em andamento" value={emAndamento} icon={CirclePlay} tone="orange" />
          <CompactMetricCard label="Concluídas" value={concluidas} icon={CircleCheckBig} tone="green" />
        </section>

        <form className="grid gap-2 rounded-2xl border border-white/[0.07] bg-zinc-900/60 p-2.5 md:grid-cols-[minmax(260px,1fr)_190px_170px_auto]">
          <label className="relative">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
            <input name="busca" defaultValue={params.busca} placeholder="Buscar número ou cliente..." className="h-10 w-full rounded-xl border border-white/[0.07] bg-zinc-950 pl-10 pr-3 text-sm text-white outline-none focus:border-orange-500/40" />
          </label>
          <select name="status" defaultValue={status} className="h-10 rounded-xl border border-white/[0.07] bg-zinc-950 px-3 text-sm text-white outline-none focus:border-orange-500/40">
            <option value="TODOS">Todos os status</option>
            <option value="ABERTA">Aberta</option>
            <option value="AGENDADA">Agendada</option>
            <option value="EM_ANDAMENTO">Em andamento</option>
            <option value="CONCLUIDA">Concluída</option>
            <option value="CANCELADA">Cancelada</option>
          </select>
          <select name="ordem" defaultValue={ordem} className="h-10 rounded-xl border border-white/[0.07] bg-zinc-950 px-3 text-sm text-white outline-none focus:border-orange-500/40">
            <option value="recentes">Mais recentes</option>
            <option value="cliente">Cliente A–Z</option>
          </select>
          <div className="flex gap-2">
            <button className="h-10 flex-1 rounded-xl bg-orange-500 px-4 text-sm font-bold text-white hover:bg-orange-600">Filtrar</button>
            {(busca || status !== "TODOS" || ordem !== "recentes") && <Link href="/os" className="inline-flex h-10 items-center rounded-xl px-3 text-xs font-semibold text-zinc-500 hover:bg-white/5 hover:text-white">Limpar</Link>}
          </div>
        </form>

        {filtradas.length > 0 ? (
          <OperationCardGrid>
            {filtradas.map((ordem) => (
              <article
                key={ordem.id}
                className={`group relative min-h-[168px] overflow-visible rounded-2xl border border-white/[0.08] bg-zinc-900 p-4 transition duration-200 before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:rounded-t-2xl hover:-translate-y-0.5 hover:border-white/[0.14] hover:shadow-lg hover:shadow-black/20 md:p-5 ${statusAccent(ordem.status)}`}
              >
                <Link href={`/os/${ordem.id}`} aria-label={`Abrir ${ordem.number}`} className="absolute inset-0 z-0 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500" />
                <div className="relative z-10 flex items-center justify-between gap-2">
                  <p className="pointer-events-none text-sm font-bold text-orange-400">{ordem.number}</p>
                  <div className="flex shrink-0 items-center gap-1">
                    <StatusBadge status={ordem.status} />
                    <DeleteOrder ordem={ordem} />
                  </div>
                </div>
                <h2 title={ordem.project.client.name} className="pointer-events-none relative z-10 mt-6 truncate text-lg font-black text-white">
                  {ordem.project.client.name}
                </h2>
                <div className="pointer-events-none absolute inset-x-4 bottom-4 z-10 flex items-center justify-between border-t border-white/[0.06] pt-3 text-xs md:inset-x-5">
                  <span className="flex min-w-0 items-center gap-2 text-zinc-400">
                    <CalendarDays size={15} className="shrink-0 text-zinc-600" />
                    <span className="truncate">{formatDate(ordem.scheduledDate)}</span>
                  </span>
                  <span className={`flex shrink-0 items-center gap-2 font-bold ${signatureClass(ordem)}`}>
                    <FileSignature size={15} />
                    Assinaturas {signatureLabel(ordem)}
                  </span>
                </div>
              </article>
            ))}
          </OperationCardGrid>
        ) : (
          <OperationEmptyState icon={ClipboardList} title="Nenhuma ordem encontrada" description="Ajuste os filtros ou crie uma nova ordem de serviço." />
        )}
      </main>
    </AppLayout>
  );
}

type OrderRow = Awaited<ReturnType<typeof listServiceOrders>>[number];

function signatureLabel(ordem: OrderRow) {
  const total = Number(Boolean(ordem.customerSignature)) + Number(Boolean(ordem.technicianSignature));
  return `${total}/2`;
}

function signatureClass(ordem: OrderRow) {
  const total = Number(Boolean(ordem.customerSignature)) + Number(Boolean(ordem.technicianSignature));
  return total === 2 ? "text-emerald-400" : total === 1 ? "text-amber-400" : "text-zinc-500";
}

function StatusBadge({ status }: { status: string }) {
  return <span className={`inline-flex shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusClass(status)}`}>{statusLabel(status)}</span>;
}

function DeleteOrder({ ordem }: { ordem: OrderRow }) {
  return (
    <EntityDeleteButton
      endpoint={`/api/os?id=${encodeURIComponent(ordem.id)}`}
      entityName={ordem.number}
      buttonLabel="Excluir OS"
      consequence="Timeline e fotos internas serão removidas. Projeto, cliente, lead e proposta serão preservados. Execução, checklist, assinatura ou financeiro consolidado bloqueiam a exclusão."
      successMessage="Ordem de Serviço excluída com sucesso."
      menuTrigger
      className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-white/5 hover:text-zinc-300"
    />
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="mb-2 block text-sm font-semibold text-zinc-400">{label}</label>{children}</div>;
}
