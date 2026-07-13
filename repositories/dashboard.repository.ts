import { LeadStatus } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export async function countLeads(companyId: string) {
  return prisma.lead.count({
    where: {
      companyId,
    },
  });
}

export async function countClients(companyId: string) {
  return prisma.client.count({
    where: {
      companyId,
    },
  });
}

export async function countWonLeads(companyId: string) {
  return prisma.lead.count({
    where: {
      companyId,
      status: LeadStatus.GANHO,
    },
  });
}

export async function countProposalLeads(
  companyId: string
) {
  return prisma.lead.count({
    where: {
      companyId,
      status: LeadStatus.PROPOSTA,
    },
  });
}

export async function countProjects(
  companyId: string
) {
  return prisma.project.count({
    where: {
      companyId,
    },
  });
}

export async function countProjectsInProgress(
  companyId: string
) {
  return prisma.project.count({
    where: {
      companyId,
      status: "EM_ANDAMENTO",
    },
  });
}

export async function countCompletedProjects(
  companyId: string
) {
  return prisma.project.count({
    where: {
      companyId,
      status: "CONCLUIDO",
    },
  });
}

export async function countOpenServiceOrders(
  companyId: string
) {
  return prisma.serviceOrder.count({
    where: {
      companyId,
      status: {
        in: [
          "ABERTA",
          "AGENDADA",
          "EM_ANDAMENTO",
        ],
      },
    },
  });
}

export async function countServiceOrdersInProgress(
  companyId: string
) {
  return prisma.serviceOrder.count({
    where: {
      companyId,
      status: "EM_ANDAMENTO",
    },
  });
}

export async function countCompletedServiceOrders(
  companyId: string
) {
  return prisma.serviceOrder.count({
    where: {
      companyId,
      status: "CONCLUIDA",
    },
  });
}

export async function countOverdueServiceOrders(
  companyId: string
) {
  return prisma.serviceOrder.count({
    where: {
      companyId,
      scheduledDate: {
        lt: new Date(),
      },
      status: {
        in: [
          "ABERTA",
          "AGENDADA",
          "EM_ANDAMENTO",
        ],
      },
    },
  });
}

export async function countProjectDocuments(
  companyId: string
) {
  return prisma.projectDocument.count({
    where: {
      project: {
        companyId,
      },
    },
  });
}

export async function getFinancialSummary(
  companyId: string
) {
  const financeiro =
    await prisma.financial.aggregate({
      where: {
        companyId,
      },

      _sum: {
        saleValue: true,
        receivedValue: true,
        costValue: true,
      },
    });

  return {
    saleValue:
      financeiro._sum.saleValue ?? 0,

    receivedValue:
      financeiro._sum.receivedValue ?? 0,

    costValue:
      financeiro._sum.costValue ?? 0,
  };
}

export async function countPipelineByStatus(
  companyId: string
) {
  const result =
    await prisma.lead.groupBy({
      by: ["status"],

      where: {
        companyId,
      },

      _count: {
        id: true,
      },
    });

  return result.map((item) => ({
    status: item.status,
    total: item._count.id,
  }));
}