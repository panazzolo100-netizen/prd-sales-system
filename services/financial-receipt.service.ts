import { PERMISSIONS } from "@/lib/auth/permissions";
import { requirePermission } from "@/services/auth.service";
import { receiveFinancialInstallmentTransaction } from "@/repositories/financial.repository";

export async function receiveFinancialInstallment(financialId: string, installmentId: string) {
  if (!financialId || !installmentId) throw new Error("Financeiro e parcela são obrigatórios.");
  return receiveFinancialInstallmentTransaction({ financialId, installmentId, companyId: await getCurrentCompanyId() });
}
async function getCurrentCompanyId() {
  return (await requirePermission(PERMISSIONS.FINANCIAL)).companyId;
}
