import { prisma } from "@/lib/prisma";
import { LeadStatus } from "@/lib/generated/prisma/enums";
import { suggestedStages } from "@/lib/engineering-service-types";
import {
  normalizeServiceType,
  serviceTypeConfig,
} from "@/lib/opportunity-service-types";

export type CreateLeadData = {
  companyId: string;
  ownerId?: string | null;
  companyName: string;
  contactName: string;
  phone?: string | null;
  email?: string | null;
  city?: string | null;
  state?: string | null;
  source?: string | null;
  serviceType: string;
  serviceDetails?: Record<string, string | number | boolean>;
  status?: LeadStatus;
  distributor?: string | null;
  consumerUnit?: string | null;
  consumptionKwh?: number | null;
  demandKw?: number | null;
  estimatedValue?: number | null;
  expectedSaving?: number | null;
  notes?: string | null;
};

export type UpdateLeadData = Partial<
  Omit<CreateLeadData, "companyId">
>;

export type CreateLeadActivityData = {
  leadId: string;
  userId?: string | null;
  type: string;
  title: string;
  notes?: string | null;
};

export type CreateLeadFileData = {
  leadId: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
};

export async function findLeadsByCompany(
  companyId: string
) {
  return prisma.lead.findMany({
    where: {
      companyId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      activities: {
        orderBy: {
          createdAt: "desc",
        },
      },
      proposal: true,
      files: {
        orderBy: {
          createdAt: "desc",
        },
      },
      engineering: true,
      client: true,
    },
  });
}

export async function findLeadById(
  id: string,
  companyId: string
) {
  return prisma.lead.findFirst({
    where: {
      id,
      companyId,
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      activities: {
        orderBy: {
          createdAt: "desc",
        },
      },
      proposal: true,
      files: {
        orderBy: {
          createdAt: "desc",
        },
      },
      engineering: true,
      client: true,
    },
  });
}

export async function createLead(
  data: CreateLeadData
) {
  return prisma.lead.create({
    data,
  });
}

export async function updateLead(
  id: string,
  companyId: string,
  data: UpdateLeadData
) {
  return prisma.lead.update({
    where: {
      id,
      companyId,
    },
    data,
  });
}

export async function createLeadActivity(
  data: CreateLeadActivityData
) {
  return prisma.activity.create({
    data,
  });
}

export async function createLeadFile(
  data: CreateLeadFileData
) {
  return prisma.leadFile.create({
    data,
  });
}

export async function createClientFromLead(
  leadId: string,
  companyId: string
) {
  const lead = await findLeadById(
    leadId,
    companyId
  );

  if (!lead) {
    throw new Error("Lead não encontrado.");
  }

  return prisma.client.upsert({
    where: {
      leadId,
    },
    update: {
      name: lead.companyName,
      phone: lead.phone,
      email: lead.email,
      city: lead.city,
      state: lead.state,
      companyId,
    },
    create: {
      name: lead.companyName,
      phone: lead.phone,
      email: lead.email,
      city: lead.city,
      state: lead.state,
      companyId,
      leadId,
    },
  });
}

export async function createProjectFromLead(
  leadId: string,
  companyId: string
) {
  const lead = await findLeadById(
    leadId,
    companyId
  );

  if (!lead) {
    throw new Error("Lead não encontrado.");
  }

  const client = await createClientFromLead(
    leadId,
    companyId
  );

  // Leads antigos não possuem serviceType. O fallback solar preserva o
  // comportamento histórico sem reclassificar valores inválidos como solares.
  const serviceType = normalizeServiceType(lead.serviceType) ?? "USINA_SOLAR";
  const serviceLabel = serviceTypeConfig[serviceType].label;

  return prisma.$transaction(async (transaction) => {
    // client.leadId é único, portanto este cliente identifica a oportunidade
    // original sem confundir outros serviços vendidos ao mesmo cliente nominal.
    const existingProject = await transaction.project.findFirst({
      where: {
        companyId,
        clientId: client.id,
        client: { leadId },
      },
    });

    if (existingProject) return existingProject;

    const project = await transaction.project.create({
      data: {
        title: `${serviceLabel} - ${lead.companyName}`,
        serviceType,
        status: "NOVO",
        description:
          lead.notes ??
          "Projeto criado automaticamente após o fechamento da oportunidade.",
        companyId,
        clientId: client.id,
      },
    });

    await transaction.projectStage.createMany({
      data: suggestedStages(serviceType).map((title, position) => ({
        projectId: project.id,
        title,
        position,
      })),
    });

    await transaction.financial.create({
      data: {
        saleValue: lead.proposal?.amount ?? lead.estimatedValue ?? 0,
        costValue: 0,
        receivedValue: 0,
        status: "PENDENTE",
        companyId,
        projectId: project.id,
      },
    });

    await transaction.projectTimeline.create({
      data: {
        projectId: project.id,
        type: "PROJECT_CREATED",
        title: "Projeto criado",
        description: `Projeto criado automaticamente a partir da oportunidade de ${serviceLabel}.`,
      },
    });

    return project;
  }, { isolationLevel: "Serializable" });
}

export async function findCompanyLeadFileById(id: string, companyId: string) {
  return prisma.leadFile.findFirst({
    where: { id, lead: { companyId } },
  });
}

export async function deleteLeadFile(id: string) {
  return prisma.leadFile.delete({ where: { id } });
}

export async function createFinancialFromLead(
  leadId: string,
  companyId: string
) {
  const lead = await findLeadById(
    leadId,
    companyId
  );

  if (!lead) {
    throw new Error("Lead não encontrado.");
  }

  const project = await createProjectFromLead(
    leadId,
    companyId
  );

  const saleValue =
    lead.proposal?.amount ??
    lead.estimatedValue ??
    0;

  return prisma.financial.upsert({
    where: {
      projectId: project.id,
    },
    update: {
      saleValue,
      companyId,
    },
    create: {
      saleValue,
      costValue: 0,
      receivedValue: 0,
      status: "PENDENTE",
      companyId,
      projectId: project.id,
    },
  });
}

export async function deleteLead(
  id: string,
  companyId: string
) {
  return prisma.lead.delete({
    where: {
      id,
      companyId,
    },
  });
}
