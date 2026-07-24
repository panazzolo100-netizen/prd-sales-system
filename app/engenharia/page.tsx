import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { AppLayout } from "@/components/layout/AppLayout";
import { createEngineeringProject, getEngineeringOverview } from "@/services/engineering.service";
import { EntityDeleteButton } from "@/components/ui/EntityDeleteButton";
import { ENGINEERING_SERVICE_TYPES, engineeringTypeLabel } from "@/lib/engineering-service-types";
import { CheckCircle2, FolderKanban, Search, Workflow } from "lucide-react";
import {
  CardProgress,
  CompactMetricCard,
  OperationCardGrid,
  OperationEmptyState,
  OperationPageHeader,
} from "@/components/operations/OperationListing";

function statusLabel(status: string) {
  switch (status) {
    case "NOVO":
      return "Novo";

    case "EM_ANDAMENTO":
      return "Em andamento";

    case "AGUARDANDO":
      return "Aguardando";

    case "CONCLUIDO":
      return "Concluído";

    case "CANCELADO":
      return "Cancelado";

    default:
      return status;
  }
}

function engineeringStatusClass(status: string) {
  return {
    CONCLUIDO: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    EM_ANDAMENTO: "border-orange-500/20 bg-orange-500/10 text-orange-400",
    AGUARDANDO: "border-amber-500/20 bg-amber-500/10 text-amber-400",
    CANCELADO: "border-red-500/20 bg-red-500/10 text-red-400",
  }[status] ?? "border-sky-500/20 bg-sky-500/10 text-sky-400";
}

function engineeringAccentClass(status: string) {
  return {
    CONCLUIDO: "before:bg-emerald-500",
    AGUARDANDO: "before:bg-amber-500",
    CANCELADO: "before:bg-red-500",
    NOVO: "before:bg-sky-500",
  }[status] ?? "before:bg-orange-500";
}

async function createProject(formData: FormData) {
  "use server";

  const title = String(
    formData.get("title") ?? ""
  ).trim();

  const clientId = String(
    formData.get("clientId") ?? ""
  ).trim();

  const description = String(
    formData.get("description") ?? ""
  ).trim();
  const serviceType = String(formData.get("serviceType") ?? "USINA_SOLAR");

  const project = await createEngineeringProject({ title, clientId, serviceType, description });

  revalidatePath("/engenharia");
  revalidatePath("/financeiro");
  revalidatePath("/");

  redirect(
    `/engenharia/${project.id}`
  );
}

export default async function Engenharia({
  searchParams,
}: {
  searchParams: Promise<{ busca?: string; status?: string; ordem?: string }>;
}) {
  const [projetos, clientes] = await getEngineeringOverview();
  const params = await searchParams;
  const busca = params.busca?.trim().toLocaleLowerCase("pt-BR") ?? "";
  const status = params.status ?? "TODOS";
  const ordem = params.ordem ?? "recentes";
  const filtrados = projetos
    .filter((projeto) =>
      (!busca ||
        projeto.title.toLocaleLowerCase("pt-BR").includes(busca) ||
        projeto.client.name.toLocaleLowerCase("pt-BR").includes(busca)) &&
      (status === "TODOS" || projeto.status === status)
    )
    .sort((a, b) =>
      ordem === "titulo"
        ? a.title.localeCompare(b.title, "pt-BR")
        : 0
    );
  const emAndamento = projetos.filter((item) => item.status === "EM_ANDAMENTO").length;
  const concluidos = projetos.filter((item) => item.status === "CONCLUIDO").length;

  return (
    <AppLayout>
      <main className="space-y-5">
        <OperationPageHeader
          breadcrumb="Operação / Engenharia"
          title="Engenharia"
          description="Acompanhe projetos, homologações e evolução técnica."
          action={
          <details className="group relative">
            <summary className="cursor-pointer list-none rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600">
              Novo Projeto
            </summary>

            <div className="absolute right-0 z-20 mt-3 w-[430px] rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
              <h2 className="text-xl font-bold text-white">
                Criar projeto
              </h2>

              <form
                action={createProject}
                className="mt-5 space-y-4"
              >
                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-400">Tipo de serviço de engenharia</label>
                  <select name="serviceType" defaultValue="USINA_SOLAR" className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-orange-500">{ENGINEERING_SERVICE_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-400">
                    Título
                  </label>

                  <input
                    name="title"
                    required
                    placeholder="Ex.: Projeto Solar - Cliente"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-400">
                    Cliente
                  </label>

                  <select
                    name="clientId"
                    required
                    defaultValue=""
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-orange-500"
                  >
                    <option
                      value=""
                      disabled
                    >
                      Selecione um cliente
                    </option>

                    {clientes.map(
                      (cliente) => (
                        <option
                          key={cliente.id}
                          value={cliente.id}
                        >
                          {cliente.name}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-400">
                    Descrição
                  </label>

                  <textarea
                    name="description"
                    rows={4}
                    placeholder="Descrição inicial do projeto"
                    className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-white outline-none focus:border-orange-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={
                    clientes.length === 0
                  }
                  className="w-full rounded-xl bg-orange-500 px-5 py-3 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Criar Projeto
                </button>

                {clientes.length === 0 && (
                  <p className="text-sm text-red-400">
                    Cadastre um cliente antes de criar o projeto.
                  </p>
                )}
              </form>
            </div>
          </details>
          }
        />

        <section className="grid gap-3 sm:grid-cols-3">
          <CompactMetricCard icon={FolderKanban} label="Total de projetos" value={projetos.length} />
          <CompactMetricCard icon={Workflow} label="Em andamento" value={emAndamento} tone="orange" />
          <CompactMetricCard icon={CheckCircle2} label="Concluídos" value={concluidos} tone="green" />
        </section>

        <form className="grid gap-2 rounded-2xl border border-white/[0.07] bg-zinc-900/60 p-2.5 md:grid-cols-[minmax(260px,1fr)_190px_170px_auto]">
          <label className="relative">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
            <input name="busca" defaultValue={params.busca} placeholder="Buscar projeto ou cliente..." className="h-10 w-full rounded-xl border border-white/[0.07] bg-zinc-950 pl-10 pr-3 text-sm text-white outline-none focus:border-orange-500/40" />
          </label>
          <select name="status" defaultValue={status} className="h-10 rounded-xl border border-white/[0.07] bg-zinc-950 px-3 text-sm text-white outline-none focus:border-orange-500/40">
            <option value="TODOS">Todos os status</option>
            <option value="NOVO">Novo</option>
            <option value="EM_ANDAMENTO">Em andamento</option>
            <option value="AGUARDANDO">Aguardando</option>
            <option value="CONCLUIDO">Concluído</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
          <select name="ordem" defaultValue={ordem} className="h-10 rounded-xl border border-white/[0.07] bg-zinc-950 px-3 text-sm text-white outline-none focus:border-orange-500/40">
            <option value="recentes">Mais recentes</option>
            <option value="titulo">Título A–Z</option>
          </select>
          <div className="flex gap-2">
            <button className="h-10 flex-1 rounded-xl bg-orange-500 px-4 text-sm font-bold text-white hover:bg-orange-600">Filtrar</button>
            {(busca || status !== "TODOS" || ordem !== "recentes") && <Link href="/engenharia" className="inline-flex h-10 items-center rounded-xl px-3 text-xs font-semibold text-zinc-500 hover:bg-white/5 hover:text-white">Limpar</Link>}
          </div>
        </form>

        {filtrados.length ? <OperationCardGrid>
          {filtrados.map((projeto) => {
            const order = projeto.serviceOrder;
            const checklist = order ? [order.checklistArt, order.checklistProjectApproved, order.checklistMaterialsSeparated, order.checklistStructureInstalled, order.checklistModulesInstalled, order.checklistInverterInstalled, order.checklistDcCabling, order.checklistAcCabling, order.checklistCommissioning, order.checklistCustomerTraining, order.checklistDelivered] : [];
            const completed = checklist.filter(Boolean).length;
            const progress = checklist.length ? Math.round(completed / checklist.length * 100) : 0;
            return (
            <article
              key={projeto.id}
              className={`group relative min-h-[168px] overflow-visible rounded-2xl border border-white/[0.08] bg-zinc-900 p-4 transition duration-200 before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:rounded-t-2xl hover:-translate-y-0.5 hover:border-orange-500/30 hover:shadow-lg hover:shadow-black/20 md:p-5 ${engineeringAccentClass(projeto.status)}`}
            >
              <Link href={`/engenharia/${projeto.id}`} aria-label={`Abrir ${projeto.title}`} className="absolute inset-0 z-0 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500" />
              <div className="relative z-10 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 title={projeto.title} className="pointer-events-none truncate text-base font-bold text-white">
                    {projeto.title}
                  </h2>
                  <p title={projeto.client.name} className="pointer-events-none mt-1 truncate text-sm text-zinc-400">
                    {projeto.client.name}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <span className={`pointer-events-none rounded-full border px-2 py-0.5 text-[10px] font-semibold ${engineeringStatusClass(projeto.status)}`}>
                    {statusLabel(projeto.status)}
                  </span>
                  <EntityDeleteButton
                    endpoint={`/api/projects?id=${encodeURIComponent(projeto.id)}`}
                    entityName={`${projeto.title} — ${projeto.client.name}`}
                    buttonLabel="Excluir projeto"
                    consequence="Etapas, eventos e documentos próprios serão removidos, inclusive seus arquivos no Storage. Cliente e lead serão preservados. Ordem de Serviço ou financeiro bloqueiam a exclusão."
                    successMessage="Projeto excluído com sucesso."
                    menuTrigger
                    className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-white/5 hover:text-zinc-300"
                  />
                </div>
              </div>
              <div className="pointer-events-none relative z-10 mt-4 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400"><Workflow size={15} /></span>
                <span className="inline-flex rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-bold text-cyan-300">
                  {engineeringTypeLabel(projeto.serviceType)}
                </span>
              </div>
              <div className="pointer-events-none absolute inset-x-4 bottom-4 z-10 md:inset-x-5">
                <CardProgress completed={completed} total={11} percentage={progress} />
              </div>
            </article>
          );})}
        </OperationCardGrid> : (
          <OperationEmptyState icon={FolderKanban} title="Nenhum projeto encontrado" description="Ajuste os filtros ou crie um novo projeto." />
        )}

      </main>
    </AppLayout>
  );
}
