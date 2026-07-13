import {
  getInstallments,
  receiveInstallment,
} from "@/services/financial-installments.service";

import { createCashFlow } from "@/services/cash-flow.service";

import {
  findFinancialById,
  updateFinancialReceivedValue,
} from "@/repositories/financial.repository";

const COMPANY_ID = "default-company";

export async function receiveFinancialInstallment(
  financialId: string,
  installmentId: string
) {
  const financial =
    await findFinancialById(
      financialId,
      COMPANY_ID
    );

  if (!financial) {
    throw new Error(
      "Financeiro não encontrado."
    );
  }

  const currentInstallments =
    await getInstallments(financialId);

  const installment =
    currentInstallments.find(
      (item) => item.id === installmentId
    );

  if (!installment) {
    throw new Error(
      "Parcela não encontrada."
    );
  }

  if (installment.status === "PAGO") {
    throw new Error(
      "Esta parcela já foi recebida."
    );
  }

  await receiveInstallment(
    installmentId
  );

  await createCashFlow({
    description: `${installment.description ?? `Parcela ${installment.number}`} — ${financial.project.client.name}`,
    type: "ENTRADA",
    category: "RECEBIMENTO",
    value: installment.value,
    dueDate: installment.dueDate,
    paidAt: new Date(),
    status: "PAGO",
    notes: `Recebimento do projeto ${financial.project.title}.`,
    companyId: COMPANY_ID,
    financialId: financial.id,
  });

  const installments =
    await getInstallments(financialId);

  const received =
    installments
      .filter(
        (item) =>
          item.status === "PAGO"
      )
      .reduce(
        (total, item) =>
          total + item.value,
        0
      );

  const status =
    received >= financial.saleValue
      ? "RECEBIDO"
      : received > 0
        ? "PARCIAL"
        : "PENDENTE";

  await updateFinancialReceivedValue(
    financial.id,
    received,
    status
  );

  return {
    received,
    status,
  };
}