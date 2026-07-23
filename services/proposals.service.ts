import { getCurrentCompanyId } from "@/lib/auth/current-user";

import {
  findProposalByLead,
  findProposalsByCompany,
  upsertProposal,
  type UpdateProposalData,
} from "@/repositories/proposals.repository";

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
