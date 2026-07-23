import { getCurrentCompanyId } from "@/lib/auth/current-user";
import { receiveFinancialInstallmentTransaction } from "@/repositories/financial.repository";

export async function receiveFinancialInstallment(financialId: string, installmentId: string) {
  if (!financialId || !installmentId) throw new Error("Financeiro e parcela são obrigatórios.");
  return receiveFinancialInstallmentTransaction({ financialId, installmentId, companyId: await getCurrentCompanyId() });
}
