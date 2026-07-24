import { PERMISSIONS } from "@/lib/auth/permissions";
import { requirePermission } from "@/services/auth.service";
async function getCurrentCompanyId() {
  return (await requirePermission(PERMISSIONS.DASHBOARD_COMMERCIAL)).companyId;
}
import { findNotificationSources } from "@/repositories/notifications.repository";
import type { SystemNotification } from "@/types/notification";

const money = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export async function listNotifications(limit?: number) {
  const companyId = await getCurrentCompanyId();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  const upcomingLimit = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4);
  const [orders, installments, cashFlow, projects] = await findNotificationSources(companyId, today, upcomingLimit);
  const notifications: SystemNotification[] = [];

  for (const order of orders) {
    const dueDate = order.scheduledDate!;
    const completed = [order.checklistArt, order.checklistProjectApproved, order.checklistMaterialsSeparated, order.checklistStructureInstalled, order.checklistModulesInstalled, order.checklistInverterInstalled, order.checklistDcCabling, order.checklistAcCabling, order.checklistCommissioning, order.checklistCustomerTraining, order.checklistDelivered].filter(Boolean).length;
    const overdue = dueDate < today; const dueToday = dueDate >= today && dueDate < tomorrow;
    notifications.push({ id: `os-${order.id}`, priority: overdue ? "CRITICAL" : dueToday ? "WARNING" : "INFO", type: "SERVICE_ORDER", title: overdue ? "Ordem de Serviço atrasada" : dueToday ? "OS vence hoje" : "OS próxima do prazo", description: `${order.number} • ${order.project.client.name} • checklist ${completed}/11`, dueDate: dueDate.toISOString(), href: `/os/${order.id}` });
    if (!overdue && completed < 11) notifications.push({ id: `checklist-${order.id}`, priority: dueToday ? "CRITICAL" : "WARNING", type: "SERVICE_ORDER", title: "Checklist incompleto próximo do prazo", description: `${order.number} possui ${11 - completed} item(ns) pendente(s).`, dueDate: dueDate.toISOString(), href: `/os/${order.id}` });
  }
  for (const item of installments) notifications.push({ id: `installment-${item.id}`, priority: "CRITICAL", type: "INSTALLMENT", title: "Parcela financeira vencida", description: `${item.financial.project.client.name} • ${item.description ?? `Parcela ${item.number}`} • ${money(item.value)}`, dueDate: item.dueDate.toISOString(), href: "/financeiro" });
  for (const item of cashFlow) notifications.push({ id: `cash-${item.id}`, priority: "CRITICAL", type: "CASH_FLOW", title: item.type === "SAIDA" ? "Conta a pagar vencida" : "Conta a receber vencida", description: `${item.description} • ${money(item.value)}`, dueDate: item.dueDate!.toISOString(), href: "/financeiro/fluxo-caixa" });
  for (const project of projects) notifications.push({ id: `project-${project.id}`, priority: "WARNING", type: "PROJECT", title: "Projeto aguardando resolução", description: `${project.title} • ${project.client.name}`, dueDate: project.updatedAt.toISOString(), href: `/projetos?projeto=${project.id}` });

  const weight = { CRITICAL: 0, WARNING: 1, INFO: 2 };
  notifications.sort((a, b) => weight[a.priority] - weight[b.priority] || new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  return { notifications: limit ? notifications.slice(0, limit) : notifications, total: notifications.length, counts: { critical: notifications.filter((item) => item.priority === "CRITICAL").length, warning: notifications.filter((item) => item.priority === "WARNING").length, info: notifications.filter((item) => item.priority === "INFO").length } };
}
