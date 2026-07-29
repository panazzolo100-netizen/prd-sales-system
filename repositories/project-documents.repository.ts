import { prisma } from "@/lib/prisma";
import { ProjectDocumentType } from "@/lib/generated/prisma/enums";

type CreateProjectDocumentData = {
  projectId?: string | null;
  leadId?: string | null;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  type: ProjectDocumentType;
  uploadedById?: string | null;
  notes?: string | null;
};

const documentInclude = {
  uploadedBy: {
    select: {
      id: true,
      name: true,
    },
  },
} as const;

export async function createProjectDocument(
  data: CreateProjectDocumentData
) {
  if (!data.projectId && !data.leadId) {
    throw new Error(
      "O documento precisa estar vinculado a uma oportunidade ou projeto."
    );
  }

  return prisma.projectDocument.create({
    data: {
      projectId: data.projectId ?? null,
      leadId: data.leadId ?? null,
      name: data.name,
      url: data.url,
      mimeType: data.mimeType,
      size: data.size,
      type: data.type,
      uploadedById: data.uploadedById ?? null,
      notes: data.notes ?? null,
    },
    include: documentInclude,
  });
}

export async function findProjectDocuments(
  projectId: string,
  companyId: string
) {
  return prisma.projectDocument.findMany({
    where: {
      projectId,
      project: {
        companyId,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: documentInclude,
  });
}

export async function findLeadProjectDocuments(
  leadId: string,
  companyId: string
) {
  return prisma.projectDocument.findMany({
    where: {
      leadId,
      lead: {
        companyId,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: documentInclude,
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
      OR: [
        {
          project: {
            companyId,
          },
        },
        {
          lead: {
            companyId,
          },
        },
      ],
    },
    include: documentInclude,
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
      client: {
        select: {
          leadId: true,
        },
      },
    },
  });
}

export async function findCompanyLeadForDocuments(
  leadId: string,
  companyId: string
) {
  return prisma.lead.findFirst({
    where: {
      id: leadId,
      companyId,
    },
    select: {
      id: true,
      client: {
        select: {
          projects: {
            select: {
              id: true,
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
      },
    },
  });
}

export async function linkLeadDocumentsToProject(
  leadId: string,
  projectId: string
) {
  return prisma.projectDocument.updateMany({
    where: {
      leadId,
      projectId: null,
    },
    data: {
      projectId,
    },
  });
}

export async function updateProjectDocumentFavorite(
  id: string,
  isFavorite: boolean
) {
  return prisma.projectDocument.update({
    where: {
      id,
    },
    data: {
      isFavorite,
    },
    include: documentInclude,
  });
}