import {
  findDimensioningByLead,
  upsertDimensioning,
  type UpdateDimensioningData,
} from "@/repositories/dimensioning.repository";
import { getCurrentCompanyId } from "@/lib/auth/current-user";
import { findLeadById } from "@/repositories/leads.repository";

async function assertLeadAccess(leadId: string) { if (!await findLeadById(leadId, await getCurrentCompanyId())) throw new Error("Lead não encontrado."); }



export async function getLeadDimensioning(
  leadId: string
) {
  await assertLeadAccess(leadId);
  return findDimensioningByLead(
    leadId
  );

}




export async function saveLeadDimensioning(
  leadId: string,
  data: UpdateDimensioningData
) {
  await assertLeadAccess(leadId);
  return upsertDimensioning(
    leadId,
    data
  );

}
