import { prisma } from "@/lib/prisma";
import { suggestedStages } from "@/lib/engineering-service-types";

export type CreateEngineeringData = {
  leadId: string;

  // SISTEMA
  systemType?: string | null;
  installedPower?: number | null;
  modules?: number | null;
  modulePower?: number | null;
  moduleBrand?: string | null;
  inverter?: string | null;

  // UNIDADE CONSUMIDORA
  distributor?: string | null;
  consumerUnit?: string | null;
  tariffGroup?: string | null;
  consumerClass?: string | null;
  contractedDemand?: number | null;
  measuredDemand?: number | null;

  // TELHADO
  roofType?: string | null;
  roofArea?: number | null;
  roofOrientation?: string | null;
  roofSlope?: number | null;
  shading?: string | null;
  structureType?: string | null;

  // ELÉTRICA
  voltage?: string | null;
  phase?: string | null;

  notes?: string | null;
};

export type UpdateEngineeringData = Partial<
  Omit<CreateEngineeringData, "leadId">
>;

export type EngineeringEquipmentInput = {
  type: string;
  manufacturer?: string | null;
  model?: string | null;
  description?: string | null;
  quantity: number;
  power?: number | null;
  unit?: string | null;
  voltage?: number | null;
  current?: number | null;
  mppt?: number | null;
  efficiency?: number | null;
  dimensions?: string | null;
  weight?: number | null;
  notes?: string | null;
  position?: number;
};

const engineeringEquipmentOrderBy = [
  { position: "asc" as const },
  { createdAt: "asc" as const },
];

export async function findEngineeringByLead(leadId: string) {
  return prisma.leadEngineering.findUnique({
    where: { leadId },
  });
}

export async function createEngineering(data: CreateEngineeringData) {
  return prisma.leadEngineering.create({ data });
}

export async function updateEngineering(
  leadId: string,
  data: UpdateEngineeringData
) {
  return prisma.leadEngineering.update({
    where: { leadId },
    data,
  });
}

export async function upsertEngineering(
  leadId: string,
  data: UpdateEngineeringData
) {
  return prisma.leadEngineering.upsert({
    where: { leadId },
    update: data,
    create: {
      leadId,
      ...data,
    },
  });
}

export async function findEngineeringProjectDetails(
  projectId: string,
  companyId: string
) {
  return prisma.project.findFirst({
    where: { id: projectId, companyId },
    include: {
      client: {
        include: {
          lead: { include: { engineering: true, proposal: true } },
        },
      },
      financial: true,
      serviceOrder: true,
      stages: { orderBy: { position: "asc" } },
      technicalSpecification: true,
      engineeringEquipments: {
        orderBy: engineeringEquipmentOrderBy,
      },
      engineeringMaterials: {
        orderBy: [
          { position: "asc" },
          { createdAt: "asc" },
        ],
      },
      engineeringCoordinates: {
        orderBy: [
          { position: "asc" },
          { createdAt: "asc" },
        ],
      },
      engineeringStrings: {
        orderBy: [
          { position: "asc" },
          { createdAt: "asc" },
        ],
      },
      documents: {
        orderBy: { createdAt: "desc" },
        include: {
          uploadedBy: { select: { id: true, name: true } },
        },
      },
    },
  });
}

export async function findEngineeringOverview(companyId: string) {
  return Promise.all([
    prisma.project.findMany({
      where: { companyId },
      select: {
        id: true,
        title: true,
        status: true,
        serviceType: true,
        description: true,
        updatedAt: true,
        client: { select: { id: true, name: true } },
        stages: {
          select: {
            completed: true,
            dueDate: true,
            responsible: true,
          },
        },
        serviceOrder: {
          select: {
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
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.client.findMany({
      where: { companyId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);
}

export async function createEngineeringProjectRepository(data: {
  companyId: string;
  clientId: string;
  serviceType: string;
  title: string;
  description: string | null;
}) {
  return prisma.$transaction(async (transaction) => {
    const client = await transaction.client.findFirst({
      where: { id: data.clientId, companyId: data.companyId },
      select: { id: true },
    });

    if (!client) {
      throw new Error("Cliente não encontrado.");
    }

    const project = await transaction.project.create({
      data: { ...data, status: "NOVO" },
    });

    await transaction.projectStage.createMany({
      data: suggestedStages(data.serviceType).map((title, position) => ({
        projectId: project.id,
        title,
        position,
      })),
    });

    await transaction.financial.create({
      data: {
        companyId: data.companyId,
        projectId: project.id,
      },
    });

    await transaction.projectTimeline.create({
      data: {
        projectId: project.id,
        type: "PROJECT_CREATED",
        title: "Projeto criado",
        description: "Projeto cadastrado pela Engenharia.",
      },
    });

    return project;
  });
}

export async function findCompanyProjectForEngineering(
  projectId: string,
  companyId: string
) {
  return prisma.project.findFirst({
    where: { id: projectId, companyId },
    select: { id: true },
  });
}

export async function listEngineeringEquipmentsRepository(
  projectId: string
) {
  return prisma.engineeringEquipment.findMany({
    where: { projectId },
    orderBy: engineeringEquipmentOrderBy,
  });
}

export async function findEngineeringEquipmentByIdRepository(
  id: string,
  projectId: string
) {
  return prisma.engineeringEquipment.findFirst({
    where: { id, projectId },
  });
}

export async function createEngineeringEquipmentRepository(
  projectId: string,
  data: EngineeringEquipmentInput
) {
  return prisma.engineeringEquipment.create({
    data: {
      projectId,
      ...data,
      position:
        data.position ??
        (await prisma.engineeringEquipment.count({ where: { projectId } })),
    },
  });
}

export async function updateEngineeringEquipmentRepository(
  id: string,
  data: EngineeringEquipmentInput
) {
  return prisma.engineeringEquipment.update({
    where: { id },
    data,
  });
}

export async function deleteEngineeringEquipmentRepository(id: string) {
  return prisma.engineeringEquipment.delete({
    where: { id },
  });
}