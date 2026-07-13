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
  url: string;
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

  distributor: string | null;
  consumerUnit: string | null;

  demandKw: number | null;
  consumptionKwh: number | null;

  estimatedValue: number | null;
  expectedSaving: number | null;

  notes: string | null;

  status: LeadStatus;

  createdAt: Date;
  updatedAt: Date;

  activities?: LeadActivityItem[];

  files?: LeadFileItem[];

  proposals?: LeadProposalItem[];

  engineering?: LeadEngineeringItem | null;
};