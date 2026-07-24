import type { UserRole } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export type ManagedUserData = {
  name: string;
  email: string;
  role: UserRole;
  companyId: string;
  clientId: string | null;
};

export async function listManagedUsers(input: {
  companyId: string;
  search?: string;
  page: number;
  pageSize: number;
}) {
  const where = {
    companyId: input.companyId,
    ...(input.search
      ? {
          OR: [
            { name: { contains: input.search, mode: "insensitive" as const } },
            { email: { contains: input.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: [{ name: "asc" }, { email: "asc" }],
      skip: (input.page - 1) * input.pageSize,
      take: input.pageSize,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        clientId: true,
        createdAt: true,
        updatedAt: true,
        company: { select: { id: true, name: true, tradeName: true } },
        client: { select: { id: true, name: true, document: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total };
}

export function findManagedUser(id: string, companyId: string) {
  return prisma.user.findFirst({
    where: { id, companyId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      companyId: true,
      clientId: true,
      createdAt: true,
      client: { select: { id: true, name: true } },
      _count: {
        select: {
          leads: true,
          activities: true,
          projectDocuments: true,
        },
      },
    },
  });
}

export function findManagedUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: { id: true, companyId: true },
  });
}

export function countCompanyExecutives(companyId: string) {
  return prisma.user.count({
    where: { companyId, role: "EXECUTIVO" },
  });
}

export function findAvailableClients(companyId: string) {
  return prisma.client.findMany({
    where: { companyId },
    orderBy: { name: "asc" },
    select: { id: true, name: true, document: true },
  });
}

export function findCompanyClient(id: string, companyId: string) {
  return prisma.client.findFirst({
    where: { id, companyId },
    select: { id: true },
  });
}

export function createManagedUser(data: ManagedUserData) {
  return prisma.user.create({
    data,
    select: { id: true, name: true, email: true, role: true, clientId: true },
  });
}

export function updateManagedUser(
  id: string,
  companyId: string,
  data: Pick<ManagedUserData, "name" | "role" | "clientId">
) {
  return prisma.user.update({
    where: { id, companyId },
    data,
    select: { id: true, name: true, email: true, role: true, clientId: true },
  });
}

export async function deleteManagedUser(id: string, companyId: string) {
  return prisma.$transaction(async (transaction) => {
    const user = await transaction.user.findFirst({
      where: { id, companyId },
      select: {
        _count: {
          select: {
            leads: true,
            activities: true,
            projectDocuments: true,
          },
        },
      },
    });
    if (
      !user ||
      user._count.leads > 0 ||
      user._count.activities > 0 ||
      user._count.projectDocuments > 0
    ) {
      return null;
    }
    return transaction.user.delete({ where: { id, companyId } });
  }, { isolationLevel: "Serializable" });
}
