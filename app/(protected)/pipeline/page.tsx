import { AppLayout } from "@/components/layout/AppLayout";
import { listCompanyLeads } from "@/services/leads.service";

import { PipelineBoard } from "./PipelineBoard";

export default async function PipelinePage() {
  const leads = await listCompanyLeads();

  return (
    <AppLayout>
      <PipelineBoard initialLeads={leads} />
    </AppLayout>
  );
}