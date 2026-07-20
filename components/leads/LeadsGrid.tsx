import type { LeadListItem } from "@/types/lead";

import { LeadCard } from "@/components/leads/LeadCard";

type LeadsGridProps = {
  leads: LeadListItem[];
  onOpenLead(id: string): void;
};

export function LeadsGrid({
  leads,
  onOpenLead,
}: LeadsGridProps) {
  if (leads.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-zinc-800 bg-zinc-900/50 p-12 text-center">
        <h2 className="text-xl font-bold text-white">
          Nenhuma oportunidade encontrada
        </h2>

        <p className="mt-2 text-sm text-zinc-500">
          Altere os filtros ou cadastre uma nova oportunidade.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
      {leads.map((lead) => (
        <LeadCard
          key={lead.id}
          lead={lead}
          onOpen={onOpenLead}
        />
      ))}
    </div>
  );
}