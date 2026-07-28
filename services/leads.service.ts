import { LeadStatus } from "@/lib/generated/prisma/enums";
import { notifyPipelineStageChange } from "@/services/pipeline-email.service";
import { isServiceType, sanitizeServiceDetails } from "@/lib/opportunity-service-types";
import { isActivePipelineStage } from "@/lib/pipeline-stages";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { requirePermission, requireRole } from "@/services/auth.service";
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
  setLeadArchivedAt,
  updateLead,
  type CreateLeadData,
  type UpdateLeadData,
} from "@/repositories/leads.repository";

export async function listCompanyLeads() {
  const companyId =
    await getCurrentCompanyId();

  const leads = await findLeadsByCompany(companyId);
  return leads;
}

export async function getCompanyLeadById(
  id: string
) {
  const user = await requirePermission(PERMISSIONS.COMMERCIAL);
  const companyId = user.companyId;

  const lead = await findLeadById(
    id,
    companyId
  );

  if (!lead) {
    throw new Error("Lead não encontrado.");
  }

  return {
    ...lead,
    activities: lead.activities.map((activity) => ({
      ...activity,
      user: user.role === "EXECUTIVO" ? activity.user : undefined,
    })),
    files: await import("@/services/leads.files.service").then(({ toLeadFileResponses }) =>
      toLeadFileResponses(lead.files, companyId)
    ),
  };
}

export async function createCompanyLead(
  data: Omit<CreateLeadData, "companyId">
) {
  const companyId =
    await getCurrentCompanyId();

  if (!isServiceType(data.serviceType)) throw new Error("Tipo de serviço inválido.");
  if (data.status && !isActivePipelineStage(data.status)) {
    throw new Error("Etapa do Pipeline inválida.");
  }
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
  const user = await requirePermission(PERMISSIONS.COMMERCIAL);
  const companyId = user.companyId;

  const currentLead = await findLeadById(
    id,
    companyId
  );

  if (!currentLead) {
    throw new Error("Lead não encontrado.");
  }

  if (data.status && !isActivePipelineStage(data.status)) {
    throw new Error("Etapa do Pipeline inválida.");
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
      userId: user.id,
      type: "SISTEMA",
      title: `Moveu o card "${currentLead.companyName}" de ${statusLabel(
        currentLead.status
      )} para ${statusLabel(data.status)}`,
    });
  }

  if (
    data.estimatedValue !== undefined &&
    data.estimatedValue !== currentLead.estimatedValue
  ) {
    await createLeadActivity({
      leadId: id,
      userId: user.id,
      type: "SISTEMA",
      title: "Alterou o preço estimado",
    });
  }

  if (
    data.notes !== undefined &&
    data.notes !== currentLead.notes
  ) {
    await createLeadActivity({
      leadId: id,
      userId: user.id,
      type: "SISTEMA",
      title: data.notes
        ? currentLead.notes
          ? "Alterou observações"
          : "Adicionou observações"
        : "Removeu observações",
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

  if (
    data.status &&
    data.status !== currentLead.status &&
    (
      [LeadStatus.PROPOSTA, LeadStatus.GANHO, LeadStatus.PERDIDO] as LeadStatus[]
    ).includes(data.status)
  ) {
    try {
      await notifyPipelineStageChange({
        previousStatus: currentLead.status,
        newStatus: data.status,
        opportunityName: currentLead.companyName,
        companyName: currentLead.companyName,
        estimatedValue: lead.estimatedValue,
        proposalAmount: currentLead.proposal?.amount ?? null,
        ownerName: currentLead.owner?.name ?? null,
        movedByName: user.name,
      });
    } catch (error) {
      console.error(
        "A etapa do Lead foi atualizada, mas o e-mail de Pipeline falhou.",
        error
      );
    }
  }

  return lead;
}

export async function deleteCompanyLead(
  id: string,
  confirmationText: string
) {
  const user = await requireRole("EXECUTIVO");

  const lead = await findLeadById(
    id,
    user.companyId
  );

  if (!lead) {
    throw new Error("Lead não encontrado.");
  }

  if (confirmationText !== "EXCLUIR") {
    throw new Error("A confirmação de exclusão é inválida.");
  }

  const result = await deleteLead(
    id,
    user.companyId
  );

  if (result.kind === "not-found") {
    throw new Error("Lead não encontrado.");
  }
  if (result.kind === "blocked") {
    throw new Error(
      `A oportunidade não pode ser excluída porque possui ${result.blockers.join(
        ", "
      )}. Os dados vinculados foram preservados.`
    );
  }

  const { cleanupDeletedLeadFiles } = await import(
    "@/services/leads.files.service"
  );
  const cleanupWarnings = await cleanupDeletedLeadFiles(
    result.files,
    user.companyId
  );

  return {
    id: result.leadId,
    preservedClientId: result.preservedClientId,
    cleanupWarnings,
  };
}

export async function archiveCompanyLead(id: string) {
  const user = await requireRole("EXECUTIVO");
  const lead = await findLeadById(id, user.companyId);

  if (!lead) {
    throw new Error("Lead não encontrado.");
  }

  if (lead.archivedAt) {
    return lead;
  }

  return setLeadArchivedAt(id, user.companyId, new Date());
}

export async function restoreCompanyLead(id: string) {
  const user = await requireRole("EXECUTIVO");
  const lead = await findLeadById(id, user.companyId);

  if (!lead) {
    throw new Error("Lead não encontrado.");
  }

  if (!lead.archivedAt) {
    return lead;
  }

  return setLeadArchivedAt(id, user.companyId, null);
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
  const user = await requirePermission(PERMISSIONS.COMMERCIAL);
  const lead = await findLeadById(data.leadId, user.companyId);
  if (!lead) throw new Error("Lead não encontrado.");
  const activity = await createLeadActivity({ ...data, userId: user.id });
  return {
    ...activity,
    user: user.role === "EXECUTIVO" ? { name: user.name } : undefined,
  };
}
