import {
  findDimensioningByLead,
  upsertDimensioning,
  type UpdateDimensioningData,
} from "@/repositories/dimensioning.repository";



export async function getLeadDimensioning(
  leadId: string
) {

  return findDimensioningByLead(
    leadId
  );

}




export async function saveLeadDimensioning(
  leadId: string,
  data: UpdateDimensioningData
) {

  return upsertDimensioning(
    leadId,
    data
  );

}