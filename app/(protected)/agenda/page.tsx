import { AgendaPanel } from "@/components/agenda/AgendaPanel";
import { AppLayout } from "@/components/layout/AppLayout";
import { getAgendaData } from "@/services/agenda.service";

export default async function AgendaPage() {
  const data = await getAgendaData();

  return (
    <AppLayout>
      <AgendaPanel initialData={data} />
    </AppLayout>
  );
}