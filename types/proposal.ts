import { LeadStatus } from "@/lib/generated/prisma/enums";

export type ProposalStatus =
  | "RASCUNHO"
  | "ENVIADA"
  | "APROVADA"
  | "RECUSADA";

export type ProposalLeadOwner = {
  id: string;
  name: string;
};

export type ProposalLead = {
  id: string;

  companyName: string;
  contactName: string;

  phone: string | null;

  city: string | null;
  state: string | null;

  status: LeadStatus;

  owner: ProposalLeadOwner | null;
};

export type ProposalListItem = {
  id: string;

  leadId: string | null;

  title: string;
  amount: number;
  status: string;

  validUntil: Date | string | null;

  paymentTerms: string | null;
  executionDeadline: string | null;
  commercialNotes: string | null;

  systemPower: number | null;

  monthlySaving: number | null;
  annualSaving: number | null;

  payback: number | null;

  createdAt: Date | string;
  updatedAt: Date | string;

  lead: ProposalLead | null;
};