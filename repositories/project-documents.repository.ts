import { prisma } from "@/lib/prisma";
import { ProjectDocumentType } from "@/lib/generated/prisma/enums";

type CreateProjectDocumentData = {
  projectId: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  type: ProjectDocumentType;
  notes?: string | null;
};

export async function createProjectDocument(
  data: CreateProjectDocumentData
) {
  return prisma.projectDocument.create({
    data: {
      projectId: data.projectId,
      name: data.name,
      url: data.url,
      mimeType: data.mimeType,
      size: data.size,
      type: data.type,
      notes: data.notes ?? null,
    },
  });
}

export async function findProjectDocuments(
  projectId: string
) {
  return prisma.projectDocument.findMany({
    where: {
      projectId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function findProjectDocumentById(
  id: string
) {
  return prisma.projectDocument.findUnique({
    where: {
      id,
    },
  });
}

export async function deleteProjectDocument(
  id: string
) {
  return prisma.projectDocument.delete({
    where: {
      id,
    },
  });
}