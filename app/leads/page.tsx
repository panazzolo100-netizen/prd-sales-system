import { AppLayout } from "@/components/layout/AppLayout";
import { LeadsClient } from "@/components/leads/LeadsClient";
import { getLeads } from "@/services/leads";
import type { LeadListItem } from "@/types/lead";

export default async function LeadsPage() {
  const leads = (await getLeads()) as LeadListItem[];

  return (
    <AppLayout>
      <LeadsClient leads={leads} />
    </AppLayout>
  );
}