import {
  completeServiceOrderProject,
  createServiceOrderRepository,
  findProjectForServiceOrder,
  findServiceOrderChecklist,
  findServiceOrderForUpdate,
  findServiceOrderSignatures,
  updateServiceOrderChecklist,
  updateServiceOrderRepository,
  updateServiceOrderSignatures,
} from "@/repositories/service-orders.repository";

import { registerServiceOrderEvent } from "@/services/service-order-timeline.service";

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

  const scheduledDate = data.scheduledDate ?? null;

  const serviceOrder =
    await createServiceOrderRepository({
      number: `OS-${Date.now()}`,
      title: data.title.trim(),
      status: scheduledDate ? "AGENDADA" : "ABERTA",
      responsible: data.responsible?.trim() || null,
      scheduledDate,
      services: data.services?.trim() || null,
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
  const current = await findServiceOrderForUpdate(
    data.id
  );

  if (!current) {
    throw new Error(
      "Ordem de Serviço não encontrada."
    );
  }

  const responsible =
    data.responsible?.trim() || null;

  const team = data.team?.trim() || null;

  const updated =
    await updateServiceOrderRepository(
      data.id,
      {
        status: data.status,
        responsible,
        team,
        scheduledDate:
          data.scheduledDate ?? null,
        services:
          data.services?.trim() || null,
        materials:
          data.materials?.trim() || null,
        notes:
          data.notes?.trim() || null,
        startedDate:
          data.status === "EM_ANDAMENTO" &&
          !current.startedDate
            ? new Date()
            : current.startedDate,
        completedDate:
          data.status === "CONCLUIDA"
            ? current.completedDate ?? new Date()
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

  if (current.responsible !== responsible) {
    await registerServiceOrderEvent({
      serviceOrderId: data.id,
      type: "RESPONSAVEL_ALTERADO",
      title: "Responsável alterado",
      description:
        responsible ?? "Responsável removido",
    });
  }

  if (current.team !== team) {
    await registerServiceOrderEvent({
      serviceOrderId: data.id,
      type: "EQUIPE_ALTERADA",
      title: "Equipe alterada",
      description: team ?? "Equipe removida",
    });
  }

  if (
    data.status === "CONCLUIDA" &&
    current.status !== "CONCLUIDA"
  ) {
    await completeServiceOrderProject(
      current.projectId
    );

    await registerServiceOrderEvent({
      serviceOrderId: data.id,
      type: "OS_CONCLUIDA",
      title: "Ordem de Serviço concluída",
      description: "A execução foi finalizada.",
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
  const current =
    await findServiceOrderChecklist(id);

  if (!current) {
    throw new Error(
      "Ordem de Serviço não encontrada."
    );
  }

  const completed =
    Object.values(checklist).every(Boolean);

  const updated =
    await updateServiceOrderChecklist(id, {
      ...checklist,
      status: completed
        ? "CONCLUIDA"
        : undefined,
      completedDate: completed
        ? new Date()
        : undefined,
    });

  const changedItems = Object.entries(
    checklist
  ).filter(([key, value]) => {
    return (
      current[
        key as keyof ChecklistData
      ] !== value
    );
  });

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
    );

    await registerServiceOrderEvent({
      serviceOrderId: id,
      type: "OS_CONCLUIDA",
      title: "Ordem de Serviço concluída",
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
  const current =
    await findServiceOrderSignatures(data.id);

  if (!current) {
    throw new Error(
      "Ordem de Serviço não encontrada."
    );
  }

  const customerName =
    data.customerName?.trim() || null;

  const customerDocument =
    data.customerDocument?.trim() || null;

  const customerSignature =
    data.customerSignature || null;

  const technicianName =
    data.technicianName?.trim() || null;

  const technicianSignature =
    data.technicianSignature || null;

  const hasSignature =
    Boolean(customerSignature) ||
    Boolean(technicianSignature);

  const updated =
    await updateServiceOrderSignatures(
      data.id,
      {
        customerName,
        customerDocument,
        customerSignature,
        technicianName,
        technicianSignature,
        signedAt: hasSignature
          ? current.signedAt ?? new Date()
          : null,
      }
    );

  if (
    customerSignature &&
    customerSignature !==
      current.customerSignature
  ) {
    await registerServiceOrderEvent({
      serviceOrderId: data.id,
      type: "CLIENTE_ASSINOU",
      title: "Cliente assinou a OS",
      description:
        customerName ??
        "Assinatura do cliente registrada.",
    });
  }

  if (
    technicianSignature &&
    technicianSignature !==
      current.technicianSignature
  ) {
    await registerServiceOrderEvent({
      serviceOrderId: data.id,
      type: "TECNICO_ASSINOU",
      title: "Técnico assinou a OS",
      description:
        technicianName ??
        "Assinatura do técnico registrada.",
    });
  }

  return updated;
}