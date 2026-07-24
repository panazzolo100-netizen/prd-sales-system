import { PERMISSIONS } from "@/lib/auth/permissions";
import { requirePermission } from "@/services/auth.service";

import {
  findProjectById,
  findProjectDependencies,
  deleteProject,
  findProjectsByCompany,
  updateProject,
  updateProjectStatus,
  type UpdateProjectData,
} from "@/repositories/projects.repository";
import { assertStatusTransition } from "@/lib/kanban/status-transitions";
import { registerProjectEvent } from "@/services/project-timeline.service";
import {
  removeProjectDocument,
  toProjectDocumentResponses,
} from "@/services/project-documents.service";

export async function listCompanyProjects() {
  const companyId =
    await getCurrentCompanyId();

  const projects = await findProjectsByCompany(companyId);
  return Promise.all(
    projects.map(async (project) => ({
      ...project,
      documents: await toProjectDocumentResponses(project.documents, companyId),
    }))
  );
}

export async function updateCompanyProject(
  id: string,
  data: UpdateProjectData
) {
  const companyId =
    await getCurrentCompanyId();

  const currentProject = await findProjectById(id, companyId);

  if (!currentProject) {
    throw new Error("Projeto não encontrado.");
  }

  const updatedProject = await updateProject(
    id,
    companyId,
    data
  );

  if (
    data.status !== undefined &&
    data.status !== currentProject.status
  ) {
    await registerProjectEvent({
      projectId: id,
      type: "PROJECT_STATUS_CHANGED",
      title: "Status do projeto alterado",
      description: `${currentProject.status} → ${data.status}`,
    });
  }

  const projectDataChanged =
    (data.title !== undefined && data.title !== currentProject.title) ||
    (data.description !== undefined &&
      data.description !== currentProject.description);

  if (projectDataChanged) {
    await registerProjectEvent({
      projectId: id,
      type: "PROJECT_UPDATED",
      title: "Projeto atualizado",
      description: "Os dados principais do projeto foram editados.",
    });
  }

  return updatedProject;
}

export async function deleteCompanyProject(id: string) {
  const companyId = await getCurrentCompanyId();
  const project = await findProjectDependencies(id, companyId);
  if (!project) throw new Error("Projeto não encontrado.");

  const dependencies = [
    project.serviceOrder ? "uma Ordem de Serviço" : null,
    project.financial ? "registros financeiros" : null,
  ].filter(Boolean);

  if (dependencies.length) {
    throw new Error(`Este projeto possui ${dependencies.join(", ")} vinculado(s). Remova ou cancele esses vínculos antes de excluir.`);
  }

  for (const document of project.documents) {
    await removeProjectDocument(document.id);
  }

  const deleted = await deleteProject(id, companyId).catch(
    () => null
  );
  if (!deleted) {
    throw new Error(
      "O projeto mudou ou recebeu novos vínculos durante a exclusão. Atualize a tela e tente novamente."
    );
  }
  return deleted;
}
async function getCurrentCompanyId() {
  return (await requirePermission(PERMISSIONS.PROJECTS)).companyId;
}

export async function changeProjectStatus(id: string, status: string, expectedUpdatedAt?: Date) {
  const companyId = await getCurrentCompanyId();
  const current = await findProjectById(id, companyId);
  if (!current) throw new Error("Projeto não encontrado.");
  assertStatusTransition("projects", current.status, status);
  const result = await updateProjectStatus(id, companyId, status, expectedUpdatedAt);
  if (result.kind === "conflict") throw new Error("CONFLICT");
  if (result.kind === "not-found") throw new Error("Projeto não encontrado.");
  await registerProjectEvent({ projectId: id, type: "PROJECT_STATUS_CHANGED", title: "Status do projeto alterado", description: `${current.status} → ${status}` });
  return result.project;
}
