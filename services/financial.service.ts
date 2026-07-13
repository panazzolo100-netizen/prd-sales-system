import {
  findCompanyFinancials,
  findFinancialById,
  updateFinancialRepository,
} from "@/repositories/financial.repository";

export async function listCompanyFinancials(
  companyId: string
) {
  return findCompanyFinancials(companyId);
}

export async function getFinancialById(
  id: string,
  companyId: string
) {
  const financial = await findFinancialById(
    id,
    companyId
  );

  if (!financial) {
    throw new Error(
      "Registro financeiro não encontrado."
    );
  }

  return financial;
}

export async function updateFinancialData(data: {
  id: string;
  companyId: string;
  saleValue: number;
  costValue: number;
  receivedValue: number;
  status?: string;
  notes?: string | null;
}) {
  if (data.saleValue < 0) {
    throw new Error(
      "O valor da venda não pode ser negativo."
    );
  }

  if (data.costValue < 0) {
    throw new Error(
      "O valor dos custos não pode ser negativo."
    );
  }

  if (data.receivedValue < 0) {
    throw new Error(
      "O valor recebido não pode ser negativo."
    );
  }

  const status =
    data.receivedValue >= data.saleValue &&
    data.saleValue > 0
      ? "RECEBIDO"
      : data.receivedValue > 0
        ? "PARCIAL"
        : data.status ?? "PENDENTE";

  return updateFinancialRepository(
    data.id,
    data.companyId,
    {
      saleValue: data.saleValue,
      costValue: data.costValue,
      receivedValue: data.receivedValue,
      status,
      notes: data.notes?.trim() || null,
    }
  );
}