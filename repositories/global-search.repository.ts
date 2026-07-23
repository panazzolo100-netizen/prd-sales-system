import { prisma } from "@/lib/prisma";

export async function searchCompanyRecords(companyId: string, query: string) {
  const contains = { contains: query, mode: "insensitive" as const };

  const [clients, projects, serviceOrders] = await Promise.all([
    prisma.client.findMany({
      where: { companyId, OR: [{ name: contains }, { document: contains }, { phone: contains }] },
      select: { id: true, name: true, phone: true, city: true },
      orderBy: { name: "asc" },
      take: 5,
    }),
    prisma.project.findMany({
      where: { companyId, OR: [{ title: contains }, { client: { name: contains } }] },
      select: { id: true, title: true, status: true, client: { select: { name: true } } },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.serviceOrder.findMany({
      where: { companyId, OR: [{ number: contains }, { title: contains }, { project: { client: { name: contains } } }] },
      select: { id: true, number: true, title: true, status: true },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
  ]);

  return { clients, projects, serviceOrders };
}
