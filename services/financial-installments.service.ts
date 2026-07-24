import { createInstallments, deleteInstallments, listInstallments, updateInstallment } from "@/repositories/financial-installments.repository";
import { findFinancialById } from "@/repositories/financial.repository";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { requirePermission } from "@/services/auth.service";
import { registerProjectEvent } from "@/services/project-timeline.service";

export async function generateInstallments(data: { financialId: string; totalValue: number; quantity: number; firstDueDate: Date; replaceExisting?: boolean }) {
  const financial = await findFinancialById(data.financialId, await getCurrentCompanyId());
  if (!financial) throw new Error("Financeiro não encontrado.");
  if (!Number.isInteger(data.quantity) || data.quantity <= 0 || data.quantity > 120) throw new Error("A quantidade deve estar entre 1 e 120 parcelas.");
  if (!Number.isFinite(data.totalValue) || data.totalValue <= 0 || data.totalValue > financial.saleValue + 0.01) throw new Error("O total das parcelas deve ser positivo e não pode ultrapassar o valor da venda.");
  if (Number.isNaN(data.firstDueDate.getTime())) throw new Error("Informe uma data de primeiro vencimento válida.");
  if (financial.installments.length > 0 && !data.replaceExisting) throw new Error("Já existem parcelas. Confirme a substituição para gerar novamente.");

  await deleteInstallments(data.financialId);
  const regularValue = Number((data.totalValue / data.quantity).toFixed(2));
  const installments = Array.from({ length: data.quantity }, (_, index) => {
    const dueDate = new Date(data.firstDueDate);
    dueDate.setMonth(dueDate.getMonth() + index);
    const value = index === data.quantity - 1 ? Number((data.totalValue - regularValue * (data.quantity - 1)).toFixed(2)) : regularValue;
    return { number: index + 1, description: `Parcela ${index + 1}/${data.quantity}`, value, dueDate, status: "PENDENTE" };
  });
  const result = await createInstallments({ financialId: data.financialId, installments });
  await registerProjectEvent({ projectId: financial.projectId, type: "INSTALLMENTS_GENERATED", title: "Parcelas geradas", description: `${data.quantity} parcela(s) no total de ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(data.totalValue)}.` });
  return result;
}

export async function getInstallments(financialId: string) { return listInstallments(financialId); }
export async function receiveInstallment(id: string, notes?: string) { return updateInstallment(id, { paidAt: new Date(), status: "PAGO", notes: notes?.trim() || null }); }
async function getCurrentCompanyId() {
  return (await requirePermission(PERMISSIONS.FINANCIAL)).companyId;
}
