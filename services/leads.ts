import { listCompanyLeads } from "@/services/leads.service";

export async function getLeads() {
  const leads =
    await listCompanyLeads();

  return leads.map((lead) => ({
    ...lead,
    engineering:
      lead.engineering ?? null,
  }));
}