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

export async function findCompanyAgendaUsers(companyId: string) {
  return prisma.user.findMany({ where: { companyId }, select: { id: true, name: true }, orderBy: { name: "asc" } });
}

export async function removeServiceOrderFromAgenda(
  id: string,
  companyId: string
) {
  return prisma.$transaction(async (transaction) => {
    const current =
      await transaction.serviceOrder.findFirst({
        where: {
          id,
          companyId,
          scheduledDate: {
            not: null,
          },
        },
        select: {
          status: true,
        },
      });

    if (!current) {
      return null;
    }

    const serviceOrder = await transaction.serviceOrder.update({
      where: {
        id,
        companyId,
        scheduledDate: {
          not: null,
        },
      },
      data: {
        scheduledDate: null,
        status:
          current.status === "AGENDADA"
            ? "ABERTA"
            : current.status,
      },
    });

    await transaction.serviceOrderTimeline.create({
      data: {
        serviceOrderId: id,
        type: "AGENDAMENTO_REMOVIDO",
        title: "Agendamento removido",
        description:
          "A Ordem de Serviço foi removida da agenda sem excluir seu histórico operacional.",
      },
    });

    return serviceOrder;
  });
}
