import { ClientsClient } from "@/components/clients/ClientsClient";
import { AppLayout } from "@/components/layout/AppLayout";
import { listCompanyClients } from "@/services/clients.service";

export default async function ClientesPage() {
  const clients =
    await listCompanyClients();

  return (
    <AppLayout>
      <ClientsClient
        initialClients={clients}
      />
    </AppLayout>
  );
}