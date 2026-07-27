"use client";

import { KanbanBoard, type KanbanColumn } from "@/components/kanban/KanbanBoard";

type Order = {
  id: string; number: string; status: string; scheduledDate: Date | string | null; responsible: string | null; updatedAt: Date | string;
  customerSignature: string | null; technicianSignature: string | null; project: { client: { name: string } };
  checklistArt: boolean; checklistProjectApproved: boolean; checklistMaterialsSeparated: boolean;
  checklistStructureInstalled: boolean; checklistModulesInstalled: boolean; checklistInverterInstalled: boolean;
  checklistDcCabling: boolean; checklistAcCabling: boolean; checklistCommissioning: boolean;
  checklistCustomerTraining: boolean; checklistDelivered: boolean;
};

const columns: KanbanColumn[] = [
  { id: "open", label: "Abertas / Agendadas", statuses: ["ABERTA", "AGENDADA"], moveStatus: "AGENDADA", tone: "sky" },
  { id: "doing", label: "Em execução", statuses: ["EM_ANDAMENTO"], moveStatus: "EM_ANDAMENTO", tone: "orange" },
  { id: "signature", label: "Aguardando assinatura", statuses: ["AGUARDANDO_ASSINATURA"], moveStatus: "AGUARDANDO_ASSINATURA", tone: "amber" },
  { id: "done", label: "Concluídas", statuses: ["CONCLUIDA"], moveStatus: "CONCLUIDA", tone: "green" },
  { id: "archive", label: "Canceladas", statuses: ["CANCELADA"], tone: "red" },
];

export function ServiceOrdersKanban({ orders, action }: { orders: Order[]; action: React.ReactNode }) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return <KanbanBoard
    eyebrow="Operação / Ordens de Serviço" title="Ordens de Serviço" description="Agenda, execução e assinaturas em um quadro operacional."
    action={action} columns={columns} statusEndpoint={(id) => `/api/os/${id}/status`}
    items={orders.map((order) => {
      const signatures = Number(Boolean(order.customerSignature)) + Number(Boolean(order.technicianSignature));
      const executionComplete = [
        order.checklistArt, order.checklistProjectApproved, order.checklistMaterialsSeparated,
        order.checklistStructureInstalled, order.checklistModulesInstalled, order.checklistInverterInstalled,
        order.checklistDcCabling, order.checklistAcCabling, order.checklistCommissioning,
        order.checklistCustomerTraining, order.checklistDelivered,
      ].every(Boolean);
      const derivedStatus = order.status === "EM_ANDAMENTO" && executionComplete && signatures < 2 ? "AGUARDANDO_ASSINATURA" : order.status;
      return {
        id: order.id, status: derivedStatus, title: order.number, subtitle: order.project.client.name,
        meta: `Assinaturas ${signatures}/2`, detail: order.responsible ?? "Sem responsável",
        updatedAt: order.updatedAt, href: `/os/${order.id}`, movable: order.status !== "CANCELADA",
        overdue: Boolean(order.scheduledDate && new Date(order.scheduledDate) < today && order.status !== "CONCLUIDA"),
      };
    })}
  />;
}
