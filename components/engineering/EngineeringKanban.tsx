"use client";

import { KanbanBoard, type KanbanColumn } from "@/components/kanban/KanbanBoard";

type Project = {
  id: string; title: string; status: string; serviceType: string; description: string | null; updatedAt: Date | string;
  client: { name: string }; stages: { completed: boolean; dueDate: Date | string | null; responsible: string | null }[];
};

const columns: KanbanColumn[] = [
  { id: "new", label: "Novo / Aberto", statuses: ["NOVO"], moveStatus: "NOVO", tone: "sky" },
  { id: "doing", label: "Em andamento", statuses: ["EM_ANDAMENTO"], moveStatus: "EM_ANDAMENTO", tone: "orange" },
  { id: "review", label: "Em revisão", statuses: ["AGUARDANDO"], moveStatus: "AGUARDANDO", tone: "amber" },
  { id: "done", label: "Finalizado", statuses: ["CONCLUIDO"], moveStatus: "CONCLUIDO", tone: "green" },
  { id: "archive", label: "Cancelados", statuses: ["CANCELADO"], tone: "red" },
];

export function EngineeringKanban({ projects, action }: { projects: Project[]; action: React.ReactNode }) {
  const now = new Date();
  return <KanbanBoard
    eyebrow="Operação / Engenharia" title="Engenharia" description="Projetos, homologações e evolução técnica no mesmo fluxo do Pipeline."
    action={action} columns={columns} statusEndpoint={(id) => `/api/engineering/${id}/status`}
    items={projects.map((project) => {
      const completed = project.stages.filter((stage) => stage.completed).length;
      const total = project.stages.length;
      return {
        id: project.id, status: project.status, title: project.title, subtitle: project.client.name,
        meta: project.serviceType.replaceAll("_", " "), detail: project.stages.find((stage) => stage.responsible)?.responsible ?? project.description,
        progress: { completed, total, percentage: total ? Math.round(completed / total * 100) : 0 },
        updatedAt: project.updatedAt, href: `/engenharia/${project.id}`, movable: project.status !== "CANCELADO",
        overdue: project.stages.some((stage) => !stage.completed && stage.dueDate && new Date(stage.dueDate) < now),
      };
    })}
  />;
}
