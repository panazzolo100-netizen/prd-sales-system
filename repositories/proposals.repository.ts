import { prisma } from "@/lib/prisma";


export type CreateProposalData = {
  title: string;

  amount: number;

  status?: string;

  validUntil?: Date | null;

  systemPower?: number | null;

  monthlySaving?: number | null;

  annualSaving?: number | null;

  payback?: number | null;
};


export type UpdateProposalData = Partial<
  Omit<CreateProposalData, "leadId">
>;



export async function findProposalByLead(
  leadId: string
) {

  return prisma.proposal.findFirst({
    where: {
      leadId,
    },
  });

}




export async function createProposal(
  data: CreateProposalData
) {

  return prisma.proposal.create({

    data,

  });

}





export async function updateProposal(
  id: string,
  data: UpdateProposalData
) {

  return prisma.proposal.update({

    where: {
      id,
    },

    data,

  });

}





export async function upsertProposal(
  leadId: string,
  data: UpdateProposalData
) {

  const existing =
    await findProposalByLead(leadId);


  if(existing){

    return prisma.proposal.update({

      where:{
        id: existing.id,
      },

      data,

    });

  }



  return prisma.proposal.create({

    data:{
      leadId,
      title: "Proposta Solar",
      amount: data.amount ?? 0,
      ...data,
    },

  });

}