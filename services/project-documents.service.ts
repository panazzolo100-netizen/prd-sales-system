import { ProjectDocumentType } from "@/lib/generated/prisma/enums";
import { getCurrentAppUser } from "@/lib/auth/current-user";

import {
  createProjectDocument,
  deleteProjectDocument,
  findCompanyProjectDocumentById,
  findCompanyProjectForDocuments,
  findProjectDocumentById,
  findProjectDocuments,
  updateProjectDocumentFavorite,
} from "@/repositories/project-documents.repository";
import { registerProjectEvent } from "@/services/project-timeline.service";

export async function listProjectDocuments(
  projectId: string
) {
  return findProjectDocuments(projectId);
}

export async function uploadProjectDocument(data: {
  projectId: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  type: ProjectDocumentType;
  notes?: string | null;
}) {
  const user = await getCurrentAppUser();
  const project = await findCompanyProjectForDocuments(
    data.projectId,
    user.companyId
  );

  if (!project) {
    throw new Error("Projeto não encontrado.");
  }

  const document = await createProjectDocument({
    ...data,
    uploadedById: user.id,
  });

  await registerProjectEvent({
    projectId: data.projectId,
    type: "DOCUMENT_UPLOADED",
    title: "Documento enviado",
    description: `${data.name} foi adicionado ao projeto.`,
  });

  return document;
}

export async function removeProjectDocument(
  id: string
) {
  const document =
    await findProjectDocumentById(id);

  if (!document) {
    throw new Error("Documento não encontrado.");
  }

  await deleteProjectDocument(id);

  await registerProjectEvent({
    projectId: document.projectId,
    type: "DOCUMENT_DELETED",
    title: "Documento removido",
    description: `${document.name} foi removido do projeto.`,
  });

  return document;
}

export async function setProjectDocumentFavorite(data: {
  id: string;
  isFavorite: boolean;
}) {
  const user = await getCurrentAppUser();
  const currentDocument = await findCompanyProjectDocumentById(
    data.id,
    user.companyId
  );

  if (!currentDocument) {
    throw new Error("Documento não encontrado.");
  }

  if (currentDocument.isFavorite === data.isFavorite) {
    return updateProjectDocumentFavorite(data.id, data.isFavorite);
  }

  const document = await updateProjectDocumentFavorite(
    data.id,
    data.isFavorite
  );

  await registerProjectEvent({
    projectId: currentDocument.projectId,
    type: data.isFavorite
      ? "DOCUMENT_FAVORITED"
      : "DOCUMENT_UNFAVORITED",
    title: data.isFavorite
      ? "Documento favoritado"
      : "Documento removido dos favoritos",
    description: `${currentDocument.name} ${
      data.isFavorite
        ? "foi adicionado aos favoritos"
        : "foi removido dos favoritos"
    } por ${user.name}.`,
  });

  return document;
}
