import {
  completeServiceOrderProject,
  createServiceOrderRepository,
  findAvailableProjectsForServiceOrder,
  findProjectForServiceOrder,
  findServiceOrderChecklist,
  findServiceOrderForPdf,
  findServiceOrderDashboard,
  findServiceOrderForUpdate,
  findServiceOrdersByCompany,
  updateServiceOrderChecklist,
  updateServiceOrderRepository,
} from "@/repositories/service-orders.repository";
import { getCurrentCompanyId } from "@/lib/auth/current-user";

import { registerServiceOrderEvent } from "@/services/service-order-timeline.service";
import { isSolarService, serviceTypeLabel } from "@/lib/opportunity-service-types";
import {
  prepareServiceDetails,
  prepareTechnicalDetailRows,
  resolveServiceType,
} from "@/lib/service-technical-details";
import {
  toServiceOrderPhotoResponse,
  toServiceOrderPhotoResponses,
} from "@/services/service-order-photos.service";
import {
  createSignatureAccessUrl,
  saveServiceOrderSignatures,
} from "@/services/service-order-signatures.service";

type ChecklistData = {
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
};

export async function listServiceOrders(
  companyId: string
) {
  return findServiceOrdersByCompany(companyId);
}

export async function listAvailableProjectsForServiceOrder(
  companyId: string
) {
  return findAvailableProjectsForServiceOrder(
    companyId
  );
}

export async function createServiceOrderData(data: {
  projectId: string;
  companyId: string;
  title: string;
  responsible?: string | null;
  scheduledDate?: Date | null;
  services?: string | null;
}) {
  const project = await findProjectForServiceOrder(
    data.projectId,
    data.companyId
  );

  if (!project) {
    throw new Error("Projeto não encontrado.");
  }

  if (project.serviceOrder) {
    throw new Error(
      "Este projeto já possui uma Ordem de Serviço."
    );
  }

  const scheduledDate =
    data.scheduledDate ?? null;

  const serviceOrder =
    await createServiceOrderRepository({
      title: data.title.trim(),
      status: scheduledDate
        ? "AGENDADA"
        : "ABERTA",
      responsible:
        data.responsible?.trim() || null,
      scheduledDate,
      services:
        data.services?.trim() || null,
      companyId: data.companyId,
      projectId: data.projectId,
    });

  await registerServiceOrderEvent({
    serviceOrderId: serviceOrder.id,
    type: "OS_CRIADA",
    title: "Ordem de Serviço criada",
    description: `${serviceOrder.number} — ${serviceOrder.title}`,
  });

  return serviceOrder;
}

export async function updateServiceOrderData(data: {
  id: string;
  status: string;
  responsible?: string | null;
  team?: string | null;
  scheduledDate?: Date | null;
  services?: string | null;
  materials?: string | null;
  notes?: string | null;
}) {
  const companyId = await getCurrentCompanyId();
  const current =
    await findServiceOrderForUpdate(data.id, companyId);

  if (!current) {
    throw new Error(
      "Ordem de Serviço não encontrada."
    );
  }

  const responsible =
    data.responsible?.trim() || null;

  const team = data.team?.trim() || null;

  const scheduledDate = data.scheduledDate ?? null;
  const services = data.services?.trim() || null;
  const materials = data.materials?.trim() || null;
  const notes = data.notes?.trim() || null;

  const updated =
    await updateServiceOrderRepository(
      data.id,
      companyId,
      {
        status: data.status,
        responsible,
        team,
        scheduledDate,
        services,
        materials,
        notes,
        startedDate:
          data.status === "EM_ANDAMENTO" &&
          !current.startedDate
            ? new Date()
            : current.startedDate,
        completedDate:
          data.status === "CONCLUIDA"
            ? current.completedDate ??
              new Date()
            : null,
      }
    );

  if (current.status !== data.status) {
    await registerServiceOrderEvent({
      serviceOrderId: data.id,
      type: "STATUS_ALTERADO",
      title: "Status alterado",
      description: `${current.status} → ${data.status}`,
    });
  }

  if (
    current.responsible !== responsible
  ) {
    await registerServiceOrderEvent({
      serviceOrderId: data.id,
      type: "RESPONSAVEL_ALTERADO",
      title: "Responsável alterado",
      description:
        responsible ??
        "Responsável removido",
    });
  }

  if (current.team !== team) {
    await registerServiceOrderEvent({
      serviceOrderId: data.id,
      type: "EQUIPE_ALTERADA",
      title: "Equipe alterada",
      description:
        team ?? "Equipe removida",
    });
  }

  const operationalDataChanged =
    current.scheduledDate?.getTime() !== scheduledDate?.getTime() ||
    current.services !== services ||
    current.materials !== materials ||
    current.notes !== notes;

  if (operationalDataChanged) {
    await registerServiceOrderEvent({
      serviceOrderId: data.id,
      type: "OS_ATUALIZADA",
      title: "Ordem de Serviço atualizada",
      description:
        "Agenda ou informações operacionais da ordem foram atualizadas.",
    });
  }

  if (
    data.status === "CONCLUIDA" &&
    current.status !== "CONCLUIDA"
  ) {
    await completeServiceOrderProject(
      current.projectId
      , companyId
    );

    await registerServiceOrderEvent({
      serviceOrderId: data.id,
      type: "OS_CONCLUIDA",
      title:
        "Ordem de Serviço concluída",
      description:
        "A execução foi finalizada.",
    });

    await registerServiceOrderEvent({
      serviceOrderId: data.id,
      type: "PROJETO_CONCLUIDO",
      title: "Projeto concluído",
      description:
        "O projeto foi atualizado automaticamente.",
    });
  }

  return updated;
}

export async function updateServiceOrderChecklistData(
  id: string,
  checklist: ChecklistData
) {
  const companyId = await getCurrentCompanyId();
  const current =
    await findServiceOrderChecklist(id, companyId);

  if (!current) {
    throw new Error(
      "Ordem de Serviço não encontrada."
    );
  }

  const completed =
    Object.values(checklist).every(Boolean);

  const updated =
    await updateServiceOrderChecklist(id, companyId, {
      ...checklist,
      status: completed
        ? "CONCLUIDA"
        : undefined,
      completedDate: completed
        ? new Date()
        : undefined,
    });

  const changedItems =
    Object.entries(checklist).filter(
      ([key, value]) => {
        return (
          current[
            key as keyof ChecklistData
          ] !== value
        );
      }
    );

  if (changedItems.length > 0) {
    await registerServiceOrderEvent({
      serviceOrderId: id,
      type: "CHECKLIST_ALTERADO",
      title: "Checklist atualizado",
      description: `${changedItems.length} item(ns) alterado(s).`,
    });
  }

  if (
    completed &&
    current.status !== "CONCLUIDA"
  ) {
    await completeServiceOrderProject(
      current.projectId
      , companyId
    );

    await registerServiceOrderEvent({
      serviceOrderId: id,
      type: "OS_CONCLUIDA",
      title:
        "Ordem de Serviço concluída",
      description:
        "Todas as etapas do checklist foram concluídas.",
    });

    await registerServiceOrderEvent({
      serviceOrderId: id,
      type: "PROJETO_CONCLUIDO",
      title: "Projeto concluído",
      description:
        "O projeto foi concluído automaticamente.",
    });
  }

  return updated;
}

export async function updateServiceOrderSignaturesData(
  data: {
    id: string;
    customerName?: string | null;
    customerDocument?: string | null;
    customerSignature?: string | null;
    technicianName?: string | null;
    technicianSignature?: string | null;
  }
) {
  return saveServiceOrderSignatures(data);
}

export async function getServiceOrderPdfData(
  id: string
) {
  const companyId = await getCurrentCompanyId();
  const serviceOrder =
    await findServiceOrderForPdf(id, companyId);

  if (!serviceOrder) {
    throw new Error(
      "Ordem de Serviço não encontrada."
    );
  }

  const serviceType = resolveServiceType({
    leadServiceType: serviceOrder.project.client.lead?.serviceType,
    projectServiceType: serviceOrder.project.serviceType,
  });
  const details = prepareServiceDetails({
    serviceType,
    serviceDetails: serviceOrder.project.client.lead?.serviceDetails,
    legacyEngineering: serviceOrder.project.client.lead?.engineering,
  });
  const legacyChecklist = [
    ["ART emitida", serviceOrder.checklistArt],
    ["Projeto aprovado", serviceOrder.checklistProjectApproved],
    ["Materiais separados", serviceOrder.checklistMaterialsSeparated],
    ["Estrutura instalada", serviceOrder.checklistStructureInstalled],
    ["Módulos instalados", serviceOrder.checklistModulesInstalled],
    ["Inversor instalado", serviceOrder.checklistInverterInstalled],
    ["Cabeamento CC", serviceOrder.checklistDcCabling],
    ["Cabeamento CA", serviceOrder.checklistAcCabling],
    ["Comissionamento", serviceOrder.checklistCommissioning],
    ["Treinamento do cliente", serviceOrder.checklistCustomerTraining],
    ["Entrega concluída", serviceOrder.checklistDelivered],
  ] as const;
  const checklist = isSolarService(serviceType)
    ? legacyChecklist.map(([description, completed]) => ({
        description,
        status: completed ? "CONCLUIDO" : "PENDENTE",
        observation: null,
        responsible: null,
        completedAt: null,
      }))
    : serviceOrder.project.stages.map((stage) => ({
        description: stage.title,
        status: stage.completed ? "CONCLUIDO" : "PENDENTE",
        observation: stage.notes,
        responsible: stage.responsible,
        completedAt: null,
      }));
  const completedStages = serviceOrder.project.stages
    .filter((stage) => stage.completed)
    .map((stage) => stage.title);

  return {
    ...serviceOrder,
    photos: await toServiceOrderPhotoResponses(serviceOrder.photos, companyId),
    customerSignatureStorageReference: serviceOrder.customerSignature,
    technicianSignatureStorageReference: serviceOrder.technicianSignature,
    customerSignature: await createSignatureAccessUrl(
      serviceOrder.customerSignature,
      companyId,
      serviceOrder.id
    ),
    technicianSignature: await createSignatureAccessUrl(
      serviceOrder.technicianSignature,
      companyId,
      serviceOrder.id
    ),
    serviceType,
    serviceTypeLabel: serviceTypeLabel(serviceType),
    technicalDetails: prepareTechnicalDetailRows(serviceType, details),
    checklist,
    executedServices:
      completedStages.length > 0 ? completedStages.join("; ") : null,
    documentsCount: serviceOrder.project._count.documents,
  };
}

export async function getPublicServiceOrderValidationData(
  id: string
) {
  const serviceOrder =
    await findServiceOrderForPdf(id);

  if (!serviceOrder) {
    return null;
  }

  return {
    id: serviceOrder.id,
    number: serviceOrder.number,
    title: serviceOrder.title,
    status: serviceOrder.status,
    responsible:
      serviceOrder.responsible,
    scheduledDate:
      serviceOrder.scheduledDate,
    completedDate:
      serviceOrder.completedDate,
    services: serviceOrder.services,

    checklistArt:
      serviceOrder.checklistArt,
    checklistProjectApproved:
      serviceOrder
        .checklistProjectApproved,
    checklistMaterialsSeparated:
      serviceOrder
        .checklistMaterialsSeparated,
    checklistStructureInstalled:
      serviceOrder
        .checklistStructureInstalled,
    checklistModulesInstalled:
      serviceOrder
        .checklistModulesInstalled,
    checklistInverterInstalled:
      serviceOrder
        .checklistInverterInstalled,
    checklistDcCabling:
      serviceOrder.checklistDcCabling,
    checklistAcCabling:
      serviceOrder.checklistAcCabling,
    checklistCommissioning:
      serviceOrder
        .checklistCommissioning,
    checklistCustomerTraining:
      serviceOrder
        .checklistCustomerTraining,
    checklistDelivered:
      serviceOrder.checklistDelivered,

    customerSignature:
      serviceOrder.customerSignature ? "present" : null,
    technicianSignature:
      serviceOrder.technicianSignature ? "present" : null,
    signedAt: serviceOrder.signedAt,

    photosCount:
      serviceOrder.photos.length,

    project: {
      title:
        serviceOrder.project.title,

      client: {
        name:
          serviceOrder.project.client
            .name,
      },
    },
  };
}

export async function getCompanyServiceOrderDashboard(id: string) {
  const companyId = await getCurrentCompanyId();
  const dashboard = await findServiceOrderDashboard(id, companyId);

  if (!dashboard) {
    throw new Error("Ordem de Serviço não encontrada.");
  }

  return {
    photoCount: dashboard._count.photos,
    recentPhotos: await Promise.all(
      dashboard.photos.map((photo) => toServiceOrderPhotoResponse(photo, companyId))
    ),
    recentEvents: dashboard.timeline,
  };
}
