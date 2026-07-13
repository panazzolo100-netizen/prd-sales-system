import {
  createInstallments,
  deleteInstallments,
  listInstallments,
  updateInstallment,
} from "@/repositories/financial-installments.repository";

export async function generateInstallments(data: {
  financialId: string;
  totalValue: number;
  quantity: number;
  firstDueDate: Date;
}) {
  if (data.quantity <= 0) {
    throw new Error(
      "Quantidade de parcelas inválida."
    );
  }

  await deleteInstallments(data.financialId);

  const installmentValue =
    Number(
      (data.totalValue / data.quantity).toFixed(2)
    );

  const installments = Array.from(
    { length: data.quantity },
    (_, index) => {
      const dueDate = new Date(
        data.firstDueDate
      );

      dueDate.setMonth(
        dueDate.getMonth() + index
      );

      return {
        number: index + 1,
        description: `Parcela ${index + 1}/${data.quantity}`,
        value: installmentValue,
        dueDate,
        status: "PENDENTE",
      };
    }
  );

  return createInstallments({
    financialId: data.financialId,
    installments,
  });
}

export async function getInstallments(
  financialId: string
) {
  return listInstallments(financialId);
}

export async function receiveInstallment(
  id: string,
  notes?: string
) {
  return updateInstallment(id, {
    paidAt: new Date(),
    status: "PAGO",
    notes: notes?.trim() || null,
  });
}