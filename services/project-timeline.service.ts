import { getCurrentCompanyId } from "@/lib/auth/current-user";
import {
  createProjectTimeline,
  findProjectTimelineData,
  type CreateProjectTimelineData,
} from "@/repositories/project-timeline.repository";
import type {
  ProjectTimelineItem,
  ProjectTimelineType,
} from "@/types/project";

const SERVICE_ORDER_TYPE_MAP: Record<string, ProjectTimelineType> = {
  OS_CRIADA: "SERVICE_ORDER_CREATED",
  CHECKLIST_ALTERADO: "CHECKLIST_UPDATED",
  FOTO_ADICIONADA: "PHOTO_UPLOADED",
  FOTO_REMOVIDA: "PHOTO_DELETED",
  PROJETO_CONCLUIDO: "PROJECT_STATUS_CHANGED",
};

export async function registerProjectEvent(
  data: CreateProjectTimelineData
) {
  return createProjectTimeline(data);
}

export async function listCompanyProjectTimeline(
  projectId: string
): Promise<ProjectTimelineItem[]> {
  const companyId = await getCurrentCompanyId();
  const project = await findProjectTimelineData(projectId, companyId);

  if (!project) {
    throw new Error("Projeto não encontrado.");
  }

  const projectEvents: ProjectTimelineItem[] = project.timeline.map(
    (event) => ({
      id: event.id,
      type: event.type as ProjectTimelineType,
      title: event.title,
      description: event.description ?? "Evento registrado no projeto.",
      createdAt: event.createdAt,
      source: "PROJECT",
    })
  );

  const serviceOrderEvents: ProjectTimelineItem[] =
    project.serviceOrder?.timeline.map((event) => ({
      id: event.id,
      type: SERVICE_ORDER_TYPE_MAP[event.type] ?? "SERVICE_ORDER_UPDATED",
      title: event.title,
      description: event.description ?? "Evento registrado na Ordem de Serviço.",
      createdAt: event.createdAt,
      source: "SERVICE_ORDER",
    })) ?? [];

  const persistedCreationEvents: ProjectTimelineItem[] = [
    {
      id: `project-created-${project.id}`,
      type: "PROJECT_CREATED",
      title: "Projeto criado",
      description: `${project.title} foi cadastrado no sistema.`,
      createdAt: project.createdAt,
      source: "PROJECT",
    },
    ...(project.financial
      ? [
          {
            id: `financial-created-${project.financial.id}`,
            type: "FINANCIAL_CREATED" as const,
            title: "Financeiro criado",
            description: "O registro financeiro foi vinculado ao projeto.",
            createdAt: project.financial.createdAt,
            source: "FINANCIAL" as const,
          },
        ]
      : []),
  ];

  return [
    ...projectEvents,
    ...serviceOrderEvents,
    ...persistedCreationEvents,
  ].sort(
    (first, second) =>
      new Date(second.createdAt).getTime() -
      new Date(first.createdAt).getTime()
  );
}
