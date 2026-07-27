import { listCompanyLeads } from "@/services/leads.service";

export async function getLeads() {
  const leads =
    await listCompanyLeads();

  return leads;
}
