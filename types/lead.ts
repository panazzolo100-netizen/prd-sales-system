import { LeadStatus } from "@/lib/generated/prisma/enums";

export type Lead = {
  id: string;
  nome?: string;
  empresa?: string;
  telefone?: string;
  email?: string;
  cidade?: string;
  origem?: string;
  status: string;
  observacao?: string;
};

export type LeadActivityItem = {
  id: string;
  type: string;
  title: string;
  notes: string | null;
  createdAt: Date;
};

export type LeadFileItem = {
  id: string;
  name: string;
  storageReference: string;
  accessUrl: string | null;
  mimeType: string;
  size: number;
  createdAt: Date;
};

export type LeadProposalItem = {
  id: string;
  title: string;
  amount: number;
  status: string;
  validUntil: Date | null;
  createdAt: Date;
  systemPower: number | null;
  monthlySaving: number | null;
  annualSaving: number | null;
  payback: number | null;
};

export type LeadEngineeringItem = {
  systemType: string | null;
  installedPower: number | null;
  modules: number | null;
  inverter: string | null;
  roofType: string | null;
  roofArea: number | null;
  voltage: string | null;
  phase: string | null;
  notes: string | null;
};

export type LeadListItem = {
  id: string;

  companyName: string;
  contactName: string;

  phone: string | null;
  email: string | null;

  city: string | null;
  state: string | null;
  source: string | null;
  serviceType: string | null;
  serviceDetails: Record<string, string | number | boolean> | null;

  distributor: string | null;
  consumerUnit: string | null;

  demandKw: number | null;
  consumptionKwh: number | null;

  estimatedValue: number | null;
  expectedSaving: number | null;

  notes: string | null;

  status: LeadStatus;
  owner?: { id: string; name: string; email: string } | null;
  client?: { id: string } | null;
  proposal?: LeadProposalItem | null;

  createdAt: Date;
  updatedAt: Date;

  activities?: LeadActivityItem[];

  files?: LeadFileItem[];

  proposals?: LeadProposalItem[];

  engineering?: LeadEngineeringItem | null;
};
