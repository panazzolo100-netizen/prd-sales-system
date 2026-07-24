import { revalidatePath } from "next/cache";
import Link from "next/link";
import {
  CalendarDays,
  CircleCheckBig,
  CirclePlay,
  ClipboardList,
  FileSignature,
  type LucideIcon,
} from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { EntityDeleteButton } from "@/components/ui/EntityDeleteButton";
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

export default async function OrdensServicoPage() {
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

  return (
    <AppLayout>
      <main className="space-y-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
          <div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              Ordens de Serviço
            </h1>
            <p className="mt-2 text-zinc-400">
              Controle de instalações, equipes e serviços da PRD.
            </p>
          </div>

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
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <SummaryCard label="Abertas e agendadas" value={abertas} icon={ClipboardList} />
          <SummaryCard label="Em andamento" value={emAndamento} icon={CirclePlay} />
          <SummaryCard label="Concluídas" value={concluidas} icon={CircleCheckBig} />
        </div>

        {ordens.length > 0 ? (
          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {ordens.map((ordem) => (
              <article
                key={ordem.id}
                className="group relative overflow-visible rounded-2xl border border-white/[0.07] bg-gradient-to-br from-zinc-900 to-zinc-950 p-3.5 transition duration-200 hover:-translate-y-0.5 hover:border-orange-500/30 hover:shadow-lg hover:shadow-black/20"
              >
                <Link href={`/os/${ordem.id}`} aria-label={`Abrir ${ordem.number}`} className="absolute inset-0 z-0 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500" />
                <div className="relative z-10 flex items-center justify-between gap-2">
                  <p className="pointer-events-none text-sm font-bold text-orange-400">{ordem.number}</p>
                  <div className="flex shrink-0 items-center gap-1">
                    <StatusBadge status={ordem.status} />
                    <DeleteOrder ordem={ordem} />
                  </div>
                </div>
                <h2 className="pointer-events-none relative z-10 mt-3 truncate text-[15px] font-bold text-white">
                  {ordem.project.client.name}
                </h2>
                <div className="pointer-events-none relative z-10 mt-3.5 flex items-center justify-between border-t border-white/[0.06] pt-3 text-[11px]">
                  <span className="flex min-w-0 items-center gap-1.5 text-zinc-500">
                    <CalendarDays size={13} className="shrink-0" />
                    <span className="truncate">{formatDate(ordem.scheduledDate)}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5 font-semibold text-zinc-300">
                    <FileSignature size={13} className="text-zinc-500" />
                    {signatureLabel(ordem)}
                  </span>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-10 text-center">
            <h2 className="text-lg font-semibold text-white">Nenhuma Ordem de Serviço</h2>
            <p className="mt-2 text-zinc-500">Clique em Nova OS para criar a primeira.</p>
          </div>
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

function SummaryCard({ label, value, icon: Icon }: { label: string; value: number; icon: LucideIcon }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3">
      <div><p className="text-xs text-zinc-500">{label}</p><p className="mt-1 text-2xl font-bold text-white">{value}</p></div>
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500"><Icon size={18} /></div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="mb-2 block text-sm font-semibold text-zinc-400">{label}</label>{children}</div>;
}
