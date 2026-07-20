import { getCurrentCompanyId } from "@/lib/auth/current-user";

import {
  findClientsByCompany,
  updateClient,
  type UpdateClientData,
} from "@/repositories/clients.repository";

export async function listCompanyClients() {
  const companyId =
    await getCurrentCompanyId();

  return findClientsByCompany(
    companyId
  );
}

export async function updateCompanyClient(
  id: string,
  data: UpdateClientData
) {
  const companyId =
    await getCurrentCompanyId();

  return updateClient(
    id,
    companyId,
    data
  );
}