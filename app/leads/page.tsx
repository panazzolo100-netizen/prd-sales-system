import { AppLayout } from "../../components/AppLayout";
import { LeadForm } from "../../components/LeadForm";

async function buscarLeads() {
  const res = await fetch("http://localhost:3000/api/leads", {
    cache: "no-store",
  });

  if (!res.ok) return [];

  return res.json();
}

export default async function Leads() {
  const leads = await buscarLeads();

  const colunas = ["Novo", "Contato", "Proposta", "Ganho", "Perdido"];

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Leads</h1>
        <p className="mt-2 text-zinc-400">
          Funil comercial da PRD Engenharia.
        </p>
      </div>

      <LeadForm />

      <div className="mt-10 grid grid-cols-5 gap-5">
        {colunas.map((coluna) => (
          <div
            key={coluna}
            className="min-h-[500px] rounded-2xl border border-zinc-800 bg-zinc-900 p-4"
          >
            <h2 className="mb-4 text-lg font-bold">{coluna}</h2>

            <div className="space-y-3">
              {leads
                .filter((lead: any) => lead.status === coluna)
                .map((lead: any) => (
                  <div
                    key={lead.id}
                    className="rounded-xl border border-zinc-700 bg-zinc-800 p-4"
                  >
                    <h3 className="font-bold">{lead.nome}</h3>
                    <p className="mt-1 text-sm text-zinc-400">
                      📞 {lead.telefone}
                    </p>
                    <p className="text-sm text-zinc-400">
                      📍 {lead.cidade}
                    </p>
                    <p className="text-sm text-orange-400">
                      {lead.origem}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}