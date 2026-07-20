export type ClientLead = {
  id: string;
  companyName: string;
  contactName: string;
  estimatedValue: number | null;
  expectedSaving: number | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type ClientProposal = {
  id: string;
  title: string;
  amount: number;
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type ClientProject = {
  id: string;
  title: string;
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type ClientListItem = {
  id: string;

  name: string;

  document: string | null;

  phone: string | null;
  email: string | null;

  city: string | null;
  state: string | null;

  address: string | null;

  companyId: string;

  leadId: string | null;

  createdAt: Date | string;
  updatedAt: Date | string;

  lead: ClientLead | null;

  proposals: ClientProposal[];

  projects: ClientProject[];
};