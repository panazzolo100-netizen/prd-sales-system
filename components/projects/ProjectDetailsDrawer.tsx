"use client";

import {
  useEffect,
  useState,
} from "react";
import {
  Building2,
  CalendarDays,
  Camera,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  FileText,
  FolderKanban,
  History,
  LoaderCircle,
  Mail,
  MapPin,
  Pencil,
  Phone,
  RefreshCw,
  Save,
  Star,
  Trash2,
  Wrench,
  X,
} from "lucide-react";

import { ProjectServiceOrderTab } from "@/components/projects/tabs/ProjectServiceOrderTab";
import { ProjectDocumentsTab } from "@/components/projects/tabs/ProjectDocumentsTab";
import { Drawer } from "@/components/ui/Drawer";
import type {
  ProjectListItem,
  ProjectTimelineItem,
  ProjectTimelineType,
} from "@/types/project";

type ProjectTab =
  | "Resumo"
  | "Documentos"
  | "Financeiro"
  | "Ordem de Serviço"
  | "Histórico";

type Props = {
  project: ProjectListItem | null;
  open: boolean;
  onClose: () => void;

  onProjectChange?: (
    project: ProjectListItem
  ) => void;
};

type ProjectFormData = {
  title: string;
  status: string;
  description: string;
};

type FeedbackMessage = {
  type: "success" | "error";
  text: string;
} | null;

const tabs: {
  name: ProjectTab;
  icon: typeof FolderKanban;
}[] = [
  {
    name: "Resumo",
    icon: FolderKanban,
  },
  {
    name: "Documentos",
    icon: FileText,
  },
  {
    name: "Financeiro",
    icon: CircleDollarSign,
  },
  {
    name: "Ordem de Serviço",
    icon: Wrench,
  },
  {
    name: "Histórico",
    icon: History,
  },
];

const PROJECT_STATUS_OPTIONS = [
  { value: "NOVO", label: "Novo" },
  { value: "EM_ANDAMENTO", label: "Em andamento" },
  { value: "CONCLUIDO", label: "Concluído" },
  { value: "CANCELADO", label: "Cancelado" },
] as const;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(
  value: Date | string | null
) {
  if (!value) {
    return "Não informado";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

function normalizeStatus(status: string) {
  return status
    .trim()
    .toLocaleUpperCase("pt-BR")
    .replaceAll(" ", "_");
}

function getStatusLabel(status: string) {
  switch (normalizeStatus(status)) {
    case "EM_ANDAMENTO":
      return "Em andamento";

    case "CONCLUIDO":
    case "CONCLUÍDO":
      return "Concluído";

    case "CANCELADO":
      return "Cancelado";

    default:
      return "Novo";
  }
}

function getStatusStyle(status: string) {
  switch (normalizeStatus(status)) {
    case "EM_ANDAMENTO":
      return "border-orange-500/25 bg-orange-500/10 text-orange-400";

    case "CONCLUIDO":
    case "CONCLUÍDO":
      return "border-emerald-500/25 bg-emerald-500/10 text-emerald-400";

    case "CANCELADO":
      return "border-red-500/25 bg-red-500/10 text-red-400";

    default:
      return "border-sky-500/25 bg-sky-500/10 text-sky-400";
  }
}

function createProjectForm(
  project: ProjectListItem
): ProjectFormData {
  return {
    title: project.title,
    status: normalizeStatus(
      project.status
    ),
    description:
      project.description ?? "",
  };
}
export function ProjectDetailsDrawer({
  project,
  open,
  onClose,
  onProjectChange,
}: Props) {
  const [activeTab, setActiveTab] =
    useState<ProjectTab>("Resumo");

  const [
    currentProject,
    setCurrentProject,
  ] =
    useState<ProjectListItem | null>(
      project
    );

  const [editing, setEditing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [feedback, setFeedback] =
    useState<FeedbackMessage>(null);

  const [timeline, setTimeline] =
    useState<ProjectTimelineItem[]>([]);

  const [timelineLoading, setTimelineLoading] =
    useState(false);

  const [timelineError, setTimelineError] =
    useState<string | null>(null);

  const [timelineRefreshKey, setTimelineRefreshKey] =
    useState(0);

  const [form, setForm] =
    useState<ProjectFormData>({
      title: "",
      status: "NOVO",
      description: "",
    });

  const currentProjectId = currentProject?.id;

  useEffect(() => {
    setCurrentProject(project);

    if (project) {
      setForm(
        createProjectForm(project)
      );
    }
  }, [project]);

  useEffect(() => {
    if (!project?.id) {
      return;
    }

    setActiveTab("Resumo");
    setEditing(false);
    setFeedback(null);
  }, [project?.id]);

  useEffect(() => {
    if (activeTab !== "Histórico" || !currentProjectId) {
      return;
    }

    const projectId = currentProjectId;
    const controller = new AbortController();

    async function loadTimeline() {
      setTimelineLoading(true);
      setTimelineError(null);

      try {
        const response = await fetch(
          `/api/projects/timeline?projectId=${encodeURIComponent(
            projectId
          )}`,
          { signal: controller.signal }
        );

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(
            responseData.error ?? "Erro ao carregar histórico."
          );
        }

        setTimeline(responseData as ProjectTimelineItem[]);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setTimelineError(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar o histórico."
        );
      } finally {
        if (!controller.signal.aborted) {
          setTimelineLoading(false);
        }
      }
    }

    void loadTimeline();

    return () => controller.abort();
  }, [activeTab, currentProjectId, timelineRefreshKey]);

  function cancelEditing() {
    if (!currentProject) {
      return;
    }

    setForm(
      createProjectForm(
        currentProject
      )
    );

    setEditing(false);
    setFeedback(null);
  }

  async function saveProject() {
    if (!currentProject || saving) {
      return;
    }

    const title = form.title.trim();

    if (!title) {
      setFeedback({
        type: "error",
        text:
          "O título do projeto é obrigatório.",
      });

      return;
    }

    const previousProject =
      currentProject;

    setSaving(true);
    setFeedback(null);

    try {
      const response = await fetch(
        "/api/projects",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            id: currentProject.id,
            title,
            status: form.status,
            description:
              form.description.trim() ||
              null,
          }),
        }
      );

      const responseData =
        await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.error ??
            "Erro ao salvar projeto."
        );
      }

      const updatedProject:
        ProjectListItem = {
        ...previousProject,
        ...responseData,
        client:
          responseData.client ??
          previousProject.client,
        documents:
          responseData.documents ??
          previousProject.documents,
        financial:
          responseData.financial ??
          previousProject.financial,
        serviceOrder:
          responseData.serviceOrder ??
          previousProject.serviceOrder,
      };

      setCurrentProject(
        updatedProject
      );

      setForm(
        createProjectForm(
          updatedProject
        )
      );

      setEditing(false);

      onProjectChange?.(
        updatedProject
      );

      setFeedback({
        type: "success",
        text:
          "Projeto atualizado com sucesso.",
      });
    } catch (error) {
      setCurrentProject(
        previousProject
      );

      setFeedback({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Não foi possível salvar o projeto.",
      });
    } finally {
      setSaving(false);
    }
  }

  if (!currentProject) {
    return null;
  }

  const location = [
    currentProject.client.city,
    currentProject.client.state,
  ]
    .filter(Boolean)
    .join(" - ");

  return (
    <Drawer
      open={open}
      onClose={onClose}
      eyebrow="Gestão de projetos"
      title={currentProject.title}
      description={`${currentProject.client.name}${location ? ` · ${location}` : ""}`}
      maxWidthClassName="max-w-6xl"
    >

              {feedback && (
        <div className="px-4 pt-5 sm:px-6 lg:px-8">
          <div
            className={`flex items-center justify-between gap-4 rounded-2xl border p-4 ${
              feedback.type ===
              "success"
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                : "border-red-500/20 bg-red-500/10 text-red-300"
            }`}
          >
            <div className="flex items-center gap-3">
              {feedback.type ===
              "success" ? (
                <CheckCircle2
                  size={18}
                />
              ) : (
                <X size={18} />
              )}

              <p className="text-sm font-semibold">
                {feedback.text}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setFeedback(null)
              }
              className="rounded-lg p-1 transition hover:bg-black/10"
              aria-label="Fechar mensagem"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
      <section className="border-b border-white/[0.07] bg-gradient-to-b from-orange-500/[0.04] to-transparent px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Visão geral
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              Documentação, execução e recebimentos em um só lugar.
            </p>
          </div>

          <span
            className={`rounded-full border px-3 py-1.5 text-xs font-bold ${getStatusStyle(
              currentProject.status
            )}`}
          >
            {getStatusLabel(currentProject.status)}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Status da obra"
          value={getStatusLabel(
            currentProject.status
          )}
          highlight
        />

        <SummaryProgressCard
          completed={
            currentProject
              .checklistProgress
              ?.completed ?? 0
          }
          total={
            currentProject
              .checklistProgress?.total ??
            11
          }
          percentage={
            currentProject
              .checklistProgress
              ?.percentage ?? 0
          }
        />

        <SummaryCard
          label="Documentos"
          value={String(
            currentProject.documents.length
          )}
        />

        <SummaryFinancialCard
          saleValue={
            currentProject.financial
              ?.saleValue ?? 0
          }
          receivedValue={
            currentProject.financial
              ?.receivedValue ?? 0
          }
        />
        </div>
      </section>

      <nav className="sticky top-[113px] z-20 overflow-x-auto border-b border-white/[0.07] bg-zinc-950/95 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
        <div className="flex min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.name}
                type="button"
                onClick={() =>
                  setActiveTab(tab.name)
                }
                className={`flex items-center gap-2 border-b-2 px-5 py-4 text-sm font-semibold transition ${
                  activeTab === tab.name
                    ? "border-orange-500 text-orange-400"
                    : "border-transparent text-zinc-500 hover:text-white"
                }`}
              >
                <Icon size={16} />

                {tab.name}

                {tab.name === "Documentos" && (
                  <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] text-zinc-400">
                    {currentProject.documents.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <main
        key={activeTab}
        className="animate-in fade-in slide-in-from-bottom-2 p-4 duration-300 sm:p-6 lg:p-8"
      >
                      {activeTab === "Resumo" && (
          <ProjectSummaryTab
            project={currentProject}
            location={location}
            editing={editing}
            saving={saving}
            form={form}
            onFormChange={setForm}
            onStartEditing={() => {
              setEditing(true);
              setFeedback(null);
            }}
            onCancelEditing={
              cancelEditing
            }
            onSave={saveProject}
          />
        )}

                {activeTab === "Documentos" && (
          <ProjectDocumentsTab
            projectId={currentProject.id}
            documents={currentProject.documents}
            onDocumentsChange={(documents) => {
              const updatedProject = {
                ...currentProject,
                documents,
              };

              setCurrentProject(updatedProject);
              onProjectChange?.(updatedProject);
            }}
          />
        )}

                {activeTab === "Financeiro" && (
          <ProjectFinancialTab
            project={currentProject}
          />
        )}

                        {activeTab ===
          "Ordem de Serviço" && (
          <ProjectServiceOrderTab
            project={currentProject}
            onProjectChange={(
              updatedProject
            ) => {
              setCurrentProject(
                updatedProject
              );

              setForm(
                createProjectForm(
                  updatedProject
                )
              );

              onProjectChange?.(
                updatedProject
              );
            }}
          />
        )}

        {activeTab === "Histórico" && (
          <ProjectHistoryTab
            events={timeline}
            loading={timelineLoading}
            error={timelineError}
            onRetry={() =>
              setTimelineRefreshKey((current) => current + 1)
            }
          />
        )}
      </main>
    </Drawer>
  );
}

type SummaryCardProps = {
  label: string;
  value: string;
  detail?: string;
  highlight?: boolean;
};

function SummaryCard({
  label,
  value,
  detail,
  highlight = false,
}: SummaryCardProps) {
  return (
    <div
      className={`rounded-2xl border p-4 transition duration-200 hover:-translate-y-0.5 ${
        highlight
          ? "border-orange-500/20 bg-orange-500/[0.06]"
          : "border-white/[0.06] bg-zinc-900/70"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </p>

      <p
        className={`mt-2 truncate text-xl font-black ${
          highlight
            ? "text-orange-400"
            : "text-white"
        }`}
      >
        {value}
      </p>

      {detail && (
        <p className="mt-1 text-xs text-zinc-600">
          {detail}
        </p>
      )}
    </div>
  );
}


function SummaryProgressCard({
  completed,
  total,
  percentage,
}: {
  completed: number;
  total: number;
  percentage: number;
}) {
  const safePercentage = clampPercentage(percentage);

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/70 p-4 transition duration-200 hover:-translate-y-0.5">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Progresso da obra
      </p>

      <div className="mt-3 flex items-end justify-between">
        <span className="text-2xl font-black text-orange-400">{safePercentage}%</span>
        <span className="text-xs text-zinc-500">{completed}/{total}</span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-800">
        <div className="h-full rounded-full bg-orange-500 transition-all duration-500" style={{ width: `${safePercentage}%` }} />
      </div>
    </div>
  );
}

function SummaryFinancialCard({
  saleValue,
  receivedValue,
}: {
  saleValue: number;
  receivedValue: number;
}) {
  const percentage =
    saleValue === 0 ? 0 : Math.round((receivedValue / saleValue) * 100);
  const safePercentage = clampPercentage(percentage);

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/70 p-4 transition duration-200 hover:-translate-y-0.5">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Financeiro
      </p>

      <div className="mt-3 flex items-end justify-between">
        <span className="text-2xl font-black text-emerald-400">{safePercentage}%</span>
        <span className="text-xs text-zinc-500">{formatCurrency(receivedValue)}</span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-800">
        <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${safePercentage}%` }} />
      </div>

      <p className="mt-2 text-xs text-zinc-500">
        de {formatCurrency(saleValue)}
      </p>
    </div>
  );
}

type ProjectSummaryTabProps = {
  project: ProjectListItem;
  location: string;

  editing: boolean;
  saving: boolean;

  form: ProjectFormData;

  onFormChange: (
    form: ProjectFormData
  ) => void;

  onStartEditing: () => void;
  onCancelEditing: () => void;
  onSave: () => void;
};

function ProjectSummaryTab({
  project,
  location,
  editing,
  saving,
  form,
  onFormChange,
  onStartEditing,
  onCancelEditing,
  onSave,
}: ProjectSummaryTabProps) {
  if (editing) {
    return (
      <section className="rounded-3xl border border-white/[0.07] bg-zinc-900/60 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">
          Cadastro
        </p>

        <h2 className="mt-2 text-xl font-black text-white">
          Editar projeto
        </h2>

        <p className="mt-2 text-sm text-zinc-500">
          Atualize as informações principais do projeto.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="project-title"
              className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500"
            >
              Título
            </label>

            <input
              id="project-title"
              type="text"
              value={form.title}
              onChange={(event) =>
                onFormChange({
                  ...form,
                  title:
                    event.target.value,
                })
              }
              className="h-12 w-full rounded-xl border border-white/[0.08] bg-zinc-950 px-4 text-sm text-white outline-none transition focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5"
            />
          </div>

          <div>
            <label
              htmlFor="project-status"
              className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500"
            >
              Status
            </label>

            <select
              id="project-status"
              value={form.status}
              onChange={(event) =>
                onFormChange({
                  ...form,
                  status:
                    event.target.value,
                })
              }
              className="h-12 w-full rounded-xl border border-white/[0.08] bg-zinc-950 px-4 text-sm text-white outline-none transition focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5"
            >
              {PROJECT_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5">
          <label
            htmlFor="project-description"
            className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500"
          >
            Descrição
          </label>

          <textarea
            id="project-description"
            value={form.description}
            onChange={(event) =>
              onFormChange({
                ...form,
                description:
                  event.target.value,
              })
            }
            rows={7}
            className="w-full resize-y rounded-xl border border-white/[0.08] bg-zinc-950 p-4 text-sm leading-6 text-white outline-none transition focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5"
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancelEditing}
            disabled={saving}
            className="rounded-xl border border-white/[0.08] bg-zinc-950 px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-900 disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-400 disabled:opacity-60"
          >
            {saving ? (
              <LoaderCircle
                size={17}
                className="animate-spin"
              />
            ) : (
              <Save size={17} />
            )}

            {saving
              ? "Salvando..."
              : "Salvar projeto"}
          </button>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-white">
            Dados do projeto
          </h2>

          <button
            type="button"
            onClick={onStartEditing}
            className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:border-orange-500/30 hover:bg-orange-500/10 hover:text-orange-400"
          >
            <Pencil size={16} />

            Editar projeto
          </button>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <InfoCard
            icon={FolderKanban}
            label="Projeto"
            value={project.title}
          />

          <InfoCard
            icon={CheckCircle2}
            label="Status"
            value={getStatusLabel(
              project.status
            )}
          />

          <InfoCard
            icon={CalendarDays}
            label="Criado em"
            value={formatDate(
              project.createdAt
            )}
          />

          <InfoCard
            icon={CalendarDays}
            label="Última atualização"
            value={formatDate(
              project.updatedAt
            )}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-white">
          Cliente
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <InfoCard
            icon={Building2}
            label="Cliente"
            value={project.client.name}
          />

          <InfoCard
            icon={MapPin}
            label="Localização"
            value={location || "-"}
          />

          <InfoCard
            icon={Phone}
            label="Telefone"
            value={
              project.client.phone ?? "-"
            }
          />

          <InfoCard
            icon={Mail}
            label="E-mail"
            value={
              project.client.email ?? "-"
            }
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-white">
          Descrição
        </h2>

        <div className="mt-4 rounded-2xl border border-white/[0.07] bg-zinc-900/60 p-5">
          <p className="whitespace-pre-wrap text-sm leading-7 text-zinc-300">
            {project.description ??
              "Nenhuma descrição cadastrada."}
          </p>
        </div>
      </section>
    </div>
  );
}

type ProjectFinancialTabProps = {
  project: ProjectListItem;
};

function ProjectFinancialTab({
  project,
}: ProjectFinancialTabProps) {
  const financial = project.financial;

  if (!financial) {
    return (
      <EmptyTab
        icon={CircleDollarSign}
        title="Financeiro não vinculado"
        description="O registro financeiro deste projeto ainda não foi criado."
      />
    );
  }

  const pending =
    financial.saleValue -
    financial.receivedValue;

  const result =
    financial.saleValue -
    financial.costValue;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <FinancialCard
          label="Valor da venda"
          value={formatCurrency(
            financial.saleValue
          )}
          highlight
        />

        <FinancialCard
          label="Valor recebido"
          value={formatCurrency(
            financial.receivedValue
          )}
        />

        <FinancialCard
          label="Saldo pendente"
          value={formatCurrency(pending)}
        />

        <FinancialCard
          label="Resultado bruto"
          value={formatCurrency(result)}
        />
      </section>

      <section className="rounded-2xl border border-white/[0.07] bg-zinc-900/60 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Status financeiro
        </p>

        <p className="mt-2 text-xl font-black text-orange-400">
          {financial.status}
        </p>

        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-zinc-400">
          {financial.notes ??
            "Nenhuma observação financeira cadastrada."}
        </p>
      </section>
    </div>
  );
}

type FinancialCardProps = {
  label: string;
  value: string;
  highlight?: boolean;
};

function FinancialCard({
  label,
  value,
  highlight = false,
}: FinancialCardProps) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        highlight
          ? "border-orange-500/20 bg-orange-500/[0.05]"
          : "border-white/[0.07] bg-zinc-900/60"
      }`}
    >
      <CircleDollarSign
        size={20}
        className={
          highlight
            ? "text-orange-400"
            : "text-zinc-500"
        }
      />

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </p>

      <p
        className={`mt-2 text-xl font-black ${
          highlight
            ? "text-orange-400"
            : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}





type ProjectHistoryTabProps = {
  events: ProjectTimelineItem[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
};

function ProjectHistoryTab({
  events,
  loading,
  error,
  onRetry,
}: ProjectHistoryTabProps) {
  if (loading) {
    return (
      <div className="flex min-h-56 items-center justify-center rounded-2xl border border-white/[0.07] bg-zinc-900/50">
        <div className="text-center">
          <LoaderCircle className="mx-auto animate-spin text-orange-400" />
          <p className="mt-3 text-sm text-zinc-500">
            Carregando histórico...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-8 text-center">
        <History className="mx-auto text-red-400" size={24} />
        <h3 className="mt-4 font-bold text-white">
          Não foi possível carregar o histórico
        </h3>
        <p className="mt-2 text-sm text-red-200/70">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/20"
        >
          <RefreshCw size={16} />
          Tentar novamente
        </button>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <EmptyTab
        icon={History}
        title="Nenhum evento registrado"
        description="As próximas alterações deste projeto aparecerão aqui."
      />
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">
            Linha do tempo
          </p>
          <h2 className="mt-2 text-xl font-black text-white">
            Histórico do projeto
          </h2>
        </div>
        <span className="rounded-full border border-white/[0.08] bg-zinc-900 px-3 py-1 text-xs font-semibold text-zinc-400">
          {events.length} evento(s)
        </span>
      </div>

      <div className="relative space-y-4 before:absolute before:bottom-5 before:left-5 before:top-5 before:w-px before:bg-white/[0.08]">
        {events.map((event) => (
          <HistoryItem key={`${event.source}-${event.id}`} event={event} />
        ))}
      </div>
    </div>
  );
}

type InfoCardProps = {
  icon: typeof Building2;
  label: string;
  value: string;
};

function InfoCard({
  icon: Icon,
  label,
  value,
}: InfoCardProps) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-zinc-900/60 p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-zinc-500">
          <Icon size={18} />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {label}
          </p>

          <p className="mt-2 truncate font-bold text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

type EmptyTabProps = {
  icon: typeof FileText;
  title: string;
  description: string;
};

function EmptyTab({
  icon: Icon,
  title,
  description,
}: EmptyTabProps) {
  return (
    <div className="rounded-2xl border border-dashed border-white/[0.08] bg-zinc-900/40 p-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-950 text-zinc-500">
        <Icon size={21} />
      </div>

      <h3 className="mt-4 font-bold text-white">
        {title}
      </h3>

      <p className="mt-2 text-sm text-zinc-500">
        {description}
      </p>
    </div>
  );
}

type HistoryItemProps = {
  event: ProjectTimelineItem;
};

const TIMELINE_PRESENTATION: Record<
  ProjectTimelineType,
  { icon: typeof History; className: string; label: string }
> = {
  PROJECT_CREATED: {
    icon: FolderKanban,
    className: "bg-sky-500/10 text-sky-400",
    label: "Projeto",
  },
  PROJECT_UPDATED: {
    icon: Pencil,
    className: "bg-orange-500/10 text-orange-400",
    label: "Projeto",
  },
  PROJECT_STATUS_CHANGED: {
    icon: CheckCircle2,
    className: "bg-emerald-500/10 text-emerald-400",
    label: "Status",
  },
  DOCUMENT_UPLOADED: {
    icon: FileText,
    className: "bg-violet-500/10 text-violet-400",
    label: "Documento",
  },
  DOCUMENT_DELETED: {
    icon: Trash2,
    className: "bg-red-500/10 text-red-400",
    label: "Documento",
  },
  DOCUMENT_FAVORITED: {
    icon: Star,
    className: "bg-amber-500/10 text-amber-400",
    label: "Documento",
  },
  DOCUMENT_UNFAVORITED: {
    icon: Star,
    className: "bg-zinc-500/10 text-zinc-400",
    label: "Documento",
  },
  FINANCIAL_CREATED: {
    icon: CircleDollarSign,
    className: "bg-emerald-500/10 text-emerald-400",
    label: "Financeiro",
  },
  FINANCIAL_UPDATED: {
    icon: CircleDollarSign,
    className: "bg-emerald-500/10 text-emerald-400",
    label: "Financeiro",
  },
  SERVICE_ORDER_CREATED: {
    icon: Wrench,
    className: "bg-orange-500/10 text-orange-400",
    label: "Ordem de Serviço",
  },
  SERVICE_ORDER_UPDATED: {
    icon: Wrench,
    className: "bg-orange-500/10 text-orange-400",
    label: "Ordem de Serviço",
  },
  CHECKLIST_UPDATED: {
    icon: ClipboardCheck,
    className: "bg-amber-500/10 text-amber-400",
    label: "Checklist",
  },
  PHOTO_UPLOADED: {
    icon: Camera,
    className: "bg-cyan-500/10 text-cyan-400",
    label: "Foto",
  },
  PHOTO_DELETED: {
    icon: Trash2,
    className: "bg-red-500/10 text-red-400",
    label: "Foto",
  },
  PDF_GENERATED: {
    icon: FileText,
    className: "bg-zinc-500/10 text-zinc-400",
    label: "PDF",
  },
};

function HistoryItem({ event }: HistoryItemProps) {
  const presentation = TIMELINE_PRESENTATION[event.type];
  const Icon = presentation?.icon ?? History;

  return (
    <article className="relative flex gap-4 rounded-2xl border border-white/[0.07] bg-zinc-900/60 p-5 transition hover:border-white/[0.12] hover:bg-zinc-900">
      <div
        className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          presentation?.className ?? "bg-zinc-950 text-zinc-500"
        }`}
      >
        <Icon size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-600">
              {presentation?.label ?? "Evento"}
            </span>
            <h3 className="mt-1 font-bold text-white">{event.title}</h3>
          </div>
          <time className="shrink-0 text-xs text-zinc-600">
            {formatDate(event.createdAt)}
          </time>
        </div>

        <p className="mt-1 text-sm text-zinc-400">
          {event.description}
        </p>
      </div>
    </article>
  );
}

function clampPercentage(value: number) {
  return Math.min(100, Math.max(0, value));
}
