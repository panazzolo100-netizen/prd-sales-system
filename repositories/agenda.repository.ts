import { prisma } from "@/lib/prisma";

export async function findScheduledServiceOrders(
  companyId: string
) {
  return prisma.serviceOrder.findMany({
    where: {
      companyId,
      scheduledDate: {
        not: null,
      },
      status: {
        in: [
          "ABERTA",
          "AGENDADA",
          "EM_ANDAMENTO",
        ],
      },
    },

    include: {
      project: {
        include: {
          client: true,
        },
      },
    },

    orderBy: {
      scheduledDate: "asc",
    },
  });
}