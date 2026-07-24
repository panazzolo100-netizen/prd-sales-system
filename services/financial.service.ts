import {
  deleteFinancialRepository,
  findCompanyFinancials,
  findFinancialDeletionDependencies,
  findFinancialById,
  updateFinancialRepository,
} from "@/repositories/financial.repository";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { requirePermission } from "@/services/auth.service";
import { registerProjectEvent } from "@/services/project-timeline.service";
import {
  removeFinancialAttachment,
  toFinancialAttachmentResponses,
} from "@/services/financial-attachments.service";

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

export async function deleteCompanyFinancial(id: string) {
  const companyId = await getCurrentCompanyId();
  const financial =
    await findFinancialDeletionDependencies(
      id,
      companyId
    );

  if (!financial) {
    throw new Error(
      "Registro financeiro não encontrado ou já excluído."
    );
  }

  const paidInstallments = financial.installments.filter(
    (item) =>
      item.paidAt ||
      item.status.toUpperCase() === "PAGO"
  ).length;
  const consolidatedEntries = financial.cashFlow.filter(
    (item) =>
      item.paidAt ||
      ["PAGO", "RECEBIDO", "CONCILIADO"].includes(
        item.status.toUpperCase()
      )
  ).length;
  const dependencies = [
    financial.receivedValue > 0
      ? "valor já recebido"
      : null,
    ["PAGO", "RECEBIDO", "PARCIAL", "CONCILIADO"].includes(
      financial.status.toUpperCase()
    )
      ? `status ${financial.status}`
      : null,
    paidInstallments
      ? `${paidInstallments} parcela(s) paga(s)`
      : null,
    consolidatedEntries
      ? `${consolidatedEntries} lançamento(s) consolidado(s) no fluxo de caixa`
      : null,
  ].filter((value): value is string => Boolean(value));

  if (dependencies.length > 0) {
    throw new Error(
      `O registro financeiro não pode ser excluído porque possui ${dependencies.join(
        ", "
      )}.`
    );
  }

  for (const attachment of financial.attachments) {
    await removeFinancialAttachment(attachment.id);
  }

  const deleted = await deleteFinancialRepository(
    id,
    companyId
  ).catch(() => null);
  if (!deleted) {
    throw new Error(
      "O registro financeiro mudou ou recebeu novos vínculos durante a exclusão. Atualize a tela e tente novamente."
    );
  }

  return deleted;
}
async function getCurrentCompanyId() {
  return (await requirePermission(PERMISSIONS.FINANCIAL)).companyId;
}
