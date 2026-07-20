export type ProjectClient = {
  id: string;
  name: string;

  phone: string | null;
  email: string | null;

  city: string | null;
  state: string | null;
};

export type ProjectDocumentItem = {
  id: string;

  name: string;
  url: string;
  mimeType: string;
  size: number;

  type: string;

  notes: string | null;

  createdAt: Date | string;
  updatedAt: Date | string;

  projectId: string;
};

export type ProjectFinancial = {
  id: string;

  saleValue: number;
  costValue: number;
  receivedValue: number;

  status: string;
  notes: string | null;

  createdAt: Date | string;
  updatedAt: Date | string;

  companyId: string;
  projectId: string;
};

export type ProjectServiceOrder = {
  id: string;

  number: string;
  title: string;
  status: string;

  responsible: string | null;
  team: string | null;

  scheduledDate: Date | string | null;
  startedDate: Date | string | null;
  completedDate: Date | string | null;

  services: string | null;
  materials: string | null;
  notes: string | null;

  checklistArt: boolean;
  checklistProjectApproved: boolean;
  checklistMaterialsSeparated: boolean;
  checklistStructureInstalled: boolean;
  checklistModulesInstalled: boolean;
  checklistInverterInstalled: boolean;
  checklistDcCabling: boolean;
  checklistAcCabling: boolean;
  checklistCommissioning: boolean;
  checklistCustomerTraining: boolean;
  checklistDelivered: boolean;

  customerName: string | null;
  customerDocument: string | null;
  customerSignature: string | null;

  technicianName: string | null;
  technicianSignature: string | null;

  signedAt: Date | string | null;

  createdAt: Date | string;
  updatedAt: Date | string;

  companyId: string;
  projectId: string;
};

export type ProjectChecklistProgress = {
  total: number;
  completed: number;
  percentage: number;
};

export type ProjectTimelineType =
  | "PROJECT_CREATED"
  | "PROJECT_UPDATED"
  | "PROJECT_STATUS_CHANGED"
  | "DOCUMENT_UPLOADED"
  | "DOCUMENT_DELETED"
  | "FINANCIAL_CREATED"
  | "FINANCIAL_UPDATED"
  | "SERVICE_ORDER_CREATED"
  | "SERVICE_ORDER_UPDATED"
  | "CHECKLIST_UPDATED"
  | "PHOTO_UPLOADED"
  | "PHOTO_DELETED"
  | "PDF_GENERATED";

export type ProjectTimelineItem = {
  id: string;

  type: ProjectTimelineType;

  title: string;
  description: string;

  createdAt: Date | string;

  source: "PROJECT" | "SERVICE_ORDER" | "FINANCIAL";
};

export type ProjectDashboard = {
  progress: number;

  financialProgress: number;

  documentationProgress: number;

  executionProgress: number;
};

export type ProjectServiceOrderSummary = {
  totalPhotos: number;

  beforePhotos: number;
  duringPhotos: number;
  afterPhotos: number;

  pendingItems: number;

  executionDays: number;
};

export type ProjectListItem = {
  id: string;

  title: string;
  status: string;
  description: string | null;

  createdAt: Date | string;
  updatedAt: Date | string;

  companyId: string;
  clientId: string;

  client: ProjectClient;

  documents: ProjectDocumentItem[];

  financial: ProjectFinancial | null;

  serviceOrder: ProjectServiceOrder | null;

  checklistProgress?: ProjectChecklistProgress;

  serviceOrderSummary?: ProjectServiceOrderSummary;

  dashboard?: ProjectDashboard;

  timeline?: ProjectTimelineItem[];
};
