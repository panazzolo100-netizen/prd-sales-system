import { prisma } from "@/lib/prisma";

export async function findServiceOrdersByCompany(
  companyId: string
) {
  return prisma.serviceOrder.findMany({
    where: {
      companyId,
    },

    include: {
      project: {
        include: {
          client: true,
        },
      },

      photos: true,

      timeline: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function findAvailableProjectsForServiceOrder(
  companyId: string
) {
  return prisma.project.findMany({
    where: {
      companyId,

      serviceOrder: {
        is: null,
      },
    },

    include: {
      client: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function createServiceOrderRepository(data: {
  title: string;
  status: string;
  responsible: string | null;
  scheduledDate: Date | null;
  services: string | null;
  companyId: string;
  projectId: string;
}) {
  return prisma.$transaction(async (tx) => {
    const sequence =
      await tx.serviceOrderSequence.upsert({
        where: {
          companyId: data.companyId,
        },

        create: {
          companyId: data.companyId,
          lastNumber: 1,
        },

        update: {
          lastNumber: {
            increment: 1,
          },
        },

        select: {
          lastNumber: true,
        },
      });

    const number = `OS-${String(
      sequence.lastNumber
    ).padStart(6, "0")}`;

    return tx.serviceOrder.create({
      data: {
        ...data,
        number,
      },
    });
  });
}

export async function findProjectForServiceOrder(
  projectId: string,
  companyId: string
) {
  return prisma.project.findFirst({
    where: {
      id: projectId,
      companyId,
    },
    include: {
      serviceOrder: true,
    },
  });
}

export async function findServiceOrderForUpdate(
  id: string
) {
  return prisma.serviceOrder.findUnique({
    where: {
      id,
    },
    select: {
      status: true,
      responsible: true,
      team: true,
      scheduledDate: true,
      services: true,
      materials: true,
      notes: true,
      startedDate: true,
      completedDate: true,
      projectId: true,
    },
  });
}

export async function findServiceOrderChecklist(
  id: string
) {
  return prisma.serviceOrder.findUnique({
    where: {
      id,
    },
    select: {
      projectId: true,
      status: true,
      checklistArt: true,
      checklistProjectApproved: true,
      checklistMaterialsSeparated: true,
      checklistStructureInstalled: true,
      checklistModulesInstalled: true,
      checklistInverterInstalled: true,
      checklistDcCabling: true,
      checklistAcCabling: true,
      checklistCommissioning: true,
      checklistCustomerTraining: true,
      checklistDelivered: true,
    },
  });
}

export async function findServiceOrderSignatures(
  id: string
) {
  return prisma.serviceOrder.findUnique({
    where: {
      id,
    },
    select: {
      customerName: true,
      customerDocument: true,
      customerSignature: true,
      technicianName: true,
      technicianSignature: true,
      signedAt: true,
    },
  });
}

export async function findServiceOrderForPdf(
  id: string
) {
  return prisma.serviceOrder.findUnique({
    where: {
      id,
    },
    include: {
      project: {
        include: {
          client: true,
        },
      },

      photos: {
        orderBy: {
          createdAt: "asc",
        },
      },

      timeline: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
}

export async function updateServiceOrderRepository(
  id: string,
  data: {
    status: string;
    responsible: string | null;
    team: string | null;
    scheduledDate: Date | null;
    services: string | null;
    materials: string | null;
    notes: string | null;
    startedDate: Date | null;
    completedDate: Date | null;
  }
) {
  return prisma.serviceOrder.update({
    where: {
      id,
    },
    data,
  });
}

export async function updateServiceOrderChecklist(
  id: string,
  data: {
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
    status?: string;
    completedDate?: Date;
  }
) {
  return prisma.serviceOrder.update({
    where: {
      id,
    },
    data,
  });
}

export async function updateServiceOrderSignatures(
  id: string,
  data: {
    customerName: string | null;
    customerDocument: string | null;
    customerSignature: string | null;
    technicianName: string | null;
    technicianSignature: string | null;
    signedAt: Date | null;
  }
) {
  return prisma.serviceOrder.update({
    where: {
      id,
    },
    data,
  });
}

export async function completeServiceOrderProject(
  projectId: string
) {
  return prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      status: "CONCLUIDO",
    },
  });
}
