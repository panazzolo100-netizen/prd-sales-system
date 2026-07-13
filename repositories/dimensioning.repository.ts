import { prisma } from "@/lib/prisma";


export type CreateDimensioningData = {

  leadId: string;


  monthlyConsumption?: number | null;

  solarIrradiation?: number | null;

  lossFactor?: number | null;


  modulePower?: number | null;

  moduleQuantity?: number | null;


  installedPower?: number | null;

  estimatedGeneration?: number | null;

  requiredArea?: number | null;



  estimatedSaving?: number | null;


  systemValue?: number | null;

  energyTariff?: number | null;

  monthlySaving?: number | null;

  annualSaving?: number | null;

  paybackYears?: number | null;

};



export type UpdateDimensioningData = Partial<
  Omit<CreateDimensioningData, "leadId">
>;




export async function findDimensioningByLead(
  leadId: string
) {

  return prisma.leadDimensioning.findUnique({

    where:{
      leadId,
    },

  });

}




export async function createDimensioning(
  data: CreateDimensioningData
) {

  return prisma.leadDimensioning.create({

    data,

  });

}




export async function updateDimensioning(
  leadId:string,
  data:UpdateDimensioningData
) {

  return prisma.leadDimensioning.update({

    where:{
      leadId,
    },

    data,

  });

}




export async function upsertDimensioning(
  leadId:string,
  data:UpdateDimensioningData
) {

  return prisma.leadDimensioning.upsert({

    where:{
      leadId,
    },


    update:data,


    create:{
      leadId,
      ...data,
    },

  });

}