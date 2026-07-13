import {
  createServiceOrderData,
  updateServiceOrderData,
} from "@/services/service-orders.service";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { AppLayout } from "@/components/layout/AppLayout";
import Link from "next/link";

const COMPANY_ID = "default-company";

function formatDate(date: Date | null) {
  if (!date) return "-";

  return new Intl.DateTimeFormat("pt-BR").format(date);
}

function statusLabel(status: string) {
  switch (status) {
    case "ABERTA":
      return "Aberta";

    case "AGENDADA":
      return "Agendada";

    case "EM_ANDAMENTO":
      return "Em andamento";

    case "CONCLUIDA":
      return "Concluída";

    case "CANCELADA":
      return "Cancelada";

    default:
      return status;
  }
}

function getChecklistProgress(ordem: {
  checklistArt: boolean;
  checklistProjectApproved: boolean;
  checklistMaterialsSeparated: boolean;
  checklistStructureInstalled: boolean;
  checklistModulesInstalled: boolean;
  checklistInverterInstalled: boolean;
  checklistDcCabling: boolean;
  checklistAcCabling: boolean;
  checklistCommissioning: boolean;
  checklistCustomerTraining: boolean;
  checklistDelivered: boolean;
}) {
  const total = 11;

  const completed = [
    ordem.checklistArt,
    ordem.checklistProjectApproved,
    ordem.checklistMaterialsSeparated,
    ordem.checklistStructureInstalled,
    ordem.checklistModulesInstalled,
    ordem.checklistInverterInstalled,
    ordem.checklistDcCabling,
    ordem.checklistAcCabling,
    ordem.checklistCommissioning,
    ordem.checklistCustomerTraining,
    ordem.checklistDelivered,
  ].filter(Boolean).length;

  return Math.round((completed / total) * 100);
}

async function createServiceOrder(formData: FormData) {
  "use server";

  const projectId = String(
    formData.get("projectId") ?? ""
  ).trim();

  const title = String(
    formData.get("title") ?? ""
  ).trim();

  const responsible = String(
    formData.get("responsible") ?? ""
  ).trim();

  const scheduledDateValue = String(
    formData.get("scheduledDate") ?? ""
  ).trim();

  const services = String(
    formData.get("services") ?? ""
  ).trim();

  if (!projectId) {
    throw new Error("Selecione um projeto.");
  }

  if (!title) {
    throw new Error("Informe o título da OS.");
  }

  await createServiceOrderData({
  projectId,
  companyId: COMPANY_ID,
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

async function updateServiceOrder(
  formData: FormData
) {
  "use server";

  const id = String(
    formData.get("id") ?? ""
  ).trim();

  const status = String(
    formData.get("status") ?? "ABERTA"
  );

  if (!id) {
    throw new Error("OS não identificada.");
  }

  await updateServiceOrderData({
  id,
  status,
});

  revalidatePath("/os");
}

export default async function OrdensServicoPage() {
  const [ordens, projetos] =
    await Promise.all([
      prisma.serviceOrder.findMany({
        where: {
          companyId: COMPANY_ID,
        },

       include: {
  project: {
    include: {
      client: true,
    },
  },

  photos: true,

  timeline: true,
},

        
        orderBy: {
          createdAt: "desc",
        },
      },),

      prisma.project.findMany({
        where: {
          companyId: COMPANY_ID,

          serviceOrder: {
            is: null,
          },
        },

        include: {
          client: true,
        },

        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

  const abertas = ordens.filter(
    (ordem) =>
      ordem.status === "ABERTA" ||
      ordem.status === "AGENDADA"
  ).length;

  const emAndamento = ordens.filter(
    (ordem) =>
      ordem.status === "EM_ANDAMENTO"
  ).length;

  const concluidas = ordens.filter(
    (ordem) =>
      ordem.status === "CONCLUIDA"
  ).length;

  return (
    <AppLayout>
      <main className="space-y-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-white">
              Ordens de Serviço
            </h1>

            <p className="mt-2 text-zinc-400">
              Controle de instalações, equipes e
              serviços da PRD.
            </p>
          </div>

          <details className="group relative">
            <summary className="cursor-pointer list-none rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600">
              Nova OS
            </summary>

            <div className="absolute right-0 z-20 mt-3 w-[460px] rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
              <h2 className="text-xl font-bold text-white">
                Criar Ordem de Serviço
              </h2>

              <form
                action={createServiceOrder}
                className="mt-5 space-y-4"
              >
                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-400">
                    Projeto
                  </label>

                  <select
                    name="projectId"
                    required
                    defaultValue=""
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-orange-500"
                  >
                    <option
                      value=""
                      disabled
                    >
                      Selecione um projeto
                    </option>

                    {projetos.map(
                      (projeto) => (
                        <option
                          key={projeto.id}
                          value={projeto.id}
                        >
                          {projeto.title} —{" "}
                          {projeto.client.name}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-400">
                    Título da OS
                  </label>

                  <input
                    name="title"
                    required
                    placeholder="Ex.: Instalação do sistema solar"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-400">
                    Responsável
                  </label>

                  <input
                    name="responsible"
                    placeholder="Nome do responsável"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-400">
                    Data agendada
                  </label>

                  <input
                    name="scheduledDate"
                    type="date"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-400">
                    Serviços
                  </label>

                  <textarea
                    name="services"
                    rows={4}
                    placeholder="Descreva os serviços que serão executados."
                    className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-white outline-none focus:border-orange-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={
                    projetos.length === 0
                  }
                  className="w-full rounded-xl bg-orange-500 px-5 py-3 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Criar OS
                </button>

                {projetos.length === 0 && (
                  <p className="text-sm text-red-400">
                    Todos os projetos já possuem uma
                    Ordem de Serviço.
                  </p>
                )}
              </form>
            </div>
          </details>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <Card
            label="Abertas e agendadas"
            value={String(abertas)}
          />

          <Card
            label="Em andamento"
            value={String(emAndamento)}
          />

          <Card
            label="Concluídas"
            value={String(concluidas)}
          />
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          {ordens.map((ordem) => (
            <div
              key={ordem.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
            >
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-sm font-semibold text-orange-500">
                    {ordem.number}
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-white">
                    {ordem.title}
                  </h2>

                  <p className="mt-1 text-zinc-400">
                    {ordem.project.client.name}
                  </p>
                </div>

                <span
  className={`rounded-full px-3 py-1 text-xs font-semibold ${
    ordem.status === "CONCLUIDA"
      ? "bg-emerald-500/15 text-emerald-400"
      : ordem.status === "EM_ANDAMENTO"
      ? "bg-sky-500/15 text-sky-400"
      : ordem.status === "CANCELADA"
      ? "bg-red-500/15 text-red-400"
      : "bg-orange-500/15 text-orange-400"
  }`}
>
  {statusLabel(ordem.status)}
</span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <Info
                  label="Projeto"
                  value={ordem.project.title}
                />

                <Info
                  label="Responsável"
                  value={
                    ordem.responsible ?? "-"
                  }
                />

                <Info
                  label="Data agendada"
                  value={formatDate(
                    ordem.scheduledDate
                  )}
                />

                <Info
                  label="Telefone"
                  value={
                    ordem.project.client.phone ??
                    "-"
                  }
                />

                <Info
  label="Progresso"
  value={`${Math.round(
    ([
      ordem.checklistArt,
      ordem.checklistProjectApproved,
      ordem.checklistMaterialsSeparated,
      ordem.checklistStructureInstalled,
      ordem.checklistModulesInstalled,
      ordem.checklistInverterInstalled,
      ordem.checklistDcCabling,
      ordem.checklistAcCabling,
      ordem.checklistCommissioning,
      ordem.checklistCustomerTraining,
      ordem.checklistDelivered,
    ].filter(Boolean).length /
      11) *
      100
  )}%`}
/>
              </div>

             <div className="mt-5">
  <div className="mb-2 flex items-center justify-between">
    <span className="text-xs uppercase tracking-wide text-zinc-500">
      Progresso da Execução
    </span>

    <span className="text-sm font-bold text-orange-500">
      {Math.round(
        ([
          ordem.checklistArt,
          ordem.checklistProjectApproved,
          ordem.checklistMaterialsSeparated,
          ordem.checklistStructureInstalled,
          ordem.checklistModulesInstalled,
          ordem.checklistInverterInstalled,
          ordem.checklistDcCabling,
          ordem.checklistAcCabling,
          ordem.checklistCommissioning,
          ordem.checklistCustomerTraining,
          ordem.checklistDelivered,
        ].filter(Boolean).length /
          11) *
          100
      )}
      %
    </span>
  </div>

  <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
    <div
      className="h-full rounded-full bg-orange-500 transition-all"
      style={{
        width: `${Math.round(
          ([
            ordem.checklistArt,
            ordem.checklistProjectApproved,
            ordem.checklistMaterialsSeparated,
            ordem.checklistStructureInstalled,
            ordem.checklistModulesInstalled,
            ordem.checklistInverterInstalled,
            ordem.checklistDcCabling,
            ordem.checklistAcCabling,
            ordem.checklistCommissioning,
            ordem.checklistCustomerTraining,
            ordem.checklistDelivered,
          ].filter(Boolean).length /
            11) *
            100
        )}%`,
      }}
    />
  </div>
</div>
             
              {ordem.services && (
                <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                  <p className="text-xs uppercase tracking-wide text-zinc-500">
                    Serviços
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-300">
                    {ordem.services}
                  </p>
                </div>
              )}

              

  <div className="mt-5 flex gap-3">
  

  <Link
  href={`/os/${ordem.id}`}
  className="rounded-xl border border-orange-500 px-5 py-3 text-sm font-semibold text-orange-500 transition hover:bg-orange-500 hover:text-white"
>
  Abrir OS
</Link>

  <form
    action={updateServiceOrder}
    className="flex flex-1 gap-3"
  >
    <input
      type="hidden"
      name="id"
      value={ordem.id}
    />

    <select
      name="status"
      defaultValue={ordem.status}
      className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-orange-500"
    >
      <option value="ABERTA">
        Aberta
      </option>

      <option value="AGENDADA">
        Agendada
      </option>

      <option value="EM_ANDAMENTO">
        Em andamento
      </option>

      <option value="CONCLUIDA">
        Concluída
      </option>

      <option value="CANCELADA">
        Cancelada
      </option>
    </select>

    <button
      type="submit"
      className="rounded-xl bg-orange-500 px-5 py-3 font-bold text-white transition hover:bg-orange-600"
    >
      Salvar
    </button>
  </form>
</div>
            </div>
          ))}
        </div>

        {ordens.length === 0 && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-10 text-center">
            <h2 className="text-lg font-semibold text-white">
              Nenhuma Ordem de Serviço
            </h2>

            <p className="mt-2 text-zinc-500">
              Clique em Nova OS para criar a primeira.
            </p>
          </div>
        )}
      </main>
    </AppLayout>
  );
}

function Card({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <p className="text-sm text-zinc-400">
        {label}
      </p>

      <h2 className="mt-2 text-3xl font-bold text-orange-500">
        {value}
      </h2>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-zinc-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-zinc-200">
        {value}
      </p>
    </div>
  );
}