import { prisma } from "@/lib/prisma";

export function findUserAccessByEmail(
  email: string
) {
  return prisma.user.findUnique({
    where: {
      email,
    },
    include: {
      company: true,
    },
  });
}

export function listUsersByCompany(
  companyId: string
) {
  return prisma.user.findMany({
    where: {
      companyId,
    },
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });
}