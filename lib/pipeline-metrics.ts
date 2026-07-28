import type { LeadStatus } from "./generated/prisma/enums";

const WON_STATUS: LeadStatus = "GANHO";
const LOST_STATUS: LeadStatus = "PERDIDO";

type PipelineMetricLead = {
  status: LeadStatus;
  estimatedValue: number | null;
};

export type PipelineMetrics = {
  totalLeads: number;
  totalValue: number;
  ticketAverage: number;
  wonValue: number;
  lostValue: number;
};

export function calculatePipelineMetrics(
  leads: PipelineMetricLead[]
): PipelineMetrics {
  let totalValue = 0;
  let wonValue = 0;
  let lostValue = 0;

  for (const lead of leads) {
    const value =
      typeof lead.estimatedValue === "number" &&
      Number.isFinite(lead.estimatedValue)
        ? lead.estimatedValue
        : 0;

    totalValue += value;

    if (lead.status === WON_STATUS) {
      wonValue += value;
    } else if (lead.status === LOST_STATUS) {
      lostValue += value;
    }
  }

  const totalLeads = leads.length;

  return {
    totalLeads,
    totalValue,
    ticketAverage: totalLeads > 0 ? totalValue / totalLeads : 0,
    wonValue,
    lostValue,
  };
}
