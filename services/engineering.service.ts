import {
  findEngineeringByLead,
  upsertEngineering,
  type UpdateEngineeringData,
} from "@/repositories/engineering.repository";


export async function getLeadEngineering(
  leadId: string
) {
  return findEngineeringByLead(leadId);
}



export async function saveLeadEngineering(
  leadId: string,
  data: UpdateEngineeringData
) {
  return upsertEngineering(
    leadId,
    data
  );
}