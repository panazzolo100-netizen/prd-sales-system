import { prisma } from "@/lib/prisma";
import { clientServiceOrderScope } from "@/lib/auth/data-scope";

export async function findServiceOrdersByCompany(
  companyId: string
) {
  return prisma.serviceOrder.findMany({
    where: {
      companyId,
    },

    select: {
      id: true,
      number: true,
      title: true,
      status: true,
      responsible: true,
      scheduledDate: true,
      customerSignature: true,
      technicianSignature: true,
      project: {
        select: {
          client: {
            select: {
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
  id: string,
  companyId: string
) {
  return prisma.serviceOrder.findFirst({
    where: { id, companyId },
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
  id: string,
  companyId: string
) {
  return prisma.serviceOrder.findFirst({
    where: { id, companyId },
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
  id: string,
  companyId: string,
  clientId?: string
) {
  return prisma.serviceOrder.findFirst({
    where: {
      id,
      companyId,
      ...(clientId ? clientServiceOrderScope(companyId, clientId, id) : {}),
    },
    select: {
      status: true,
      customerName: true,
      customerDocument: true,
      customerSignature: true,
      technicianName: true,
      technicianSignature: true,
      signedAt: true,
    },
  });
}

export async function findClientServiceOrders(companyId: string, clientId: string) {
  return prisma.serviceOrder.findMany({
    where: clientServiceOrderScope(companyId, clientId),
    orderBy: { updatedAt: "desc" },
    select: {
      id: true, number: true, title: true, status: true,
      scheduledDate: true, completedDate: true, services: true,
      signedAt: true, customerSignature: true,
      checklistArt: true, checklistProjectApproved: true,
      checklistMaterialsSeparated: true, checklistStructureInstalled: true,
      checklistModulesInstalled: true, checklistInverterInstalled: true,
      checklistDcCabling: true, checklistAcCabling: true,
      checklistCommissioning: true, checklistCustomerTraining: true,
      checklistDelivered: true,
      project: { select: { title: true } },
    },
  });
}

export async function findClientServiceOrder(
  id: string,
  companyId: string,
  clientId: string
) {
  return prisma.serviceOrder.findFirst({
    where: clientServiceOrderScope(companyId, clientId, id),
    select: {
      id: true, number: true, title: true, status: true,
      scheduledDate: true, completedDate: true, services: true,
      signedAt: true, customerName: true, customerDocument: true,
      customerSignature: true,
      checklistArt: true, checklistProjectApproved: true,
      checklistMaterialsSeparated: true, checklistStructureInstalled: true,
      checklistModulesInstalled: true, checklistInverterInstalled: true,
      checklistDcCabling: true, checklistAcCabling: true,
      checklistCommissioning: true, checklistCustomerTraining: true,
      checklistDelivered: true,
      project: {
        select: {
          title: true,
          client: { select: { id: true, name: true } },
        },
      },
    },
  });
}

export async function findServiceOrderForPdf(
  id: string,
  companyId?: string
) {
  return prisma.serviceOrder.findFirst({
    where: { id, companyId },
    include: {
      project: {
        include: {
          company: {
            select: {
              name: true,
              tradeName: true,
              document: true,
              phone: true,
              email: true,
              address: true,
            },
          },
          client: {
            include: {
              lead: {
                include: { engineering: true },
              },
            },
          },
          stages: { orderBy: { position: "asc" } },
          _count: { select: { documents: true } },
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
  companyId: string,
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
    where: { id, companyId },
    data,
  });
}

export async function updateServiceOrderChecklist(
  id: string,
  companyId: string,
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
    where: { id, companyId },
    data,
  });
}

export async function updateServiceOrderSignatures(
  id: string,
  companyId: string,
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
    where: { id, companyId },
    data,
  });
}

export async function completeServiceOrderProject(
  projectId: string,
  companyId: string
) {
  return prisma.project.update({
    where: { id: projectId, companyId },
    data: {
      status: "CONCLUIDO",
    },
  });
}

export async function findServiceOrderDashboard(
  id: string,
  companyId: string
) {
  return prisma.serviceOrder.findFirst({
    where: {
      id,
      companyId,
    },
    select: {
      _count: {
        select: {
          photos: true,
        },
      },
      photos: {
        orderBy: {
          createdAt: "desc",
        },
        take: 4,
        select: {
          id: true,
          name: true,
          url: true,
          category: true,
          createdAt: true,
        },
      },
      timeline: {
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
        select: {
          id: true,
          type: true,
          title: true,
          description: true,
          createdAt: true,
        },
      },
    },
  });
}

export async function findServiceOrderDeletionDependencies(
  id: string,
  companyId: string
) {
  return prisma.serviceOrder.findFirst({
    where: {
      id,
      companyId,
    },
    select: {
      id: true,
      number: true,
      status: true,
      startedDate: true,
      completedDate: true,
      signedAt: true,
      customerSignature: true,
      technicianSignature: true,
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
      photos: {
        select: {
          id: true,
        },
      },
      project: {
        select: {
          financial: {
            select: {
              id: true,
              status: true,
              receivedValue: true,
              installments: {
                select: {
                  status: true,
                  paidAt: true,
                },
              },
              cashFlow: {
                select: {
                  status: true,
                  paidAt: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function deleteServiceOrderRepository(
  id: string,
  companyId: string
) {
  return prisma.$transaction(async (transaction) => {
    const current = await transaction.serviceOrder.findFirst({
      where: {
        id,
        companyId,
      },
      select: {
        startedDate: true,
        completedDate: true,
        signedAt: true,
        customerSignature: true,
        technicianSignature: true,
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
        photos: {
          select: {
            id: true,
          },
        },
        project: {
          select: {
          financial: {
            select: {
              id: true,
              status: true,
              receivedValue: true,
              installments: {
                select: {
                  status: true,
                  paidAt: true,
                },
              },
              cashFlow: {
                select: {
                  status: true,
                  paidAt: true,
                },
              },
            },
            },
          },
        },
      },
    });

    const financial = current?.project.financial;
    const consolidatedFinancial = Boolean(
      financial &&
        (financial.receivedValue > 0 ||
          ["PAGO", "RECEBIDO", "PARCIAL", "CONCILIADO"].includes(
            financial.status.toUpperCase()
          ) ||
          financial.installments.some(
            (item) =>
              item.paidAt ||
              item.status.toUpperCase() === "PAGO"
          ) ||
          financial.cashFlow.some(
            (item) =>
              item.paidAt ||
              ["PAGO", "RECEBIDO", "CONCILIADO"].includes(
                item.status.toUpperCase()
              )
          ))
    );
    const checklistStarted = Boolean(
      current &&
        [
          current.checklistArt,
          current.checklistProjectApproved,
          current.checklistMaterialsSeparated,
          current.checklistStructureInstalled,
          current.checklistModulesInstalled,
          current.checklistInverterInstalled,
          current.checklistDcCabling,
          current.checklistAcCabling,
          current.checklistCommissioning,
          current.checklistCustomerTraining,
          current.checklistDelivered,
        ].some(Boolean)
    );

    if (
      !current ||
      current.startedDate ||
      current.completedDate ||
      current.signedAt ||
      current.customerSignature ||
      current.technicianSignature ||
      checklistStarted ||
      current.photos.length > 0 ||
      consolidatedFinancial
    ) {
      return null;
    }

    await transaction.serviceOrderTimeline.deleteMany({
      where: {
        serviceOrderId: id,
      },
    });

    return transaction.serviceOrder.delete({
      where: {
        id,
        companyId,
      },
    });
  }, { isolationLevel: "Serializable" });
}
