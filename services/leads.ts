import { listCompanyLeads } from "@/services/leads.service";

const TEMP_COMPANY_ID = "default-company";

export async function getLeads() {
  const leads = await listCompanyLeads(TEMP_COMPANY_ID);

  return leads.map((lead) => ({
    ...lead,
    engineering: lead.engineering ?? null,
  }));
}