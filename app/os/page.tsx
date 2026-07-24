import { revalidatePath } from "next/cache";
import Link from "next/link";
import {
  CircleCheckBig,
  CirclePlay,
  ClipboardList,
  Eye,
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
          <>
            <section className="hidden overflow-hidden rounded-2xl border border-white/[0.07] bg-zinc-900/70 md:block">
              <table className="w-full table-fixed text-left">
                <thead className="border-b border-white/[0.07] bg-zinc-950/70 text-xs uppercase tracking-wide text-zinc-500">
                  <tr>
                    <th className="w-[13%] px-4 py-3">OS</th>
                    <th className="w-[22%] px-4 py-3">Empresa</th>
                    <th className="w-[18%] px-4 py-3">Responsável</th>
                    <th className="w-[15%] px-4 py-3">Data agendada</th>
                    <th className="w-[13%] px-4 py-3">Assinaturas</th>
                    <th className="w-[13%] px-4 py-3">Status</th>
                    <th className="w-[6%] px-3 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {ordens.map((ordem) => (
                    <tr key={ordem.id} className="transition hover:bg-white/[0.025]">
                      <td className="px-4 py-3">
                        <Link href={`/os/${ordem.id}`} className="font-bold text-orange-400 hover:text-orange-300">{ordem.number}</Link>
                        <p className="mt-0.5 truncate text-xs text-zinc-500">{ordem.title}</p>
                      </td>
                      <td className="truncate px-4 py-3 text-sm text-zinc-200">{ordem.project.client.name}</td>
                      <td className="truncate px-4 py-3 text-sm text-zinc-400">{ordem.responsible ?? "-"}</td>
                      <td className="px-4 py-3 text-sm text-zinc-400">{formatDate(ordem.scheduledDate)}</td>
                      <td className="px-4 py-3 text-sm text-zinc-400">{signatureLabel(ordem)}</td>
                      <td className="px-4 py-3"><StatusBadge status={ordem.status} /></td>
                      <td className="px-3 py-3">
                        <div className="flex justify-end gap-1">
                          <Link href={`/os/${ordem.id}`} aria-label={`Abrir ${ordem.number}`} title="Abrir OS" className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-orange-500/10 hover:text-orange-400"><Eye size={16} /></Link>
                          <DeleteOrder ordem={ordem} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section className="grid gap-3 md:hidden">
              {ordens.map((ordem) => (
                <article key={ordem.id} className="relative rounded-2xl border border-white/[0.07] bg-zinc-900 p-4">
                  <Link href={`/os/${ordem.id}`} aria-label={`Abrir ${ordem.number}`} className="absolute inset-0 z-0 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500" />
                  <div className="pointer-events-none relative z-10 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-orange-400">{ordem.number}</p>
                      <h2 className="mt-1 truncate font-semibold text-white">{ordem.title}</h2>
                      <p className="mt-1 truncate text-sm text-zinc-400">{ordem.project.client.name}</p>
                    </div>
                    <StatusBadge status={ordem.status} />
                  </div>
                  <div className="pointer-events-none relative z-10 mt-4 grid grid-cols-2 gap-3 text-xs">
                    <CompactInfo label="Responsável" value={ordem.responsible ?? "-"} />
                    <CompactInfo label="Data agendada" value={formatDate(ordem.scheduledDate)} />
                    <CompactInfo label="Assinaturas" value={signatureLabel(ordem)} />
                  </div>
                  <div className="relative z-20 mt-2 flex justify-end"><DeleteOrder ordem={ordem} /></div>
                </article>
              ))}
            </section>
          </>
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
      entityName={`${ordem.number} — ${ordem.title}`}
      buttonLabel="Excluir OS"
      consequence="Timeline e fotos internas serão removidas. Projeto, cliente, lead e proposta serão preservados. Execução, checklist, assinatura ou financeiro consolidado bloqueiam a exclusão."
      successMessage="Ordem de Serviço excluída com sucesso."
      iconOnly
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-red-500/10 hover:text-red-400"
    />
  );
}

function CompactInfo({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0"><p className="text-zinc-600">{label}</p><p className="mt-1 truncate font-medium text-zinc-300">{value}</p></div>;
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
