import { prisma } from "@/lib/prisma";

export type UpdateClientData = {
  name?: string;

  document?: string | null;

  phone?: string | null;
  email?: string | null;

  city?: string | null;
  state?: string | null;

  address?: string | null;
};

export async function findClientsByCompany(
  companyId: string
) {
  return prisma.client.findMany({
    where: {
      companyId,
    },

    include: {
      lead: true,

      proposals: true,

      projects: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function updateClient(
  id: string,
  companyId: string,
  data: UpdateClientData
) {
  const existingClient =
    await prisma.client.findFirst({
      where: {
        id,
        companyId,
      },
    });

  if (!existingClient) {
    throw new Error(
      "Cliente não encontrado."
    );
  }

  return prisma.client.update({
    where: {
      id,
    },

    data,
  });
}

export async function findClientDependencies(
  id: string,
  companyId: string
) {
  return prisma.client.findFirst({
    where: {
      id,
      companyId,
    },
    select: {
      id: true,
      lead: {
        select: {
          id: true,
        },
      },
      _count: {
        select: {
          proposals: true,
          projects: true,
        },
      },
      projects: {
        select: {
          serviceOrder: {
            select: {
              id: true,
              scheduledDate: true,
            },
          },
          financial: {
            select: {
              id: true,
              _count: {
                select: {
                  installments: true,
                  cashFlow: true,
                  attachments: true,
                },
              },
            },
          },
          _count: {
            select: {
              documents: true,
            },
          },
        },
      },
    },
  });
}

export async function deleteClient(
  id: string,
  companyId: string
) {
  return prisma.$transaction(async (transaction) => {
    const client = await transaction.client.findFirst({
      where: { id, companyId },
      select: {
        lead: { select: { id: true } },
        _count: {
          select: {
            proposals: true,
            projects: true,
          },
        },
      },
    });
    if (
      !client ||
      client.lead ||
      client._count.proposals > 0 ||
      client._count.projects > 0
    ) {
      return null;
    }
    return transaction.client.delete({
      where: { id, companyId },
    });
  }, { isolationLevel: "Serializable" });
}
