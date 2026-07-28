import { AppLayout } from "@/components/layout/AppLayout";
import { getCurrentUserAccess } from "@/services/auth.service";
import {
  listCompanyLeadOwners,
  listCompanyLeads,
} from "@/services/leads.service";

import { PipelineBoard } from "./PipelineBoard";

export default async function PipelinePage() {
  const [leads, user, owners] =
    await Promise.all([
      listCompanyLeads(),
      getCurrentUserAccess(),
      listCompanyLeadOwners(),
    ]);

  return (
    <AppLayout>
      <PipelineBoard
        initialLeads={leads}
        availableOwners={owners}
        canArchive={
          user.role === "EXECUTIVO"
        }
      />
    </AppLayout>
  );
}