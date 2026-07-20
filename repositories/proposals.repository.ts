import { prisma } from "@/lib/prisma";

export type CreateProposalData = {
  leadId: string;

  title: string;
  amount: number;

  status?: string;

  validUntil?: Date | null;

  paymentTerms?: string | null;
  executionDeadline?: string | null;
  commercialNotes?: string | null;

  systemPower?: number | null;

  monthlySaving?: number | null;
  annualSaving?: number | null;

  payback?: number | null;
};

export type UpdateProposalData = Partial<
  Omit<CreateProposalData, "leadId">
>;

export async function findProposalsByCompany(
  companyId: string
) {
  return prisma.proposal.findMany({
    where: {
      lead: {
        companyId,
      },
    },

    include: {
      lead: {
        select: {
          id: true,
          companyName: true,
          contactName: true,
          phone: true,
          city: true,
          state: true,
          status: true,

          owner: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

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

  if (existing) {
    return prisma.proposal.update({
      where: {
        id: existing.id,
      },

      data,
    });
  }

  return prisma.proposal.create({
    data: {
      leadId,

      title:
        data.title ?? "Proposta Solar",

      amount:
        data.amount ?? 0,

      status:
        data.status,

      validUntil:
        data.validUntil,

      paymentTerms:
        data.paymentTerms,

      executionDeadline:
        data.executionDeadline,

      commercialNotes:
        data.commercialNotes,

      systemPower:
        data.systemPower,

      monthlySaving:
        data.monthlySaving,

      annualSaving:
        data.annualSaving,

      payback:
        data.payback,
    },
  });
}