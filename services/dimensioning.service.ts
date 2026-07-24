import {
  findDimensioningByLead,
  upsertDimensioning,
  type UpdateDimensioningData,
} from "@/repositories/dimensioning.repository";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { requirePermission } from "@/services/auth.service";
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
async function getCurrentCompanyId() {
  return (await requirePermission(PERMISSIONS.ENGINEERING)).companyId;
}
