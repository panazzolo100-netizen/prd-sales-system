import {
  countClients,
  countCompletedProjects,
  countCompletedServiceOrders,
  countLeads,
  countOpenServiceOrders,
  countOverdueServiceOrders,
  countPipelineByStatus,
  countProjectDocuments,
  countProjects,
  countProjectsInProgress,
  countProposalLeads,
  countServiceOrdersInProgress,
  countWonLeads,
  getFinancialSummary,
} from "@/repositories/dashboard.repository";

import { getCurrentCompanyId } from "@/lib/auth/current-user";

export async function getDashboardData() {
  const companyId =
    await getCurrentCompanyId();

  const [
    totalLeads,
    totalClientes,
    ganhos,
    propostas,
    pipeline,
    projetos,
    projetosAndamento,
    projetosConcluidos,
    ordensServico,
    ordensAndamento,
    ordensConcluidas,
    ordensAtrasadas,
    documentos,
    financeiro,
  ] = await Promise.all([
    countLeads(companyId),
    countClients(companyId),
    countWonLeads(companyId),
    countProposalLeads(companyId),
    countPipelineByStatus(companyId),
    countProjects(companyId),
    countProjectsInProgress(companyId),
    countCompletedProjects(companyId),
    countOpenServiceOrders(companyId),
    countServiceOrdersInProgress(companyId),
    countCompletedServiceOrders(companyId),
    countOverdueServiceOrders(companyId),
    countProjectDocuments(companyId),
    getFinancialSummary(companyId),
  ]);

  const conversao =
    totalLeads === 0
      ? 0
      : Math.round(
          (ganhos / totalLeads) * 100
        );

  const totalPendente =
    financeiro.saleValue -
    financeiro.receivedValue;

  const margem =
    financeiro.saleValue === 0
      ? 0
      : Math.round(
          ((financeiro.saleValue -
            financeiro.costValue) /
            financeiro.saleValue) *
            100
        );

  const percentualRecebido =
    financeiro.saleValue === 0
      ? 0
      : Math.round(
          (financeiro.receivedValue /
            financeiro.saleValue) *
            100
        );

  return {
    totalLeads,
    totalClientes,
    ganhos,
    propostas,
    conversao,
    pipeline,

    projetos,
    projetosAndamento,
    projetosConcluidos,

    ordensServico,
    ordensAndamento,
    ordensConcluidas,
    ordensAtrasadas,

    documentos,

    totalVendido:
      financeiro.saleValue,

    totalRecebido:
      financeiro.receivedValue,

    totalPendente,

    totalCustos:
      financeiro.costValue,

    margem,
    percentualRecebido,
  };
}