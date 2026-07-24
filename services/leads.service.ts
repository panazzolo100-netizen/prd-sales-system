import { LeadStatus } from "@/lib/generated/prisma/enums";
import { isServiceType, sanitizeServiceDetails } from "@/lib/opportunity-service-types";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { requirePermission } from "@/services/auth.service";
async function getCurrentCompanyId() {
  return (await requirePermission(PERMISSIONS.COMMERCIAL)).companyId;
}

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
import { toLeadFileResponses } from "@/services/leads.files.service";

export async function listCompanyLeads() {
  const companyId =
    await getCurrentCompanyId();

  const leads = await findLeadsByCompany(companyId);
  return Promise.all(
    leads.map(async (lead) => ({
      ...lead,
      files: await toLeadFileResponses(lead.files, companyId),
    }))
  );
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

  return {
    ...lead,
    files: await toLeadFileResponses(lead.files, companyId),
  };
}

export async function createCompanyLead(
  data: Omit<CreateLeadData, "companyId">
) {
  const companyId =
    await getCurrentCompanyId();

  if (!isServiceType(data.serviceType)) throw new Error("Tipo de serviço inválido.");
  const lead = await createLead({
    ...data,
    serviceDetails: sanitizeServiceDetails(data.serviceType, data.serviceDetails),
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

  if (data.serviceType !== undefined && !isServiceType(data.serviceType)) throw new Error("Tipo de serviço inválido.");
  const targetType = data.serviceType ?? currentLead.serviceType;
  const safeData = { ...data };
  if (data.serviceDetails !== undefined) {
    if (!isServiceType(targetType)) throw new Error("Selecione o tipo de serviço antes de salvar especificações.");
    safeData.serviceDetails = sanitizeServiceDetails(targetType, data.serviceDetails);
  }
  const lead = await updateLead(
    id,
    companyId,
    safeData
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

  const dependencies = [
    lead.proposal ? "proposta" : null,
    lead.client ? "cliente" : null,
  ].filter(Boolean);

  if (dependencies.length > 0) {
    throw new Error(
      `Esta oportunidade possui ${dependencies.join(" e ")} vinculado(s). Remova ou cancele esses vínculos antes de excluir.`
    );
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

export async function createCompanyLeadActivity(data: { leadId: string; type: string; title: string; notes?: string | null }) {
  await getCompanyLeadById(data.leadId);
  return createLeadActivity(data);
}
