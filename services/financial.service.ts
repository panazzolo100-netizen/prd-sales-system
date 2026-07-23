import {
  findCompanyFinancials,
  findFinancialById,
  updateFinancialRepository,
} from "@/repositories/financial.repository";
import { registerProjectEvent } from "@/services/project-timeline.service";
import { toFinancialAttachmentResponses } from "@/services/financial-attachments.service";

export async function listCompanyFinancials(
  companyId: string
) {
  const financials = await findCompanyFinancials(companyId);
  return Promise.all(
    financials.map(async (financial) => ({
      ...financial,
      attachments: await toFinancialAttachmentResponses(financial.attachments, companyId),
    }))
  );
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

  return {
    ...financial,
    attachments: await toFinancialAttachmentResponses(financial.attachments, companyId),
  };
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

  const currentFinancial = await getFinancialById(
    data.id,
    data.companyId
  );

  const updatedFinancial = await updateFinancialRepository(
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

  const changed =
    currentFinancial.saleValue !== data.saleValue ||
    currentFinancial.costValue !== data.costValue ||
    currentFinancial.receivedValue !== data.receivedValue ||
    currentFinancial.status !== status ||
    currentFinancial.notes !== (data.notes?.trim() || null);

  if (changed) {
    await registerProjectEvent({
      projectId: currentFinancial.projectId,
      type: "FINANCIAL_UPDATED",
      title: "Financeiro atualizado",
      description: `Situação financeira atualizada para ${status}.`,
    });
  }

  return updatedFinancial;
}
