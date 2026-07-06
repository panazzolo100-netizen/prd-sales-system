import { AppLayout } from "@/components/layout/AppLayout";
import { LeadForm } from "@/components/lead/LeadForm";
import { LeadCard } from "@/components/lead/LeadCard";
import { getLeads } from "@/services/leads";

const colunas = ["Novo", "Contato", "Proposta", "Ganho", "Perdido"] as const;

export default async function LeadsPage() {
  const leads = await getLeads();

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Leads</h1>
        <p className="text-zinc-400">CRM Comercial • PRD Engenharia</p>
      </div>

      <LeadForm />

      <div className="mt-10 grid grid-cols-5 gap-5">
        {colunas.map((status) => (
          <div
            key={status}
            className="rounded-2xl border border-zinc-800 bg-zinc-900"
          >
            <div className="border-b border-zinc-800 p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold">{status}</h2>
                <span className="rounded-full bg-orange-500 px-2 py-1 text-xs font-bold">
                  {leads.filter((lead) => lead.status === status).length}
                </span>
              </div>
            </div>

            <div className="space-y-4 p-4">
              {leads
                .filter((lead) => lead.status === status)
                .map((lead) => (
                  <LeadCard key={lead.id} lead={lead} />
                ))}
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}