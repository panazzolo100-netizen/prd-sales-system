import { prisma } from "@/lib/prisma";

export type UpdateProjectData = {
  title?: string;
  status?: string;
  description?: string | null;
};

function calculateChecklistProgress(
  serviceOrder: {
    checklistArt: boolean;
    checklistProjectApproved: boolean;
    checklistMaterialsSeparated: boolean;
    checklistStructureInstalled: boolean;
    checklistModulesInstalled: boolean;
    checklistInverterInstalled: boolean;
    checklistDcCabling: boolean;
    checklistAcCabling: boolean;
    checklistCommissioning: boolean;
    checklistCustomerTraining: boolean;
    checklistDelivered: boolean;
  } | null
) {
  if (!serviceOrder) {
    return {
      total: 11,
      completed: 0,
      percentage: 0,
    };
  }

  const items = [
    serviceOrder.checklistArt,
    serviceOrder.checklistProjectApproved,
    serviceOrder.checklistMaterialsSeparated,
    serviceOrder.checklistStructureInstalled,
    serviceOrder.checklistModulesInstalled,
    serviceOrder.checklistInverterInstalled,
    serviceOrder.checklistDcCabling,
    serviceOrder.checklistAcCabling,
    serviceOrder.checklistCommissioning,
    serviceOrder.checklistCustomerTraining,
    serviceOrder.checklistDelivered,
  ];

  const completed = items.filter(Boolean).length;
  const total = items.length;

  return {
    total,
    completed,
    percentage: Math.round((completed / total) * 100),
  };
}

export async function findProjectsByCompany(
  companyId: string
) {
  const projects =
    await prisma.project.findMany({
      where: {
        companyId,
      },

      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            city: true,
            state: true,
            address: true,
          },
        },

        financial: true,

        serviceOrder: true,

        documents: {
          include: {
            uploadedBy: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  return projects.map((project) => ({
    ...project,
    checklistProgress:
      calculateChecklistProgress(
        project.serviceOrder
      ),
  }));
}

export async function updateProject(
  id: string,
  companyId: string,
  data: UpdateProjectData
) {
  const existingProject =
    await prisma.project.findFirst({
      where: {
        id,
        companyId,
      },
    });

  if (!existingProject) {
    throw new Error(
      "Projeto não encontrado."
    );
  }

  return prisma.project.update({
    where: {
      id,
    },

    data,
  });
}

export async function findProjectById(
  id: string,
  companyId: string
) {
  return prisma.project.findFirst({
    where: {
      id,
      companyId,
    },
  });
}

export async function findProjectDependencies(id: string, companyId: string) {
  return prisma.project.findFirst({
    where: { id, companyId },
    select: {
      id: true,
      serviceOrder: { select: { id: true } },
      financial: { select: { id: true, _count: { select: { installments: true, cashFlow: true, attachments: true } } } },
      documents: { select: { id: true } },
      _count: { select: { documents: true, timeline: true } },
    },
  });
}

export async function deleteProject(id: string, companyId: string) {
  return prisma.$transaction(async (transaction) => {
    const project = await transaction.project.findFirst({
      where: { id, companyId },
      select: {
        serviceOrder: { select: { id: true } },
        financial: { select: { id: true } },
        _count: { select: { documents: true } },
      },
    });
    if (
      !project ||
      project.serviceOrder ||
      project.financial ||
      project._count.documents
    ) {
      return null;
    }
    await transaction.projectStage.deleteMany({
      where: { projectId: id },
    });
    await transaction.projectTimeline.deleteMany({
      where: { projectId: id },
    });
    return transaction.project.delete({
      where: { id, companyId },
    });
  }, { isolationLevel: "Serializable" });
}
