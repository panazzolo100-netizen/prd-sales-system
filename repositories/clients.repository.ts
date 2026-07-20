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