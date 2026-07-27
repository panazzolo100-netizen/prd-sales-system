import { AppLayout } from "@/components/layout/AppLayout";
import { getCurrentUserAccess } from "@/services/auth.service";
import { listCompanyLeads } from "@/services/leads.service";

import { PipelineBoard } from "./PipelineBoard";

export default async function PipelinePage() {
  const [leads, user] = await Promise.all([
    listCompanyLeads(),
    getCurrentUserAccess(),
  ]);

  return (
    <AppLayout>
      <PipelineBoard
        initialLeads={leads}
        canArchive={user.role === "EXECUTIVO"}
      />
    </AppLayout>
  );
}
