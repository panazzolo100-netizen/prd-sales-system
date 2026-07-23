import {
  createServiceOrderData,
  listAvailableProjectsForServiceOrder,
  listServiceOrders,
  updateServiceOrderData,
} from "@/services/service-orders.service";

import { revalidatePath } from "next/cache";
import Link from "next/link";
import { EntityDeleteButton } from "@/components/ui/EntityDeleteButton";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleCheckBig,
  CirclePlay,
  ClipboardList,
  Clock3,
  Download,
  Eye,
  FileSignature,
  FolderKanban,
  ImageIcon,
  Phone,
  Save,
  UserRound,
  type LucideIcon,
} from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { getCurrentCompanyId } from "@/lib/auth/current-user";

function formatDate(date: Date | null) {
  if (!date) {
    return "-";
  }

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

function getServiceOrderStatusStyle(status: string) {
  switch (status) {
    case "CONCLUIDA":
      return {
        accent: "bg-emerald-500",
        badge:
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
        number: "text-emerald-400",
      };

    case "EM_ANDAMENTO":
      return {
        accent: "bg-sky-500",
        badge:
          "border-sky-500/20 bg-sky-500/10 text-sky-400",
        number: "text-sky-400",
      };

    case "CANCELADA":
      return {
        accent: "bg-red-500",
        badge:
          "border-red-500/20 bg-red-500/10 text-red-400",
        number: "text-red-400",
      };

    case "AGENDADA":
      return {
        accent: "bg-violet-500",
        badge:
          "border-violet-500/20 bg-violet-500/10 text-violet-400",
        number: "text-violet-400",
      };

    default:
      return {
        accent: "bg-orange-500",
        badge:
          "border-orange-500/20 bg-orange-500/10 text-orange-400",
        number: "text-orange-400",
      };
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
  const items = [
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
  ];

  const total = items.length;
  const completed = items.filter(Boolean).length;
  const percentage = Math.round(
    (completed / total) * 100
  );

  return {
    total,
    completed,
    percentage,
  };
}

function getProgressStatus(percentage: number) {
  if (percentage === 100) {
    return {
      label: "Concluído",
      badgeClass:
        "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
      barClass: "bg-emerald-500",
      percentageClass: "text-emerald-400",
    };
  }

  if (percentage >= 60) {
    return {
      label: "Etapa avançada",
      badgeClass:
        "border-sky-500/20 bg-sky-500/10 text-sky-400",
      barClass: "bg-sky-500",
      percentageClass: "text-sky-400",
    };
  }

  if (percentage > 0) {
    return {
      label: "Em execução",
      badgeClass:
        "border-orange-500/20 bg-orange-500/10 text-orange-400",
      barClass: "bg-orange-500",
      percentageClass: "text-orange-400",
    };
  }

  return {
    label: "Não iniciado",
    badgeClass:
      "border-zinc-700 bg-zinc-800/80 text-zinc-400",
    barClass: "bg-zinc-600",
    percentageClass: "text-zinc-400",
  };
}

function isServiceOrderLate(ordem: {
  status: string;
  scheduledDate: Date | null;
}) {
  if (!ordem.scheduledDate) {
    return false;
  }

  if (
    ordem.status === "CONCLUIDA" ||
    ordem.status === "CANCELADA"
  ) {
    return false;
  }

  const scheduledDate = new Date(ordem.scheduledDate);
  const today = new Date();

  scheduledDate.setHours(23, 59, 59, 999);

  return scheduledDate < today;
}

async function createServiceOrder(formData: FormData) {
  "use server";

  const companyId = await getCurrentCompanyId();

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
  const companyId = await getCurrentCompanyId();

  const [ordens, projetos] = await Promise.all([
    listServiceOrders(companyId),
    listAvailableProjectsForServiceOrder(companyId),
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
                    <option value="" disabled>
                      Selecione um projeto
                    </option>

                    {projetos.map((projeto) => (
                      <option
                        key={projeto.id}
                        value={projeto.id}
                      >
                        {projeto.title} —{" "}
                        {projeto.client.name}
                      </option>
                    ))}
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
                  disabled={projetos.length === 0}
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
            icon={ClipboardList}
          />

          <Card
            label="Em andamento"
            value={String(emAndamento)}
            icon={CirclePlay}
          />

          <Card
            label="Concluídas"
            value={String(concluidas)}
            icon={CircleCheckBig}
          />
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          {ordens.map((ordem) => {
            const checklist =
              getChecklistProgress(ordem);

            const progressStatus =
              getProgressStatus(
                checklist.percentage
              );

            const isLate =
              isServiceOrderLate(ordem);

            const hasSignature =
              Boolean(ordem.customerSignature) ||
              Boolean(ordem.technicianSignature);

            const statusStyle =
              getServiceOrderStatusStyle(
                ordem.status
              );

            return (
              <article
                key={ordem.id}
                className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 transition duration-200 hover:-translate-y-1 hover:border-zinc-700 hover:shadow-2xl hover:shadow-black/30"
              >
                <div
                  className={`absolute inset-y-0 left-0 w-1.5 ${statusStyle.accent}`}
                />

                <div className="p-6 pl-7">
                  <div className="flex items-start justify-between gap-5">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-sm font-bold ${statusStyle.number}`}
                        >
                          {ordem.number}
                        </span>

                        <span className="h-1 w-1 rounded-full bg-zinc-600" />

                        <span className="truncate text-xs font-medium uppercase tracking-[0.16em] text-zinc-500">
                          {ordem.project.title}
                        </span>
                      </div>

                      <h2 className="mt-2 truncate text-xl font-bold tracking-tight text-white">
                        {ordem.title}
                      </h2>

                      <div className="mt-2 flex items-center gap-2 text-sm text-zinc-400">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-800 text-zinc-500">
                          <UserRound size={14} />
                        </span>

                        <span className="truncate font-medium">
                          {ordem.project.client.name}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${statusStyle.badge}`}
                    >
                      {statusLabel(ordem.status)}
                    </span>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <Info
                      label="Projeto"
                      value={ordem.project.title}
                      icon={FolderKanban}
                    />

                    <Info
                      label="Responsável"
                      value={
                        ordem.responsible ?? "-"
                      }
                      icon={UserRound}
                    />

                    <Info
                      label="Data agendada"
                      value={formatDate(
                        ordem.scheduledDate
                      )}
                      icon={CalendarDays}
                      alert={isLate}
                    />

                    <Info
                      label="Telefone"
                      value={
                        ordem.project.client.phone ??
                        "-"
                      }
                      icon={Phone}
                    />
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-3">
                    <StatusIndicator
                      label="Fotos"
                      value={String(
                        ordem.photos.length
                      )}
                      icon={ImageIcon}
                    />

                    <StatusIndicator
                      label="Timeline"
                      value={String(
                        ordem.timeline.length
                      )}
                      icon={Clock3}
                    />

                    <StatusIndicator
                      label="Assinatura"
                      value={
                        hasSignature ? "Sim" : "Não"
                      }
                      icon={
                        hasSignature
                          ? CheckCircle2
                          : FileSignature
                      }
                      active={hasSignature}
                    />
                  </div>

                  {isLate && (
                    <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400">
                      <Clock3 size={17} />

                      Ordem de Serviço atrasada
                    </div>
                  )}

                  <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Progresso da execução
                        </p>

                        <p className="mt-2 text-sm font-medium text-zinc-300">
                          {checklist.completed} de{" "}
                          {checklist.total} etapas
                          concluídas
                        </p>
                      </div>

                      <div className="text-right">
                        <p
                          className={`text-2xl font-bold ${progressStatus.percentageClass}`}
                        >
                          {checklist.percentage}%
                        </p>

                        <span
                          className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${progressStatus.badgeClass}`}
                        >
                          {progressStatus.label}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${progressStatus.barClass}`}
                        style={{
                          width: `${checklist.percentage}%`,
                        }}
                      />
                    </div>
                  </div>

                  <details className="group/details mt-5 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 transition hover:bg-zinc-800/60">
                      <div>
                        <p className="text-sm font-semibold text-zinc-200">
                          Detalhes operacionais
                        </p>

                        <p className="mt-0.5 text-xs text-zinc-500">
                          Checklist, registros e serviços da OS
                        </p>
                      </div>

                      <ChevronDown
                        size={18}
                        className="shrink-0 text-zinc-500 transition-transform duration-200 group-open/details:rotate-180"
                      />
                    </summary>

                    <div className="border-t border-zinc-800 p-4">
                      <div className="grid gap-3 sm:grid-cols-3">
                        <DetailMetric
                          label="Checklist"
                          value={`${checklist.completed}/${checklist.total}`}
                          description="etapas concluídas"
                        />

                        <DetailMetric
                          label="Registros"
                          value={String(
                            ordem.timeline.length
                          )}
                          description="eventos na timeline"
                        />

                        <DetailMetric
                          label="Evidências"
                          value={String(
                            ordem.photos.length
                          )}
                          description="fotos anexadas"
                        />
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                            Situação da execução
                          </p>

                          <div className="mt-3 flex items-center justify-between gap-3">
                            <span
                              className={`rounded-full border px-3 py-1 text-xs font-semibold ${progressStatus.badgeClass}`}
                            >
                              {progressStatus.label}
                            </span>

                            <span
                              className={`text-lg font-bold ${progressStatus.percentageClass}`}
                            >
                              {checklist.percentage}%
                            </span>
                          </div>
                        </div>

                        <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                            Assinaturas
                          </p>

                          <div className="mt-3 flex items-center gap-2">
                            {hasSignature ? (
                              <>
                                <CheckCircle2
                                  size={18}
                                  className="text-emerald-400"
                                />

                                <span className="text-sm font-semibold text-emerald-400">
                                  Registrada
                                </span>
                              </>
                            ) : (
                              <>
                                <FileSignature
                                  size={18}
                                  className="text-zinc-500"
                                />

                                <span className="text-sm font-semibold text-zinc-400">
                                  Pendente
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Serviços previstos
                        </p>

                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
                          {ordem.services?.trim() ||
                            "Nenhum serviço detalhado nesta OS."}
                        </p>
                      </div>
                    </div>
                  </details>
                </div>

                <div className="border-t border-zinc-800 bg-zinc-950/50 p-4 pl-7">
                  <div className="flex flex-col gap-3 lg:flex-row">
                    <div className="flex gap-3">
                      <Link
                        href={`/os/${ordem.id}`}
                        className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
                      >
                        <Eye size={17} />
                        Abrir OS
                      </Link>

                      <a
                        href={`/api/os/${ordem.id}/pdf`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 rounded-xl border border-zinc-700 px-4 py-3 text-sm font-semibold text-zinc-300 transition hover:border-zinc-500 hover:bg-zinc-800 hover:text-white"
                      >
                        <Download size={17} />
                        Gerar PDF
                      </a>
                    </div>

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
                        className="min-w-0 flex-1 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-orange-500"
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
                        className="flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-5 py-3 font-bold text-white transition hover:border-zinc-600 hover:bg-zinc-700"
                      >
                        <Save size={17} />
                        Salvar
                      </button>
                    </form>
                    <EntityDeleteButton
                      endpoint={`/api/os?id=${encodeURIComponent(ordem.id)}`}
                      entityName={`${ordem.number} — ${ordem.title}`}
                      buttonLabel="Excluir OS"
                      consequence="Timeline e fotos internas serão removidas. Projeto, cliente, lead e proposta serão preservados. Execução, checklist, assinatura ou financeiro consolidado bloqueiam a exclusão."
                      successMessage="Ordem de Serviço excluída com sucesso."
                    />
                  </div>
                </div>
              </article>
            );
          })}
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

function DetailMetric({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-white">
        {value}
      </p>

      <p className="mt-1 text-xs text-zinc-500">
        {description}
      </p>
    </div>
  );
}

function Card({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <div className="group rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition duration-200 hover:-translate-y-0.5 hover:border-zinc-700 hover:shadow-xl hover:shadow-black/20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-zinc-400">
            {label}
          </p>

          <h2 className="mt-3 text-4xl font-bold tracking-tight text-white">
            {value}
          </h2>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 transition group-hover:bg-orange-500 group-hover:text-white">
          <Icon size={22} />
        </div>
      </div>

      <div className="mt-5 h-1 overflow-hidden rounded-full bg-zinc-800">
        <div className="h-full w-12 rounded-full bg-orange-500 transition-all duration-300 group-hover:w-20" />
      </div>
    </div>
  );
}

function Info({
  label,
  value,
  icon: Icon,
  alert = false,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  alert?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border p-4 ${
        alert
          ? "border-red-500/20 bg-red-500/10"
          : "border-zinc-800 bg-zinc-950/70"
      }`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          alert
            ? "bg-red-500/15 text-red-400"
            : "bg-zinc-800 text-zinc-400"
        }`}
      >
        <Icon size={17} />
      </div>

      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-zinc-500">
          {label}
        </p>

        <p
          className={`mt-1 truncate text-sm font-semibold ${
            alert
              ? "text-red-300"
              : "text-zinc-200"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function StatusIndicator({
  label,
  value,
  icon: Icon,
  active = false,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  active?: boolean;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3">
      <div className="flex items-center gap-2">
        <Icon
          size={16}
          className={
            active
              ? "text-emerald-400"
              : "text-zinc-500"
          }
        />

        <span className="text-xs font-medium text-zinc-500">
          {label}
        </span>
      </div>

      <p
        className={`mt-2 text-lg font-bold ${
          active
            ? "text-emerald-400"
            : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
