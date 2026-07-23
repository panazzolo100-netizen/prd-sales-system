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

export async function findProposalDependencies(
  id: string,
  companyId: string
) {
  return prisma.proposal.findFirst({
    where: {
      id,
      OR: [
        {
          lead: {
            companyId,
          },
        },
        {
          client: {
            companyId,
          },
        },
      ],
    },
    select: {
      id: true,
      status: true,
      lead: {
        select: {
          client: {
            select: {
              projects: {
                select: {
                  financial: {
                    select: {
                      id: true,
                    },
                  },
                  serviceOrder: {
                    select: {
                      id: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      client: {
        select: {
          projects: {
            select: {
              financial: {
                select: {
                  id: true,
                },
              },
              serviceOrder: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function deleteProposal(
  id: string,
  companyId: string
) {
  return prisma.$transaction(async (transaction) => {
    const proposal = await transaction.proposal.findFirst({
      where: {
        id,
        OR: [
          { lead: { companyId } },
          { client: { companyId } },
        ],
      },
      select: {
        status: true,
        lead: {
          select: {
            client: {
              select: {
                projects: {
                  select: {
                    financial: { select: { id: true } },
                    serviceOrder: { select: { id: true } },
                  },
                },
              },
            },
          },
        },
        client: {
          select: {
            projects: {
              select: {
                financial: { select: { id: true } },
                serviceOrder: { select: { id: true } },
              },
            },
          },
        },
      },
    });
    const projects = [
      ...(proposal?.lead?.client?.projects ?? []),
      ...(proposal?.client?.projects ?? []),
    ];
    if (
      !proposal ||
      proposal.status.toUpperCase() === "APROVADA" ||
      projects.some(
        (project) =>
          project.financial || project.serviceOrder
      )
    ) {
      return null;
    }
    return transaction.proposal.delete({
      where: { id },
    });
  }, { isolationLevel: "Serializable" });
}
