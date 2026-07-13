import {
  createCashFlowRepository,
  deleteCashFlowRepository,
  findCashFlowById,
  findCompanyCashFlow,
  getCashFlowSummary,
  updateCashFlowRepository,
} from "@/repositories/cash-flow.repository";

export async function listCompanyCashFlow(
  companyId: string
) {
  return findCompanyCashFlow(companyId);
}

export async function cashFlowSummary(
  companyId: string
) {
  return getCashFlowSummary(companyId);
}

export async function createCashFlow(data: {
  description: string;
  type: string;
  category?: string | null;
  value: number;
  dueDate?: Date | null;
  paidAt?: Date | null;
  status?: string;
  notes?: string | null;
  companyId: string;
  financialId?: string | null;
}) {
  return createCashFlowRepository({
    ...data,
    status: data.status ?? "PENDENTE",
  });
}

export async function updateCashFlow(data: {
  id: string;
  companyId: string;
  description: string;
  type: string;
  category?: string | null;
  value: number;
  dueDate?: Date | null;
  paidAt?: Date | null;
  status: string;
  notes?: string | null;
  financialId?: string | null;
}) {
  const cashFlow =
    await findCashFlowById(
      data.id,
      data.companyId
    );

  if (!cashFlow) {
    throw new Error(
      "Lançamento não encontrado."
    );
  }

  return updateCashFlowRepository(
    data.id,
    data.companyId,
    {
      description: data.description,
      type: data.type,
      category: data.category ?? null,
      value: data.value,
      dueDate: data.dueDate ?? null,
      paidAt: data.paidAt ?? null,
      status: data.status,
      notes: data.notes ?? null,
      financialId:
        data.financialId ?? null,
    }
  );
}

export async function removeCashFlow(
  id: string,
  companyId: string
) {
  const cashFlow =
    await findCashFlowById(
      id,
      companyId
    );

  if (!cashFlow) {
    throw new Error(
      "Lançamento não encontrado."
    );
  }

  await deleteCashFlowRepository(
    id,
    companyId
  );

  return cashFlow;
}