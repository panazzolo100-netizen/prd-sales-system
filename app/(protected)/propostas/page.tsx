import { AppLayout } from "@/components/layout/AppLayout";
import { ProposalsClient } from "@/components/proposals/ProposalsClient";
import { listCompanyProposals } from "@/services/proposals.service";

export default async function PropostasPage() {
  const proposals =
    await listCompanyProposals();

  return (
    <AppLayout>
      <ProposalsClient
        initialProposals={proposals}
      />
    </AppLayout>
  );
}