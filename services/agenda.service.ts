import { getCurrentCompanyId } from "@/lib/auth/current-user";
import { findScheduledServiceOrders } from "@/repositories/agenda.repository";
import { findCompanyAgendaUsers } from "@/repositories/agenda.repository";

export async function listScheduledServiceOrders() {
  const companyId = await getCurrentCompanyId();

  return findScheduledServiceOrders(companyId);
}

export async function getAgendaData() {
  const companyId = await getCurrentCompanyId();
  return Promise.all([findScheduledServiceOrders(companyId), findCompanyAgendaUsers(companyId)]);
}
