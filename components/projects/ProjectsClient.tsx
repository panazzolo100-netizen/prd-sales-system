"use client";

import { useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileText,
  FolderKanban,
  MapPin,
  RotateCcw,
  Search,
  UserRound,
  Wrench,
  X,
} from "lucide-react";

import { ProjectDetailsDrawer } from "@/components/projects/ProjectDetailsDrawer";
import type { ProjectListItem } from "@/types/project";
import { formatPhone } from "@/utils/formatters";

type ProjectsClientProps = {
  initialProjects: ProjectListItem[];
};

type StatusFilter =
  | "TODOS"
  | "NOVO"
  | "EM_ANDAMENTO"
  | "CONCLUIDO"
  | "CANCELADO";

type ServiceOrderFilter =
  | "TODOS"
  | "COM_OS"
  | "SEM_OS";

const statusOptions: {
  value: StatusFilter;
  label: string;
}[] = [
  {
    value: "TODOS",
    label: "Todos os status",
  },
  {
    value: "NOVO",
    label: "Novo",
  },
  {
    value: "EM_ANDAMENTO",
    label: "Em andamento",
  },
  {
    value: "CONCLUIDO",
    label: "Concluído",
  },
  {
    value: "CANCELADO",
    label: "Cancelado",
  },
];

function normalizeStatus(status: string) {
  return status
    .trim()
    .toLocaleUpperCase("pt-BR")
    .replaceAll(" ", "_");
}

function getStatusStyle(status: string) {
  const normalized =
    normalizeStatus(status);

  switch (normalized) {
    case "CONCLUIDO":
    case "CONCLUÍDO":
      return {
        label: "Concluído",
        className:
          "border-emerald-500/25 bg-emerald-500/10 text-emerald-400",
      };

    case "EM_ANDAMENTO":
      return {
        label: "Em andamento",
        className:
          "border-orange-500/25 bg-orange-500/10 text-orange-400",
      };

    case "CANCELADO":
      return {
        label: "Cancelado",
        className:
          "border-red-500/25 bg-red-500/10 text-red-400",
      };

    default:
      return {
        label: "Novo",
        className:
          "border-sky-500/25 bg-sky-500/10 text-sky-400",
      };
  }
}

function formatDate(
  value: Date | string
) {
  return new Intl.DateTimeFormat(
    "pt-BR"
  ).format(new Date(value));
}

function daysSince(
  value: Date | string
) {
  const date = new Date(value);

  const difference =
    Date.now() - date.getTime();

  return Math.max(
    0,
    Math.floor(
      difference /
        (1000 * 60 * 60 * 24)
    )
  );
}

function formatDays(days: number) {
  if (days === 0) {
    return "Hoje";
  }

  if (days === 1) {
    return "Há 1 dia";
  }

  return `Há ${days} dias`;
}

export function ProjectsClient({
  initialProjects,
}: ProjectsClientProps) {
  const [projects, setProjects] =
    useState<ProjectListItem[]>(
      initialProjects
    );

  const [
    selectedProject,
    setSelectedProject,
  ] =
    useState<ProjectListItem | null>(
      null
    );

  const [searchTerm, setSearchTerm] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("TODOS");

  const [
    serviceOrderFilter,
    setServiceOrderFilter,
  ] =
    useState<ServiceOrderFilter>("TODOS");

  const filteredProjects = useMemo(() => {
    const normalizedSearch =
      searchTerm
        .trim()
        .toLocaleLowerCase("pt-BR");

    return projects.filter(
      (project) => {
        const matchesSearch =
          normalizedSearch.length === 0 ||
          project.title
            .toLocaleLowerCase("pt-BR")
            .includes(normalizedSearch) ||
          project.client.name
            .toLocaleLowerCase("pt-BR")
            .includes(normalizedSearch) ||
          (project.description ?? "")
            .toLocaleLowerCase("pt-BR")
            .includes(normalizedSearch);

        const normalizedStatus =
          normalizeStatus(project.status);

        const matchesStatus =
          statusFilter === "TODOS" ||
          normalizedStatus === statusFilter;

        const hasServiceOrder =
          project.serviceOrder !== null;

        const matchesServiceOrder =
          serviceOrderFilter === "TODOS" ||
          (serviceOrderFilter ===
            "COM_OS" &&
            hasServiceOrder) ||
          (serviceOrderFilter ===
            "SEM_OS" &&
            !hasServiceOrder);

        return (
          matchesSearch &&
          matchesStatus &&
          matchesServiceOrder
        );
      }
    );
  }, [
    projects,
    searchTerm,
    serviceOrderFilter,
    statusFilter,
  ]);

  const metrics = useMemo(() => {
    const total =
      projects.length;

    const inProgress =
      projects.filter(
        (project) =>
          normalizeStatus(
            project.status
          ) === "EM_ANDAMENTO"
      ).length;

    const completed =
      projects.filter(
        (project) => {
          const status =
            normalizeStatus(
              project.status
            );

          return (
            status === "CONCLUIDO" ||
            status === "CONCLUÍDO"
          );
        }
      ).length;

    const withServiceOrder =
      projects.filter(
        (project) =>
          project.serviceOrder !== null
      ).length;

    const withFinancial =
      projects.filter(
        (project) =>
          project.financial !== null
      ).length;

    const totalDocuments =
      projects.reduce(
        (totalDocuments, project) =>
          totalDocuments +
          project.documents.length,
        0
      );

    return {
      total,
      inProgress,
      completed,
      withServiceOrder,
      withFinancial,
      totalDocuments,
    };
  }, [projects]);

  const hasActiveFilters =
    searchTerm.trim().length > 0 ||
    statusFilter !== "TODOS" ||
    serviceOrderFilter !== "TODOS";

    function clearFilters() {
    setSearchTerm("");
    setStatusFilter("TODOS");
    setServiceOrderFilter("TODOS");
  }

  function handleProjectChange(
    updatedProject: ProjectListItem
  ) {
    setProjects((currentProjects) =>
      currentProjects.map(
        (currentProject) =>
          currentProject.id ===
          updatedProject.id
            ? updatedProject
            : currentProject
      )
    );

    setSelectedProject(
      updatedProject
    );
  }

  return (
    <>
      <div className="space-y-6">
        <section className="rounded-3xl border border-white/[0.07] bg-zinc-900 p-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-500">
            Operação
          </p>

          <h1 className="mt-2 text-4xl font-black text-white">
            Projetos
          </h1>

          <p className="mt-2 text-zinc-400">
            Gestão técnica e operacional dos projetos da PRD Engenharia.
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <MetricCard
            icon={FolderKanban}
            label="Projetos"
            value={String(metrics.total)}
            description="Total cadastrado"
          />

          <MetricCard
            icon={Clock3}
            label="Em andamento"
            value={String(
              metrics.inProgress
            )}
            description="Execução ativa"
            highlight
          />

          <MetricCard
            icon={CheckCircle2}
            label="Concluídos"
            value={String(
              metrics.completed
            )}
            description="Projetos finalizados"
          />

          <MetricCard
            icon={Wrench}
            label="Com OS"
            value={String(
              metrics.withServiceOrder
            )}
            description="Ordens vinculadas"
          />

          <MetricCard
            icon={CircleDollarSign}
            label="Financeiro"
            value={String(
              metrics.withFinancial
            )}
            description="Registros vinculados"
          />

          <MetricCard
            icon={FileText}
            label="Documentos"
            value={String(
              metrics.totalDocuments
            )}
            description="Arquivos cadastrados"
          />
        </div>
      </section>

      <section className="rounded-3xl border border-white/[0.07] bg-zinc-900/70 p-4">
        <div className="grid gap-3 xl:grid-cols-[minmax(300px,1fr)_220px_220px_auto]">
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
              placeholder="Buscar projeto, cliente ou descrição..."
              className="h-12 w-full rounded-xl border border-white/[0.07] bg-zinc-950 pl-11 pr-10 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5"
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() =>
                  setSearchTerm("")
                }
                className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-white/5 hover:text-white"
                aria-label="Limpar pesquisa"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target
                  .value as StatusFilter
              )
            }
            className="h-12 rounded-xl border border-white/[0.07] bg-zinc-950 px-4 text-sm text-white outline-none transition focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5"
          >
            {statusOptions.map(
              (option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              )
            )}
          </select>

          <select
            value={serviceOrderFilter}
            onChange={(event) =>
              setServiceOrderFilter(
                event.target
                  .value as ServiceOrderFilter
              )
            }
            className="h-12 rounded-xl border border-white/[0.07] bg-zinc-950 px-4 text-sm text-white outline-none transition focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5"
          >
            <option value="TODOS">
              Todas as ordens
            </option>

            <option value="COM_OS">
              Com ordem de serviço
            </option>

            <option value="SEM_OS">
              Sem ordem de serviço
            </option>
          </select>

          <button
            type="button"
            onClick={clearFilters}
            disabled={!hasActiveFilters}
            className="flex h-12 items-center justify-center gap-2 rounded-xl border border-white/[0.07] bg-zinc-950 px-5 text-sm font-semibold text-zinc-300 transition hover:border-orange-500/30 hover:bg-orange-500/10 hover:text-orange-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RotateCcw size={16} />

            Limpar
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
          <p className="text-sm text-zinc-500">
            Exibindo{" "}
            <strong className="text-white">
              {filteredProjects.length}
            </strong>{" "}
            de{" "}
            <strong className="text-white">
              {projects.length}
            </strong>{" "}
            projetos
          </p>

          {hasActiveFilters && (
            <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-400">
              Filtros ativos
            </span>
          )}
        </div>
      </section>

              {filteredProjects.length === 0 ? (
          <EmptyState
            hasFilters={hasActiveFilters}
            onClear={clearFilters}
          />
        ) : (
          <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {filteredProjects.map(
              (project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onOpen={
                    setSelectedProject
                  }
                />
              )
            )}
          </section>
        )}
      </div>

            <ProjectDetailsDrawer
        project={selectedProject}
        open={selectedProject !== null}
        onClose={() =>
          setSelectedProject(null)
        }
        onProjectChange={
          handleProjectChange
        }
        onDeleted={(projectId) => {
          setProjects((current) => current.filter((item) => item.id !== projectId));
          setSelectedProject(null);
        }}
      />
    </>
  );
}


type ProjectCardProps = {
  project: ProjectListItem;

  onOpen: (
    project: ProjectListItem
  ) => void;
};


function ProjectCard({
  project,
  onOpen,
}: ProjectCardProps) {
  const status = getStatusStyle(
    project.status
  );

  const location = [
    project.client.city,
    project.client.state,
  ]
    .filter(Boolean)
    .join(" - ");

  const stoppedDays = daysSince(
    project.updatedAt
  );

  const progress =
    project.checklistProgress ?? {
      total: 11,
      completed: 0,
      percentage: 0,
    };

  return (
    <article
      onClick={() => onOpen(project)}
      className="group cursor-pointer rounded-3xl border border-white/[0.07] bg-zinc-950 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/30 hover:shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-orange-500">
            Projeto
          </p>

          <h2 className="mt-2 truncate text-xl font-bold text-white">
            {project.title}
          </h2>

          <p className="mt-1 truncate text-sm text-zinc-400">
            {project.client.name}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-semibold uppercase tracking-wide text-zinc-500">
            Progresso da obra
          </span>

          <span className="font-bold text-orange-400">
            {progress.percentage}%
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-orange-500 transition-all duration-500"
            style={{
              width: `${progress.percentage}%`,
            }}
          />
        </div>

        <p className="mt-2 text-xs text-zinc-500">
          {progress.completed} de {progress.total} etapas concluídas
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <InfoBox
          label="Documentos"
          value={String(
            project.documents.length
          )}
        />

        <InfoBox
          label="Ordem de serviço"
          value={
            project.serviceOrder
              ? "Criada"
              : "Pendente"
          }
          highlight={
            project.serviceOrder !== null
          }
        />

        <InfoBox
          label="Financeiro"
          value={
            project.financial
              ? "Vinculado"
              : "Pendente"
          }
        />

        <InfoBox
          label="Atualização"
          value={formatDays(
            stoppedDays
          )}
        />
      </div>

      {project.description && (
        <p className="mt-5 line-clamp-2 text-sm leading-6 text-zinc-500">
          {project.description}
        </p>
      )}

      <div className="mt-5 space-y-3 border-t border-white/[0.06] pt-4">
        <ContactLine
          icon={Building2}
          value={project.client.name}
        />

        <ContactLine
          icon={MapPin}
          value={
            location ||
            "Localização não informada"
          }
        />

        <ContactLine
          icon={UserRound}
          value={
            (project.client.phone ? formatPhone(project.client.phone) : null) ??
            project.client.email ??
            "Contato não informado"
          }
        />
      </div>

      <p className="mt-4 text-xs text-zinc-600">
        Criado em{" "}
        {formatDate(
          project.createdAt
        )}
      </p>
    </article>
  );
}

type ContactLineProps = {
  icon: typeof Building2;
  value: string;
};

function ContactLine({
  icon: Icon,
  value,
}: ContactLineProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-zinc-400">
      <Icon
        size={15}
        className="shrink-0 text-zinc-600"
      />

      <span className="truncate">
        {value}
      </span>
    </div>
  );
}

type InfoBoxProps = {
  label: string;
  value: string;
  highlight?: boolean;
};

function InfoBox({
  label,
  value,
  highlight = false,
}: InfoBoxProps) {
  return (
    <div
      className={`rounded-xl border p-3 ${
        highlight
          ? "border-orange-500/15 bg-orange-500/[0.05]"
          : "border-white/[0.06] bg-zinc-900/70"
      }`}
    >
      <p className="text-[11px] uppercase tracking-wide text-zinc-600">
        {label}
      </p>

      <p
        className={`mt-1 truncate text-sm font-bold ${
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

type MetricCardProps = {
  icon: typeof FolderKanban;
  label: string;
  value: string;
  description: string;
  highlight?: boolean;
};

function MetricCard({
  icon: Icon,
  label,
  value,
  description,
  highlight = false,
}: MetricCardProps) {
  return (
    <div
      className={`rounded-2xl border p-4 transition hover:-translate-y-0.5 ${
        highlight
          ? "border-orange-500/20 bg-orange-500/[0.06]"
          : "border-white/[0.07] bg-zinc-950"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          {label}
        </p>

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${
            highlight
              ? "bg-orange-500/15 text-orange-400"
              : "bg-zinc-900 text-zinc-500"
          }`}
        >
          <Icon size={17} />
        </div>
      </div>

      <p
        className={`mt-3 truncate text-2xl font-black ${
          highlight
            ? "text-orange-400"
            : "text-white"
        }`}
      >
        {value}
      </p>

      <p className="mt-1 text-xs text-zinc-600">
        {description}
      </p>
    </div>
  );
}

type EmptyStateProps = {
  hasFilters: boolean;
  onClear: () => void;
};

function EmptyState({
  hasFilters,
  onClear,
}: EmptyStateProps) {
  return (
    <section className="rounded-3xl border border-dashed border-white/[0.09] bg-zinc-950 p-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.07] bg-zinc-900 text-zinc-500">
        <FolderKanban size={24} />
      </div>

      <h2 className="mt-5 text-xl font-bold text-white">
        {hasFilters
          ? "Nenhum projeto encontrado"
          : "Nenhum projeto cadastrado"}
      </h2>

      <p className="mt-2 text-sm text-zinc-500">
        {hasFilters
          ? "Altere a pesquisa ou limpe os filtros."
          : "Os projetos criados a partir dos clientes aparecerão aqui."}
      </p>

      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="mt-5 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-400"
        >
          Limpar filtros
        </button>
      )}
    </section>
  );
}
