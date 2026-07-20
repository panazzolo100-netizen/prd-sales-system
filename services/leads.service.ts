import { LeadStatus } from "@/lib/generated/prisma/enums";
import { getCurrentCompanyId } from "@/lib/auth/current-user";

import {
  createClientFromLead,
  createFinancialFromLead,
  createLead,
  createLeadActivity,
  createProjectFromLead,
  deleteLead,
  findLeadById,
  findLeadsByCompany,
  updateLead,
  type CreateLeadData,
  type UpdateLeadData,
} from "@/repositories/leads.repository";

export async function listCompanyLeads() {
  const companyId =
    await getCurrentCompanyId();

  return findLeadsByCompany(companyId);
}

export async function getCompanyLeadById(
  id: string
) {
  const companyId =
    await getCurrentCompanyId();

  const lead = await findLeadById(
    id,
    companyId
  );

  if (!lead) {
    throw new Error("Lead não encontrado.");
  }

  return lead;
}

export async function createCompanyLead(
  data: Omit<CreateLeadData, "companyId">
) {
  const companyId =
    await getCurrentCompanyId();

  const lead = await createLead({
    ...data,
    companyId,
    status:
      data.status ?? LeadStatus.NOVO,
  });

  await createLeadActivity({
    leadId: lead.id,
    type: "SISTEMA",
    title: "Lead criado",
    notes: `O lead ${lead.companyName} foi cadastrado no CRM.`,
  });

  return lead;
}

export async function updateCompanyLead(
  id: string,
  data: UpdateLeadData
) {
  const companyId =
    await getCurrentCompanyId();

  const currentLead = await findLeadById(
    id,
    companyId
  );

  if (!currentLead) {
    throw new Error("Lead não encontrado.");
  }

  const lead = await updateLead(
    id,
    companyId,
    data
  );

  if (
    data.status &&
    data.status !== currentLead.status
  ) {
    await createLeadActivity({
      leadId: id,
      type: "SISTEMA",
      title: "Status atualizado",
      notes: `Status alterado de ${statusLabel(
        currentLead.status
      )} para ${statusLabel(data.status)}.`,
    });
  }

  if (
    data.status === LeadStatus.GANHO &&
    currentLead.status !== LeadStatus.GANHO
  ) {
    await createClientFromLead(
      id,
      companyId
    );

    await createLeadActivity({
      leadId: id,
      type: "SISTEMA",
      title: "Cliente criado",
      notes:
        "O lead foi convertido automaticamente em cliente.",
    });

    await createProjectFromLead(
      id,
      companyId
    );

    await createLeadActivity({
      leadId: id,
      type: "SISTEMA",
      title: "Projeto criado",
      notes:
        "O projeto foi criado automaticamente e enviado para a Engenharia.",
    });

    await createFinancialFromLead(
      id,
      companyId
    );

    await createLeadActivity({
      leadId: id,
      type: "SISTEMA",
      title: "Financeiro criado",
      notes:
        "O registro financeiro da venda foi criado automaticamente.",
    });
  }

  return lead;
}

export async function deleteCompanyLead(
  id: string
) {
  const companyId =
    await getCurrentCompanyId();

  const lead = await findLeadById(
    id,
    companyId
  );

  if (!lead) {
    throw new Error("Lead não encontrado.");
  }

  return deleteLead(
    id,
    companyId
  );
}

export async function convertLeadToClient(
  id: string
) {
  const companyId =
    await getCurrentCompanyId();

  const lead = await findLeadById(
    id,
    companyId
  );

  if (!lead) {
    throw new Error("Lead não encontrado.");
  }

  if (lead.status !== LeadStatus.GANHO) {
    throw new Error(
      "O lead precisa estar como GANHO."
    );
  }

  await createClientFromLead(
    id,
    companyId
  );

  await createProjectFromLead(
    id,
    companyId
  );

  const financial =
    await createFinancialFromLead(
      id,
      companyId
    );

  await createLeadActivity({
    leadId: id,
    type: "SISTEMA",
    title: "Conversão concluída",
    notes:
      "Cliente, projeto e financeiro foram criados automaticamente.",
  });

  return financial;
}

function statusLabel(
  status: LeadStatus
) {
  switch (status) {
    case LeadStatus.NOVO:
      return "Novo";

    case LeadStatus.CONTATO:
      return "Contato";

    case LeadStatus.VISITA:
      return "Visita";

    case LeadStatus.PROPOSTA:
      return "Proposta";

    case LeadStatus.NEGOCIACAO:
      return "Negociação";

    case LeadStatus.GANHO:
      return "Ganho";

    case LeadStatus.PERDIDO:
      return "Perdido";

    default:
      return status;
  }
}