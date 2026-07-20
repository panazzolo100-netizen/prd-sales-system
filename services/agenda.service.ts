import { getCurrentCompanyId } from "@/lib/auth/current-user";
import { findScheduledServiceOrders } from "@/repositories/agenda.repository";

export async function listScheduledServiceOrders() {
  const companyId = await getCurrentCompanyId();

  return findScheduledServiceOrders(companyId);
}