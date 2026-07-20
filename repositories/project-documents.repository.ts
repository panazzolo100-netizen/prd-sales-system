import { prisma } from "@/lib/prisma";
import { ProjectDocumentType } from "@/lib/generated/prisma/enums";

type CreateProjectDocumentData = {
  projectId: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  type: ProjectDocumentType;
  uploadedById?: string | null;
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
      uploadedById: data.uploadedById ?? null,
      notes: data.notes ?? null,
    },
    include: {
      uploadedBy: {
        select: {
          id: true,
          name: true,
        },
      },
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
    include: {
      uploadedBy: {
        select: {
          id: true,
          name: true,
        },
      },
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

export async function findCompanyProjectDocumentById(
  id: string,
  companyId: string
) {
  return prisma.projectDocument.findFirst({
    where: {
      id,
      project: {
        companyId,
      },
    },
  });
}

export async function findCompanyProjectForDocuments(
  projectId: string,
  companyId: string
) {
  return prisma.project.findFirst({
    where: {
      id: projectId,
      companyId,
    },
    select: {
      id: true,
    },
  });
}

export async function updateProjectDocumentFavorite(
  id: string,
  isFavorite: boolean
) {
  return prisma.projectDocument.update({
    where: { id },
    data: { isFavorite },
    include: {
      uploadedBy: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}
