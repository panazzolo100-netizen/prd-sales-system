import { prisma } from "@/lib/prisma";

export async function findNotificationSources(companyId: string, today: Date, upcomingLimit: Date) {
  return Promise.all([
    prisma.serviceOrder.findMany({
      where: { companyId, status: { in: ["ABERTA", "AGENDADA", "EM_ANDAMENTO"] }, scheduledDate: { lte: upcomingLimit, not: null } },
      select: { id: true, number: true, title: true, scheduledDate: true, checklistArt: true, checklistProjectApproved: true, checklistMaterialsSeparated: true, checklistStructureInstalled: true, checklistModulesInstalled: true, checklistInverterInstalled: true, checklistDcCabling: true, checklistAcCabling: true, checklistCommissioning: true, checklistCustomerTraining: true, checklistDelivered: true, project: { select: { client: { select: { name: true } } } } },
      orderBy: { scheduledDate: "asc" },
    }),
    prisma.financialInstallment.findMany({
      where: { status: { not: "PAGO" }, dueDate: { lt: today }, financial: { companyId } },
      select: { id: true, number: true, description: true, value: true, dueDate: true, financial: { select: { projectId: true, project: { select: { title: true, client: { select: { name: true } } } } } } },
      orderBy: { dueDate: "asc" },
    }),
    prisma.cashFlow.findMany({
      where: { companyId, financialId: null, status: { not: "PAGO" }, dueDate: { lt: today } },
      select: { id: true, description: true, type: true, value: true, dueDate: true },
      orderBy: { dueDate: "asc" },
    }),
    prisma.project.findMany({
      where: { companyId, status: "AGUARDANDO" },
      select: { id: true, title: true, updatedAt: true, client: { select: { name: true } } },
      orderBy: { updatedAt: "asc" },
    }),
  ]);
}
