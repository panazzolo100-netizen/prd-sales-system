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

const COMPANY_ID = "default-company";

export async function getDashboardData() {
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
    countLeads(COMPANY_ID),
    countClients(COMPANY_ID),
    countWonLeads(COMPANY_ID),
    countProposalLeads(COMPANY_ID),
    countPipelineByStatus(COMPANY_ID),
    countProjects(COMPANY_ID),
    countProjectsInProgress(COMPANY_ID),
    countCompletedProjects(COMPANY_ID),
    countOpenServiceOrders(COMPANY_ID),
    countServiceOrdersInProgress(COMPANY_ID),
    countCompletedServiceOrders(COMPANY_ID),
    countOverdueServiceOrders(COMPANY_ID),
    countProjectDocuments(COMPANY_ID),
    getFinancialSummary(COMPANY_ID),
  ]);

  const conversao =
    totalLeads === 0
      ? 0
      : Math.round((ganhos / totalLeads) * 100);

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

    totalVendido: financeiro.saleValue,
    totalRecebido: financeiro.receivedValue,
    totalPendente,
    totalCustos: financeiro.costValue,

    margem,
    percentualRecebido,
  };
}