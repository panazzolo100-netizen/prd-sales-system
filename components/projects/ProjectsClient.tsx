"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  FolderKanban,
  RotateCcw,
  Search,
  X,
} from "lucide-react";

import { ProjectDetailsDrawer } from "@/components/projects/ProjectDetailsDrawer";
import { EntityDeleteButton } from "@/components/ui/EntityDeleteButton";
import type { ProjectListItem } from "@/types/project";

type ProjectsClientProps = {
  initialProjects: ProjectListItem[];
};

type StatusFilter =
  | "TODOS"
  | "NOVO"
  | "EM_ANDAMENTO"
  | "CONCLUIDO"
  | "CANCELADO";

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

        return matchesSearch && matchesStatus;
      }
    );
  }, [
    projects,
    searchTerm,
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

    return {
      total,
      inProgress,
      completed,
    };
  }, [projects]);

  const hasActiveFilters =
    searchTerm.trim().length > 0 ||
    statusFilter !== "TODOS";

    function clearFilters() {
    setSearchTerm("");
    setStatusFilter("TODOS");
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

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
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

        </div>
      </section>

      <section className="rounded-3xl border border-white/[0.07] bg-zinc-900/70 p-4">
        <div className="grid gap-3 md:grid-cols-[minmax(300px,1fr)_220px_auto]">
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
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filteredProjects.map(
              (project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onOpen={
                    setSelectedProject
                  }
                  onDeleted={(projectId) => {
                    setProjects((current) => current.filter((item) => item.id !== projectId));
                    if (selectedProject?.id === projectId) setSelectedProject(null);
                  }}
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
  onOpen: (project: ProjectListItem) => void;
  onDeleted: (projectId: string) => void;
};


function ProjectCard({
  project,
  onOpen,
  onDeleted,
}: ProjectCardProps) {
  const status = getStatusStyle(
    project.status
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
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onOpen(project);
      }}
      role="button"
      tabIndex={0}
      className="group relative cursor-pointer rounded-2xl border border-white/[0.07] bg-zinc-950 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-500/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-bold text-white">
            {project.title}
          </h2>

          <p className="mt-1 truncate text-sm text-zinc-400">
            {project.client.name}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      {project.description && (
        <p className="mt-3 line-clamp-2 text-sm leading-5 text-zinc-500">
          {project.description}
        </p>
      )}

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500">{progress.completed} de {progress.total} etapas</span>
          <span className="font-bold text-orange-400">
            {progress.percentage}%
          </span>
        </div>

        <div className="mt-2 h-1 overflow-hidden rounded-full bg-zinc-800">
          <div
            className="h-full rounded-full bg-orange-500 transition-all duration-500"
            style={{
              width: `${progress.percentage}%`,
            }}
          />
        </div>
      </div>
      <div className="mt-3 flex justify-end" onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
        <EntityDeleteButton
          endpoint={`/api/projects?id=${encodeURIComponent(project.id)}`}
          entityName={`${project.title} — ${project.client.name}`}
          buttonLabel="Excluir projeto"
          consequence="Etapas, eventos e documentos próprios serão removidos, inclusive seus arquivos no Storage. Cliente e lead serão preservados. Ordem de Serviço ou financeiro bloqueiam a exclusão."
          successMessage="Projeto excluído com sucesso."
          onDeleted={() => onDeleted(project.id)}
          iconOnly
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-red-500/10 hover:text-red-400"
        />
      </div>
    </article>
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
