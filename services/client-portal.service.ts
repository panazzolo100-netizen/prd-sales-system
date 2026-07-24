import { PERMISSIONS } from "@/lib/auth/permissions";
import {
  findClientServiceOrder,
  findClientServiceOrders,
} from "@/repositories/service-orders.repository";
import { requirePermission } from "@/services/auth.service";

async function requireClientIdentity() {
  const user = await requirePermission(PERMISSIONS.CLIENT_PORTAL);
  if (!user.clientId) {
    throw new Error("Usuário cliente sem vínculo com um cliente.");
  }
  return { companyId: user.companyId, clientId: user.clientId, user };
}

export async function listMyServiceOrders() {
  const { companyId, clientId } = await requireClientIdentity();
  return findClientServiceOrders(companyId, clientId);
}

export async function getMyServiceOrder(id: string) {
  const { companyId, clientId } = await requireClientIdentity();
  return findClientServiceOrder(id, companyId, clientId);
}
