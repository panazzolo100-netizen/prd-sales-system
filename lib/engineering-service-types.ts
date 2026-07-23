import {
  normalizeServiceType,
  OPPORTUNITY_SERVICE_TYPES,
  serviceTypeConfig,
} from "@/lib/opportunity-service-types";

export const ENGINEERING_SERVICE_TYPES = OPPORTUNITY_SERVICE_TYPES.map(
  (type) => [type, serviceTypeConfig[type].label] as const
);

const stages: Record<string, string[]> = {
  USINA_SOLAR: ["Levantamento", "Dimensionamento", "Proposta", "Projeto", "Homologação", "Documentação", "Instalação", "Comissionamento", "Entrega"],
  PROJETO_SOLAR: ["Levantamento", "Dimensionamento", "Projeto", "Memorial", "ART", "Homologação", "Entrega"],
  PROJETO_ELETRICO: ["Levantamento", "Análise de cargas", "Projeto", "Memorial", "ART", "Revisão", "Entrega"],
  SPDA: ["Inspeção", "Levantamento", "Análise de risco", "Projeto", "Memorial", "ART", "Execução", "Medição", "Laudo", "Entrega"],
  SUBESTACAO: ["Levantamento", "Estudo de demanda", "Projeto", "Aprovação na concessionária", "Orçamento", "Execução", "Testes", "Energização", "Entrega"],
  LAUDO_TECNICO: ["Vistoria", "Registros", "Medições", "Análise", "Elaboração", "ART", "Entrega"],
};
const generic = ["Levantamento", "Análise", "Planejamento", "Execução", "Validação", "Documentação", "Entrega"];
export function suggestedStages(type: string) {
  const normalized = normalizeServiceType(type);
  return normalized ? stages[normalized] ?? generic : generic;
}
export function engineeringTypeLabel(type: string) {
  const normalized = normalizeServiceType(type);
  return normalized ? serviceTypeConfig[normalized].label : type.replaceAll("_", " ");
}
