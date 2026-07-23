export type NotificationPriority = "CRITICAL" | "WARNING" | "INFO";
export type SystemNotification = {
  id: string;
  priority: NotificationPriority;
  type: "SERVICE_ORDER" | "INSTALLMENT" | "CASH_FLOW" | "PROJECT";
  title: string;
  description: string;
  dueDate: string;
  href: string;
};
