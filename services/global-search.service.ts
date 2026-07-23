import { getCurrentCompanyId } from "@/lib/auth/current-user";
import { searchCompanyRecords } from "@/repositories/global-search.repository";

export async function globalSearch(query: string) {
  const normalizedQuery = query.trim();
  if (normalizedQuery.length < 2) return { clients: [], projects: [], serviceOrders: [] };
  return searchCompanyRecords(await getCurrentCompanyId(), normalizedQuery);
}
