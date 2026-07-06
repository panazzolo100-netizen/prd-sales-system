import { Lead } from "@/types/lead";
import { LeadStatusButton } from "./LeadStatusButton";

const statusDisponiveis = ["Contato", "Proposta", "Ganho", "Perdido"];

export function LeadCard({ lead }: { lead: Lead }) {
  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-800 p-4 shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold">{lead.nome}</h3>
          <p className="text-sm text-zinc-500">Lead comercial</p>
        </div>

        <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-bold">
          {lead.status}
        </span>
      </div>

      <div className="mt-4 space-y-1 text-sm text-zinc-300">
        <p>📞 {lead.telefone || "-"}</p>
        <p>📧 {lead.email || "-"}</p>
        <p>📍 {lead.cidade || "-"}</p>
        <p className="text-orange-400">Origem: {lead.origem || "-"}</p>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {statusDisponiveis
          .filter((status) => status !== lead.status)
          .map((status) => (
            <LeadStatusButton key={status} id={lead.id} status={status} />
          ))}
      </div>
    </div>
  );
}