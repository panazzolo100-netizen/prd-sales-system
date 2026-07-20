import { getCurrentCompanyId } from "@/lib/auth/current-user";

import {
  findProjectById,
  findProjectsByCompany,
  updateProject,
  type UpdateProjectData,
} from "@/repositories/projects.repository";
import { registerProjectEvent } from "@/services/project-timeline.service";

export async function listCompanyProjects() {
  const companyId =
    await getCurrentCompanyId();

  return findProjectsByCompany(
    companyId
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
