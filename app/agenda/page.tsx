import { AgendaPanel } from "@/components/agenda/AgendaPanel";
import { AppLayout } from "@/components/layout/AppLayout";
import { getAgendaData } from "@/services/agenda.service";

export default async function AgendaPage() {
  const [orders, users] = await getAgendaData();
  return <AppLayout><AgendaPanel orders={orders} users={users} /></AppLayout>;
}
