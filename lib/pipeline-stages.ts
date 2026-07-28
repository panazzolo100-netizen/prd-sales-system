import { LeadStatus } from "@/lib/generated/prisma/enums";

export const PIPELINE_STAGES = [
  {
    status: LeadStatus.NOVO,
    label: "Novo",
  },
  {
    status: LeadStatus.CONTATO,
    label: "Contato",
  },
  {
    status: LeadStatus.PROPOSTA,
    label: "Proposta",
  },
  {
    status: LeadStatus.NEGOCIACAO,
    label: "Negociação",
  },
  {
    status: LeadStatus.GANHO,
    label: "Ganho",
  },
  {
    status: LeadStatus.PERDIDO,
    label: "Perdido",
  },
] as const satisfies ReadonlyArray<{
  status: LeadStatus;
  label: string;
}>;

export function isActivePipelineStage(
  status: LeadStatus
) {
  return PIPELINE_STAGES.some(
    (stage) => stage.status === status
  );
}
