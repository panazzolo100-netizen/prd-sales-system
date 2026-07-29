import {
  createEngineeringEquipmentRepository,
  createEngineeringProjectRepository,
  deleteEngineeringEquipmentRepository,
  findCompanyProjectForEngineering,
  findEngineeringByLead,
  findEngineeringEquipmentByIdRepository,
  findEngineeringOverview,
  findEngineeringProjectDetails,
  listEngineeringEquipmentsRepository,
  updateEngineeringEquipmentRepository,
  upsertEngineering,
  type EngineeringEquipmentInput,
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
import { changeProjectStatus } from "@/services/projects.service";
import { assertStatusTransition } from "@/lib/kanban/status-transitions";
import { registerProjectEvent } from "@/services/project-timeline.service";

async function getCurrentEngineeringUser() {
  return requirePermission(PERMISSIONS.ENGINEERING);
}

async function getCurrentCompanyId() {
  return (await getCurrentEngineeringUser()).companyId;
}

async function assertLeadAccess(leadId: string) {
  const lead = await findLeadById(leadId, await getCurrentCompanyId());

  if (!lead) {
    throw new Error("Lead não encontrado.");
  }
}

async function assertProjectAccess(projectId: string) {
  const companyId = await getCurrentCompanyId();
  const project = await findCompanyProjectForEngineering(projectId, companyId);

  if (!project) {
    throw new Error("Projeto não encontrado.");
  }

  return project;
}

function optionalText(value: unknown) {
  const text = String(value ?? "").trim();
  return text || null;
}

function optionalNumber(value: unknown, fieldLabel: string) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    throw new Error(`${fieldLabel} inválido.`);
  }

  return parsed;
}

function optionalInteger(value: unknown, fieldLabel: string) {
  const parsed = optionalNumber(value, fieldLabel);

  if (parsed === null) {
    return null;
  }

  if (!Number.isInteger(parsed)) {
    throw new Error(`${fieldLabel} deve ser um número inteiro.`);
  }

  return parsed;
}

export type SaveEngineeringEquipmentInput = {
  type: unknown;
  manufacturer?: unknown;
  model?: unknown;
  description?: unknown;
  quantity?: unknown;
  power?: unknown;
  unit?: unknown;
  voltage?: unknown;
  current?: unknown;
  mppt?: unknown;
  efficiency?: unknown;
  dimensions?: unknown;
  weight?: unknown;
  notes?: unknown;
  position?: unknown;
};

function normalizeEquipmentInput(
  input: SaveEngineeringEquipmentInput
): EngineeringEquipmentInput {
  const type = String(input.type ?? "").trim().toUpperCase();
  const quantity = Number(input.quantity ?? 1);

  if (!type) {
    throw new Error("Tipo do equipamento é obrigatório.");
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("Quantidade deve ser um número inteiro maior que zero.");
  }

  const power = optionalNumber(input.power, "Potência");
  const voltage = optionalNumber(input.voltage, "Tensão");
  const current = optionalNumber(input.current, "Corrente");
  const mppt = optionalInteger(input.mppt, "Quantidade de MPPT");
  const efficiency = optionalNumber(input.efficiency, "Eficiência");
  const weight = optionalNumber(input.weight, "Peso");
  const position = optionalInteger(input.position, "Posição");

  if (power !== null && power < 0) throw new Error("Potência não pode ser negativa.");
  if (voltage !== null && voltage < 0) throw new Error("Tensão não pode ser negativa.");
  if (current !== null && current < 0) throw new Error("Corrente não pode ser negativa.");
  if (mppt !== null && mppt < 0) throw new Error("MPPT não pode ser negativo.");
  if (efficiency !== null && (efficiency < 0 || efficiency > 100)) {
    throw new Error("Eficiência deve estar entre 0 e 100%.");
  }
  if (weight !== null && weight < 0) throw new Error("Peso não pode ser negativo.");
  if (position !== null && position < 0) throw new Error("Posição não pode ser negativa.");

  return {
    type,
    manufacturer: optionalText(input.manufacturer),
    model: optionalText(input.model),
    description: optionalText(input.description),
    quantity,
    power,
    unit: optionalText(input.unit),
    voltage,
    current,
    mppt,
    efficiency,
    dimensions: optionalText(input.dimensions),
    weight,
    notes: optionalText(input.notes),
    position: position ?? undefined,
  };
}

export async function getLeadEngineering(leadId: string) {
  await assertLeadAccess(leadId);
  return findEngineeringByLead(leadId);
}

export async function saveLeadEngineering(
  leadId: string,
  data: UpdateEngineeringData
) {
  await assertLeadAccess(leadId);
  return upsertEngineering(leadId, data);
}

export async function getEngineeringProjectDetails(projectId: string) {
  const companyId = await getCurrentCompanyId();
  const project = await findEngineeringProjectDetails(projectId, companyId);

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

export async function getEngineeringOverview() {
  return findEngineeringOverview(await getCurrentCompanyId());
}

export async function createEngineeringProject(data: {
  title: string;
  clientId: string;
  serviceType: string;
  description?: string | null;
}) {
  const title = data.title.trim();

  if (!title || !data.clientId) {
    throw new Error("Título e cliente são obrigatórios.");
  }

  const serviceType = normalizeServiceType(data.serviceType);

  if (!serviceType) {
    throw new Error("Tipo de serviço inválido.");
  }

  return createEngineeringProjectRepository({
    companyId: await getCurrentCompanyId(),
    clientId: data.clientId,
    serviceType,
    title,
    description: data.description?.trim() || null,
  });
}

export async function changeEngineeringStatus(
  id: string,
  status: string,
  expectedUpdatedAt?: Date
) {
  const project = await getEngineeringProjectDetails(id);

  if (!project) {
    throw new Error("Projeto de engenharia não encontrado.");
  }

  assertStatusTransition("engineering", project.status, status);
  return changeProjectStatus(id, status, expectedUpdatedAt);
}

export async function listEngineeringEquipments(projectId: string) {
  await assertProjectAccess(projectId);
  return listEngineeringEquipmentsRepository(projectId);
}

export async function createEngineeringEquipment(
  projectId: string,
  input: SaveEngineeringEquipmentInput
) {
  await assertProjectAccess(projectId);
  const equipment = await createEngineeringEquipmentRepository(
    projectId,
    normalizeEquipmentInput(input)
  );

  await registerProjectEvent({
    projectId,
    type: "PROJECT_UPDATED",
    title: "Equipamento adicionado",
    description: `${equipment.quantity}x ${equipment.manufacturer ?? ""} ${equipment.model ?? equipment.type}`.trim(),
  });

  return equipment;
}

export async function updateEngineeringEquipment(
  projectId: string,
  id: string,
  input: SaveEngineeringEquipmentInput
) {
  await assertProjectAccess(projectId);

  const current = await findEngineeringEquipmentByIdRepository(id, projectId);

  if (!current) {
    throw new Error("Equipamento não encontrado.");
  }

  const equipment = await updateEngineeringEquipmentRepository(
    id,
    normalizeEquipmentInput(input)
  );

  await registerProjectEvent({
    projectId,
    type: "PROJECT_UPDATED",
    title: "Equipamento atualizado",
    description: `${equipment.manufacturer ?? ""} ${equipment.model ?? equipment.type}`.trim(),
  });

  return equipment;
}

export async function removeEngineeringEquipment(
  projectId: string,
  id: string
) {
  await assertProjectAccess(projectId);

  const current = await findEngineeringEquipmentByIdRepository(id, projectId);

  if (!current) {
    throw new Error("Equipamento não encontrado.");
  }

  await deleteEngineeringEquipmentRepository(id);

  await registerProjectEvent({
    projectId,
    type: "PROJECT_UPDATED",
    title: "Equipamento removido",
    description: `${current.manufacturer ?? ""} ${current.model ?? current.type}`.trim(),
  });

  return current;
}