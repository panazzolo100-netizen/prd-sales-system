import { prisma } from "@/lib/prisma";

export type AgendaEventInput = {
  title: string;
  type: string;
  status: string;
  color: string;
  allDay: boolean;
  startAt: Date;
  endAt: Date | null;
  location: string | null;
  description: string | null;
  responsibleId: string | null;
  clientId: string | null;
  leadId: string | null;
  projectId: string | null;
  serviceOrderId: string | null;
};

const agendaEventInclude = {
  responsible: {
    select: {
      id: true,
      name: true,
    },
  },
  client: {
    select: {
      id: true,
      name: true,
    },
  },
  lead: {
    select: {
      id: true,
      companyName: true,
      contactName: true,
    },
  },
  project: {
    select: {
      id: true,
      title: true,
    },
  },
  serviceOrder: {
    select: {
      id: true,
      number: true,
      title: true,
    },
  },
} as const;

export async function findAgendaEvents(
  companyId: string
) {
  return prisma.agendaEvent.findMany({
    where: {
      companyId,
    },
    include: agendaEventInclude,
    orderBy: [
      {
        startAt: "asc",
      },
      {
        createdAt: "asc",
      },
    ],
  });
}

export async function findAgendaEventById(
  id: string,
  companyId: string
) {
  return prisma.agendaEvent.findFirst({
    where: {
      id,
      companyId,
    },
    include: agendaEventInclude,
  });
}

export async function createAgendaEvent(
  companyId: string,
  createdById: string,
  data: AgendaEventInput
) {
  return prisma.agendaEvent.create({
    data: {
      ...data,
      companyId,
      createdById,
    },
    include: agendaEventInclude,
  });
}

export async function updateAgendaEvent(
  id: string,
  companyId: string,
  data: AgendaEventInput
) {
  const updated = await prisma.agendaEvent.updateMany({
    where: {
      id,
      companyId,
    },
    data,
  });

  if (updated.count !== 1) {
    return null;
  }

  return findAgendaEventById(
    id,
    companyId
  );
}

export async function deleteAgendaEvent(
  id: string,
  companyId: string
) {
  const deleted = await prisma.agendaEvent.deleteMany({
    where: {
      id,
      companyId,
    },
  });

  return deleted.count === 1;
}

export async function findCompanyAgendaUsers(
  companyId: string
) {
  return prisma.user.findMany({
    where: {
      companyId,
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}

export async function findCompanyAgendaClients(
  companyId: string
) {
  return prisma.client.findMany({
    where: {
      companyId,
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}

export async function findCompanyAgendaLeads(
  companyId: string
) {
  return prisma.lead.findMany({
    where: {
      companyId,
      archivedAt: null,
    },
    select: {
      id: true,
      companyName: true,
      contactName: true,
    },
    orderBy: {
      companyName: "asc",
    },
  });
}

export async function findCompanyAgendaProjects(
  companyId: string
) {
  return prisma.project.findMany({
    where: {
      companyId,
    },
    select: {
      id: true,
      title: true,
      client: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      title: "asc",
    },
  });
}

export async function findCompanyAgendaServiceOrders(
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
