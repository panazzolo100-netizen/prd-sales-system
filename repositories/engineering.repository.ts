import { prisma } from "@/lib/prisma";

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



export async function findEngineeringByLead(
  leadId: string
) {
  return prisma.leadEngineering.findUnique({
    where: {
      leadId,
    },
  });
}



export async function createEngineering(
  data: CreateEngineeringData
) {
  return prisma.leadEngineering.create({
    data,
  });
}



export async function updateEngineering(
  leadId: string,
  data: UpdateEngineeringData
) {
  return prisma.leadEngineering.update({
    where: {
      leadId,
    },
    data,
  });
}



export async function upsertEngineering(
  leadId: string,
  data: UpdateEngineeringData
) {
  return prisma.leadEngineering.upsert({
    where: {
      leadId,
    },

    update: data,

    create: {
      leadId,
      ...data,
    },
  });
}