import { PERMISSIONS } from "@/lib/auth/permissions";
import { requirePermission } from "@/services/auth.service";
async function getCurrentCompanyId() {
  return (await requirePermission(PERMISSIONS.DASHBOARD_COMMERCIAL)).companyId;
}
import { searchCompanyRecords } from "@/repositories/global-search.repository";

export async function globalSearch(query: string) {
  const normalizedQuery = query.trim();
  if (normalizedQuery.length < 2) return { clients: [], projects: [], serviceOrders: [] };
  return searchCompanyRecords(await getCurrentCompanyId(), normalizedQuery);
}
