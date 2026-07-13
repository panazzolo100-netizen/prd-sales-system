import { ProjectDocumentType } from "@/lib/generated/prisma/enums";

import {
  createProjectDocument,
  deleteProjectDocument,
  findProjectDocumentById,
  findProjectDocuments,
} from "@/repositories/project-documents.repository";

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
  return createProjectDocument(data);
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

  return document;
}