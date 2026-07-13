import { prisma } from "@/lib/prisma";

export async function createServiceOrderRepository(data: {
  number: string;
  title: string;
  status: string;
  responsible: string | null;
  scheduledDate: Date | null;
  services: string | null;
  companyId: string;
  projectId: string;
}) {
  return prisma.serviceOrder.create({
    data,
  });
}

export async function findProjectForServiceOrder(
  projectId: string,
  companyId: string
) {
  return prisma.project.findFirst({
    where: {
      id: projectId,
      companyId,
    },
    include: {
      serviceOrder: true,
    },
  });
}

export async function findServiceOrderForUpdate(
  id: string
) {
  return prisma.serviceOrder.findUnique({
    where: {
      id,
    },
    select: {
      status: true,
      responsible: true,
      team: true,
      startedDate: true,
      completedDate: true,
      projectId: true,
    },
  });
}

export async function findServiceOrderChecklist(
  id: string
) {
  return prisma.serviceOrder.findUnique({
    where: {
      id,
    },
    select: {
      projectId: true,
      status: true,
      checklistArt: true,
      checklistProjectApproved: true,
      checklistMaterialsSeparated: true,
      checklistStructureInstalled: true,
      checklistModulesInstalled: true,
      checklistInverterInstalled: true,
      checklistDcCabling: true,
      checklistAcCabling: true,
      checklistCommissioning: true,
      checklistCustomerTraining: true,
      checklistDelivered: true,
    },
  });
}

export async function findServiceOrderSignatures(
  id: string
) {
  return prisma.serviceOrder.findUnique({
    where: {
      id,
    },
    select: {
      customerName: true,
      customerDocument: true,
      customerSignature: true,
      technicianName: true,
      technicianSignature: true,
      signedAt: true,
    },
  });
}

export async function updateServiceOrderRepository(
  id: string,
  data: {
    status: string;
    responsible: string | null;
    team: string | null;
    scheduledDate: Date | null;
    services: string | null;
    materials: string | null;
    notes: string | null;
    startedDate: Date | null;
    completedDate: Date | null;
  }
) {
  return prisma.serviceOrder.update({
    where: {
      id,
    },
    data,
  });
}

export async function updateServiceOrderChecklist(
  id: string,
  data: {
    checklistArt: boolean;
    checklistProjectApproved: boolean;
    checklistMaterialsSeparated: boolean;
    checklistStructureInstalled: boolean;
    checklistModulesInstalled: boolean;
    checklistInverterInstalled: boolean;
    checklistDcCabling: boolean;
    checklistAcCabling: boolean;
    checklistCommissioning: boolean;
    checklistCustomerTraining: boolean;
    checklistDelivered: boolean;
    status?: string;
    completedDate?: Date;
  }
) {
  return prisma.serviceOrder.update({
    where: {
      id,
    },
    data,
    select: {
      projectId: true,
      status: true,
    },
  });
}

export async function updateServiceOrderSignatures(
  id: string,
  data: {
    customerName: string | null;
    customerDocument: string | null;
    customerSignature: string | null;
    technicianName: string | null;
    technicianSignature: string | null;
    signedAt: Date | null;
  }
) {
  return prisma.serviceOrder.update({
    where: {
      id,
    },
    data,
  });
}

export async function completeServiceOrderProject(
  projectId: string
) {
  return prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      status: "CONCLUIDO",
    },
  });
}