import { PERMISSIONS } from "@/lib/auth/permissions";
import { requirePermission } from "@/services/auth.service";
async function getCurrentCompanyId() {
  return (await requirePermission(PERMISSIONS.COMMERCIAL)).companyId;
}

import {
  deleteProposal,
  findProposalDependencies,
  findProposalByLead,
  findProposalsByCompany,
  upsertProposal,
  updateProposalStatus,
  findProposalStatus,
  type UpdateProposalData,
} from "@/repositories/proposals.repository";
import { assertStatusTransition } from "@/lib/kanban/status-transitions";

import {
  findDimensioningByLead,
} from "@/repositories/dimensioning.repository";
import { findLeadById } from "@/repositories/leads.repository";

async function assertLeadAccess(leadId: string) { if (!await findLeadById(leadId, await getCurrentCompanyId())) throw new Error("Lead não encontrado."); }

export async function listCompanyProposals() {
  const companyId =
    await getCurrentCompanyId();

  return findProposalsByCompany(
    companyId
  );
}

export async function getProposal(
  leadId: string
) {
  await assertLeadAccess(leadId);
  return findProposalByLead(
    leadId
  );
}

export async function saveProposal(
  leadId: string,
  data: UpdateProposalData
) {
  await assertLeadAccess(leadId);
  return upsertProposal(
    leadId,
    data
  );
}

export async function generateProposal(
  leadId: string
) {
  await assertLeadAccess(leadId);
  const dimensioning =
    await findDimensioningByLead(
      leadId
    );

  if (!dimensioning) {
    throw new Error(
      "Dimensionamento não encontrado."
    );
  }

  return upsertProposal(
    leadId,
    {
      title: "Proposta Solar",

      amount:
        dimensioning.systemValue ?? 0,

      systemPower:
        dimensioning.installedPower ?? 0,

      monthlySaving:
        dimensioning.monthlySaving ?? 0,

      annualSaving:
        dimensioning.annualSaving ?? 0,

      payback:
        dimensioning.paybackYears ?? 0,
    }
  );
}

export async function deleteCompanyProposal(id: string) {
  const companyId = await getCurrentCompanyId();
  const proposal = await findProposalDependencies(
    id,
    companyId
  );

  if (!proposal) {
    throw new Error(
      "Proposta não encontrada ou já excluída."
    );
  }

  const projects = [
    ...(proposal.lead?.client?.projects ?? []),
    ...(proposal.client?.projects ?? []),
  ];
  const dependencies = [
    proposal.status.toUpperCase() === "APROVADA"
      ? "proposta aprovada"
      : null,
    projects.some((project) => project.serviceOrder)
      ? "histórico operacional em Ordem de Serviço"
      : null,
    projects.some((project) => project.financial)
      ? "histórico financeiro consolidado"
      : null,
  ].filter((value): value is string => Boolean(value));

  if (dependencies.length > 0) {
    throw new Error(
      `A proposta não pode ser excluída porque possui ${dependencies.join(
        ", "
      )}.`
    );
  }

  const deleted = await deleteProposal(id, companyId).catch(
    () => null
  );
  if (!deleted) {
    throw new Error(
      "A proposta mudou ou recebeu novos vínculos durante a exclusão. Atualize a tela e tente novamente."
    );
  }
  return deleted;
}

export async function changeProposalStatus(id: string, status: string, expectedUpdatedAt?: Date) {
  const companyId = await getCurrentCompanyId();
  const current = await findProposalStatus(id, companyId);
  if (!current) throw new Error("Proposta não encontrada.");
  assertStatusTransition("proposals", current.status, status);
  if (status === "ENVIADA" && (!current.title.trim() || current.amount <= 0)) {
    throw new Error("Informe título e valor antes de enviar a proposta.");
  }
  const result = await updateProposalStatus(id, companyId, status, expectedUpdatedAt);
  if (result.kind === "not-found") throw new Error("Proposta não encontrada.");
  if (result.kind === "conflict") throw new Error("CONFLICT");
  return result.proposal;
}
