import { prisma } from "@/lib/prisma";

export function findUserAccessByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: { company: true },
  });
}
