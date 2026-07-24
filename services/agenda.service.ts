import { PERMISSIONS } from "@/lib/auth/permissions";
import { requirePermission } from "@/services/auth.service";
import {
  findCompanyAgendaUsers,
  findScheduledServiceOrders,
  removeServiceOrderFromAgenda,
} from "@/repositories/agenda.repository";

export async function listScheduledServiceOrders() {
  const companyId = await getCurrentCompanyId();

  return findScheduledServiceOrders(companyId);
}

export async function getAgendaData() {
  const companyId = await getCurrentCompanyId();
  return Promise.all([findScheduledServiceOrders(companyId), findCompanyAgendaUsers(companyId)]);
}

export async function deleteCompanyAgendaItem(id: string) {
  const companyId = await getCurrentCompanyId();
  const serviceOrder =
    await removeServiceOrderFromAgenda(id, companyId);

  if (!serviceOrder) {
    throw new Error(
      "Agendamento não encontrado ou já removido."
    );
  }

  return serviceOrder;
}
async function getCurrentCompanyId() {
  return (await requirePermission(PERMISSIONS.AGENDA)).companyId;
}
