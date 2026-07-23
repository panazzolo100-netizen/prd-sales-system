import { AppLayout } from "@/components/layout/AppLayout";
import { NotificationsPage } from "@/components/notifications/NotificationsPage";
import { PageHeader } from "@/components/ui/erp";
export default function NotificationsRoute() { return <AppLayout><main><PageHeader eyebrow="Central operacional" title="Notificações" description="Prazos e pendências calculados com os dados atuais do ERP." /><NotificationsPage /></main></AppLayout>; }
