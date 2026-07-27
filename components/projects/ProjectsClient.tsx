"use client";

import { useState } from "react";
import { KanbanBoard, type KanbanColumn } from "@/components/kanban/KanbanBoard";
import { ProjectDetailsDrawer } from "@/components/projects/ProjectDetailsDrawer";
import type { ProjectListItem } from "@/types/project";

const columns: KanbanColumn[] = [
  { id: "planning", label: "Planejamento", statuses: ["NOVO"], moveStatus: "NOVO", tone: "sky" },
  { id: "doing", label: "Em andamento", statuses: ["EM_ANDAMENTO"], moveStatus: "EM_ANDAMENTO", tone: "orange" },
  { id: "paused", label: "Pausado", statuses: ["AGUARDANDO"], moveStatus: "AGUARDANDO", tone: "amber" },
  { id: "done", label: "Concluído", statuses: ["CONCLUIDO"], moveStatus: "CONCLUIDO", tone: "green" },
  { id: "archive", label: "Cancelados", statuses: ["CANCELADO"], tone: "red" },
];

export function ProjectsClient({ initialProjects }: { initialProjects: ProjectListItem[] }) {
  const [projects, setProjects] = useState(initialProjects);
  const [selected, setSelected] = useState<ProjectListItem | null>(null);
  return <>
    <KanbanBoard
      eyebrow="Operação / Projetos"
      title="Projetos"
      description="Planejamento e execução em um fluxo operacional único."
      columns={columns}
      items={projects.map((project) => ({
        id: project.id, status: project.status, title: project.title, subtitle: project.client.name,
        meta: project.serviceType.replaceAll("_", " "), detail: project.description,
        progress: project.checklistProgress, updatedAt: project.updatedAt,
        overdue: Boolean(project.serviceOrder?.scheduledDate && new Date(project.serviceOrder.scheduledDate) < new Date() && project.status !== "CONCLUIDO"),
        movable: project.status !== "CANCELADO",
      }))}
      statusEndpoint={(id) => `/api/projects/${id}/status`}
      onStatusChanged={(id, status) => setProjects((all) => all.map((project) => project.id === id ? { ...project, status } : project))}
      onOpen={(id) => setSelected(projects.find((project) => project.id === id) ?? null)}
      metric={(items) => [
        { label: "Total", value: items.length },
        { label: "Em andamento", value: items.filter((item) => item.status === "EM_ANDAMENTO").length },
        { label: "Atrasados", value: items.filter((item) => item.overdue).length },
        { label: "Concluídos", value: items.filter((item) => item.status === "CONCLUIDO").length },
      ]}
    />
    <ProjectDetailsDrawer project={selected} open={selected !== null} onClose={() => setSelected(null)} onProjectChange={(project) => { setProjects((all) => all.map((item) => item.id === project.id ? project : item)); setSelected(project); }} onDeleted={(id) => { setProjects((all) => all.filter((item) => item.id !== id)); setSelected(null); }} />
  </>;
}
