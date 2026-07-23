import { getCurrentCompanyId } from "@/lib/auth/current-user";

import {
  deleteClient,
  findClientDependencies,
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

export async function deleteCompanyClient(id: string) {
  const companyId = await getCurrentCompanyId();
  const client = await findClientDependencies(
    id,
    companyId
  );

  if (!client) {
    throw new Error(
      "Cliente não encontrado ou já excluído."
    );
  }

  const serviceOrders = client.projects.filter(
    (project) => project.serviceOrder
  );
  const financials = client.projects.filter(
    (project) => project.financial
  );
  const documentCount = client.projects.reduce(
    (total, project) =>
      total + project._count.documents,
    0
  );
  const dependencies = [
    client.lead ? "oportunidade vinculada" : null,
    client._count.proposals
      ? `${client._count.proposals} proposta(s)`
      : null,
    client._count.projects
      ? `${client._count.projects} projeto(s)`
      : null,
    serviceOrders.length
      ? `${serviceOrders.length} Ordem(ns) de Serviço`
      : null,
    financials.length
      ? `${financials.length} registro(s) financeiro(s)`
      : null,
    documentCount
      ? `${documentCount} documento(s)`
      : null,
    serviceOrders.some(
      (project) => project.serviceOrder?.scheduledDate
    )
      ? "agendamento(s)"
      : null,
  ].filter((value): value is string => Boolean(value));

  if (dependencies.length > 0) {
    throw new Error(
      `O cliente não pode ser excluído porque possui ${dependencies.join(
        ", "
      )}.`
    );
  }

  const deleted = await deleteClient(id, companyId).catch(
    () => null
  );
  if (!deleted) {
    throw new Error(
      "O cliente mudou ou recebeu novos vínculos durante a exclusão. Atualize a tela e tente novamente."
    );
  }
  return deleted;
}
