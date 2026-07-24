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
import {
  CardProgress,
  CompactMetricCard,
  OperationCardGrid,
  OperationEmptyState,
  OperationPageHeader,
} from "@/components/operations/OperationListing";
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
type SortFilter = "recentes" | "titulo";

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
  const [sortFilter, setSortFilter] = useState<SortFilter>("recentes");

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
    ).sort((a, b) =>
      sortFilter === "titulo"
        ? a.title.localeCompare(b.title, "pt-BR")
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [
    projects,
    searchTerm,
    sortFilter,
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
    statusFilter !== "TODOS" ||
    sortFilter !== "recentes";

    function clearFilters() {
    setSearchTerm("");
    setStatusFilter("TODOS");
    setSortFilter("recentes");
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
      <div className="space-y-5">
        <OperationPageHeader
          breadcrumb="Operação / Projetos"
          title="Projetos"
          description="Acompanhe a evolução técnica e operacional dos projetos."
        />

        <section className="grid gap-3 sm:grid-cols-3">
          <CompactMetricCard icon={FolderKanban} label="Total de projetos" value={metrics.total} />
          <CompactMetricCard icon={Clock3} label="Em andamento" value={metrics.inProgress} tone="orange" />
          <CompactMetricCard icon={CheckCircle2} label="Concluídos" value={metrics.completed} tone="green" />
        </section>

      <section className="rounded-2xl border border-white/[0.07] bg-zinc-900/60 p-2.5">
        <div className="grid gap-2 md:grid-cols-[minmax(300px,1fr)_190px_170px_auto]">
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600"
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
              className="h-10 w-full rounded-xl border border-white/[0.07] bg-zinc-950 pl-10 pr-10 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-orange-500/40"
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
            className="h-10 rounded-xl border border-white/[0.07] bg-zinc-950 px-3 text-sm text-white outline-none transition focus:border-orange-500/40"
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
            value={sortFilter}
            onChange={(event) => setSortFilter(event.target.value as SortFilter)}
            className="h-10 rounded-xl border border-white/[0.07] bg-zinc-950 px-3 text-sm text-white outline-none transition focus:border-orange-500/40"
          >
            <option value="recentes">Mais recentes</option>
            <option value="titulo">Título A–Z</option>
          </select>

          <button
            type="button"
            onClick={clearFilters}
            disabled={!hasActiveFilters}
            className="flex h-10 items-center justify-center gap-2 rounded-xl px-3 text-xs font-semibold text-zinc-500 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RotateCcw size={16} />

            Limpar
          </button>
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] px-1 pt-2">
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
          <OperationEmptyState
            icon={FolderKanban}
            title={hasActiveFilters ? "Nenhum projeto encontrado" : "Nenhum projeto cadastrado"}
            description={hasActiveFilters ? "Ajuste ou limpe os filtros para continuar." : "Os projetos aparecerão aqui quando forem criados."}
          />
        ) : (
          <OperationCardGrid>
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
          </OperationCardGrid>
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
      className={`group relative min-h-[176px] cursor-pointer overflow-visible rounded-2xl border border-white/[0.08] bg-zinc-900 p-4 transition-all duration-200 before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:rounded-t-2xl hover:-translate-y-0.5 hover:border-orange-500/30 hover:shadow-lg hover:shadow-black/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 md:p-5 ${normalizeStatus(project.status) === "CONCLUIDO" ? "before:bg-emerald-500" : normalizeStatus(project.status) === "CANCELADO" ? "before:bg-red-500" : "before:bg-orange-500"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 title={project.title} className="truncate text-base font-bold text-white">
            {project.title}
          </h2>

          <p title={project.client.name} className="mt-1 truncate text-sm text-zinc-400">
            {project.client.name}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1" onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
          <span
            className={`pointer-events-none rounded-full border px-2 py-0.5 text-[10px] font-semibold ${status.className}`}
          >
            {status.label}
          </span>
          <EntityDeleteButton
            endpoint={`/api/projects?id=${encodeURIComponent(project.id)}`}
            entityName={`${project.title} — ${project.client.name}`}
            buttonLabel="Excluir projeto"
            consequence="Etapas, eventos e documentos próprios serão removidos, inclusive seus arquivos no Storage. Cliente e lead serão preservados. Ordem de Serviço ou financeiro bloqueiam a exclusão."
            successMessage="Projeto excluído com sucesso."
            onDeleted={() => onDeleted(project.id)}
            menuTrigger
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-white/5 hover:text-zinc-300"
          />
        </div>
      </div>

      {project.description && (
        <p title={project.description} className="mt-4 line-clamp-2 text-sm leading-5 text-zinc-500">
          {project.description}
        </p>
      )}

      <div className="absolute inset-x-4 bottom-4 md:inset-x-5">
        <CardProgress completed={progress.completed} total={progress.total} percentage={progress.percentage} />
      </div>
    </article>
  );
}
