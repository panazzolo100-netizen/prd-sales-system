import { ProjectDocumentType } from "@/lib/generated/prisma/enums";

import {
  createProjectDocument,
  deleteProjectDocument,
  findProjectDocumentById,
  findProjectDocuments,
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
  const document = await createProjectDocument(data);

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
