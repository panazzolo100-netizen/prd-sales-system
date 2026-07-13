"use client";

import type { LeadListItem } from "@/types/lead";

type Props = {
  lead: LeadListItem;
};

export function LeadSummaryTab({ lead }: Props) {
  return (
    <div className="grid grid-cols-2 gap-8">

      <div className="space-y-5">

        <div>
          <label className="mb-2 block text-sm text-zinc-500">
            Empresa
          </label>

          <input
            defaultValue={lead.companyName}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-zinc-500">
            Contato
          </label>

          <input
            defaultValue={lead.contactName}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-zinc-500">
            Telefone
          </label>

          <input
            defaultValue={lead.phone ?? ""}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-zinc-500">
            Cidade
          </label>

          <input
            defaultValue={lead.city ?? ""}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white"
          />
        </div>

      </div>

      <div className="space-y-5">

        <div>
          <label className="mb-2 block text-sm text-zinc-500">
            Consumo
          </label>

          <input
            defaultValue={lead.consumptionKwh ?? ""}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-zinc-500">
            Valor Estimado
          </label>

          <input
            defaultValue={lead.estimatedValue ?? ""}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-zinc-500">
            Status
          </label>

          <select className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white">
            <option>NOVO</option>
            <option>CONTATO</option>
            <option>PROPOSTA</option>
            <option>NEGOCIACAO</option>
            <option>GANHO</option>
            <option>PERDIDO</option>
          </select>
        </div>

      </div>

    </div>
  );
}