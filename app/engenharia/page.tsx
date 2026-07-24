import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { AppLayout } from "@/components/layout/AppLayout";
import { createEngineeringProject, getEngineeringOverview } from "@/services/engineering.service";
import { EntityDeleteButton } from "@/components/ui/EntityDeleteButton";
import { ENGINEERING_SERVICE_TYPES, engineeringTypeLabel } from "@/lib/engineering-service-types";

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

export default async function Engenharia() {
  const [projetos, clientes] = await getEngineeringOverview();

  return (
    <AppLayout>
      <main className="space-y-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-white">
              Engenharia
            </h1>

            <p className="mt-2 text-zinc-400">
              Projetos, homologações, ARTs e documentos técnicos.
            </p>
          </div>

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
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {projetos.map((projeto) => {
            const order = projeto.serviceOrder;
            const checklist = order ? [order.checklistArt, order.checklistProjectApproved, order.checklistMaterialsSeparated, order.checklistStructureInstalled, order.checklistModulesInstalled, order.checklistInverterInstalled, order.checklistDcCabling, order.checklistAcCabling, order.checklistCommissioning, order.checklistCustomerTraining, order.checklistDelivered] : [];
            const completed = checklist.filter(Boolean).length;
            const progress = checklist.length ? Math.round(completed / checklist.length * 100) : 0;
            return (
            <article
              key={projeto.id}
              className="group relative overflow-visible rounded-2xl border border-white/[0.07] bg-gradient-to-br from-zinc-900 to-zinc-950 p-3.5 transition duration-200 hover:-translate-y-0.5 hover:border-orange-500/30 hover:shadow-lg hover:shadow-black/20"
            >
              <Link href={`/engenharia/${projeto.id}`} aria-label={`Abrir ${projeto.title}`} className="absolute inset-0 z-0 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500" />
              <div className="relative z-10 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="pointer-events-none truncate text-[15px] font-bold text-white">
                    {projeto.title}
                  </h2>
                  <p className="pointer-events-none mt-0.5 truncate text-xs text-zinc-400">
                    {projeto.client.name}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <span className="pointer-events-none rounded-full bg-orange-500/15 px-2 py-0.5 text-[10px] font-semibold text-orange-400">
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
              <span className="pointer-events-none relative z-10 mt-2.5 inline-flex rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-[9px] font-bold text-cyan-300">
                {engineeringTypeLabel(projeto.serviceType)}
              </span>
              <div className="pointer-events-none relative z-10 mt-3.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-500">{completed} de 11 etapas</span>
                  <span className="font-bold text-orange-400">{progress}%</span>
                </div>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-zinc-800">
                  <div className={`h-full rounded-full ${progress === 100 ? "bg-emerald-500" : "bg-orange-500"}`} style={{ width: `${progress}%` }} />
                </div>
              </div>
            </article>
          );})}
        </div>

        {projetos.length === 0 && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-10 text-center">
            <h2 className="text-lg font-semibold text-white">
              Nenhum projeto cadastrado
            </h2>

            <p className="mt-2 text-zinc-500">
              Clique em Novo Projeto para cadastrar.
            </p>
          </div>
        )}
      </main>
    </AppLayout>
  );
}
