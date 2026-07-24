import {
  findEngineeringByLead,
  findEngineeringProjectDetails,
  findEngineeringOverview,
  createEngineeringProjectRepository,
  upsertEngineering,
  type UpdateEngineeringData,
} from "@/repositories/engineering.repository";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { requirePermission } from "@/services/auth.service";
import { findLeadById } from "@/repositories/leads.repository";
import { normalizeServiceType } from "@/lib/opportunity-service-types";
import {
  prepareServiceDetails,
  resolveServiceType,
} from "@/lib/service-technical-details";
import { toProjectDocumentResponses } from "@/services/project-documents.service";

async function assertLeadAccess(leadId: string) { if (!await findLeadById(leadId, await getCurrentCompanyId())) throw new Error("Lead não encontrado."); }


export async function getLeadEngineering(
  leadId: string
) {
  await assertLeadAccess(leadId);
  return findEngineeringByLead(leadId);
}



export async function saveLeadEngineering(
  leadId: string,
  data: UpdateEngineeringData
) {
  await assertLeadAccess(leadId);
  return upsertEngineering(
    leadId,
    data
  );
}

export async function getEngineeringProjectDetails(projectId: string) {
  const companyId = await getCurrentCompanyId();
  const project = await findEngineeringProjectDetails(
    projectId,
    companyId
  );
  if (!project) return null;

  const resolvedServiceType = resolveServiceType({
    leadServiceType: project.client.lead?.serviceType,
    projectServiceType: project.serviceType,
  });
  const serviceDetails = prepareServiceDetails({
    serviceType: resolvedServiceType,
    serviceDetails: project.client.lead?.serviceDetails,
    legacyEngineering: project.client.lead?.engineering,
  });

  return {
    ...project,
    documents: await toProjectDocumentResponses(project.documents, companyId),
    resolvedServiceType,
    serviceDetails,
  };
}

export async function getEngineeringOverview() { return findEngineeringOverview(await getCurrentCompanyId()); }
export async function createEngineeringProject(data: { title: string; clientId: string; serviceType: string; description?: string | null }) {
  const title = data.title.trim(); if (!title || !data.clientId) throw new Error("Título e cliente são obrigatórios.");
  const serviceType = normalizeServiceType(data.serviceType);
  if (!serviceType) throw new Error("Tipo de serviço inválido.");
  return createEngineeringProjectRepository({ companyId: await getCurrentCompanyId(), clientId: data.clientId, serviceType, title, description: data.description?.trim() || null });
}
async function getCurrentCompanyId() {
  return (await requirePermission(PERMISSIONS.ENGINEERING)).companyId;
}
