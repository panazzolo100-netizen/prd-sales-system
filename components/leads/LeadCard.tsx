import {
  ArrowRight,
  Bolt,
  Flame,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";

import type { LeadListItem } from "@/types/lead";

interface LeadCardProps {
  lead: LeadListItem;
  onOpen(id: string): void;
}

function formatCurrency(value: number | null) {
  if (!value) return "R$ 0,00";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatConsumption(value: number | null) {
  if (!value) return "Não informado";

  return `${value.toLocaleString("pt-BR")} kWh`;
}

function formatLocation(
  city: string | null,
  state: string | null
) {
  if (!city && !state) return "Local não informado";

  if (city && state) {
    return `${city} - ${state}`;
  }

  return city ?? state ?? "";
}

function getTemperature(
  value: number | null
) {
  if (!value) {
    return {
      label: "Novo",
      color:
        "bg-zinc-700 text-zinc-300",
    };
  }

  if (value >= 250000) {
    return {
      label: "Quente",
      color:
        "bg-red-500/20 text-red-400",
    };
  }

  if (value >= 80000) {
    return {
      label: "Morno",
      color:
        "bg-orange-500/20 text-orange-400",
    };
  }

  return {
    label: "Frio",
    color:
      "bg-cyan-500/20 text-cyan-400",
  };
}

export function LeadCard({
  lead,
  onOpen,
}: LeadCardProps) {
  const temperatura =
    getTemperature(
      lead.estimatedValue
    );

  return (
    <div className="group rounded-3xl border border-white/5 bg-zinc-900 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/30 hover:shadow-xl hover:shadow-orange-500/10">

      <div className="flex items-start justify-between">

        <div>

          <h2 className="text-xl font-bold text-white">
            {lead.companyName}
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            {lead.contactName}
          </p>

        </div>

        <div className="space-y-2 text-right">

          <span
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${temperatura.color}`}
          >
            <Flame size={12} />

            {temperatura.label}
          </span>

          <div>

            <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white">
              {lead.status}
            </span>

          </div>

        </div>

      </div>

      <div className="mt-6 space-y-3 text-sm">

        <div className="flex items-center gap-3 text-zinc-300">

          <Phone size={16} />

          {lead.phone ?? "Sem telefone"}

        </div>

        <div className="flex items-center gap-3 text-zinc-300">

          <MapPin size={16} />

          {formatLocation(
            lead.city,
            lead.state
          )}

        </div>

        <div className="flex items-center gap-3 text-zinc-300">

          <Bolt size={16} />

          {formatConsumption(
            lead.consumptionKwh
          )}

        </div>

      </div>

      <div className="mt-6 border-t border-zinc-800 pt-5">

        <p className="text-xs uppercase tracking-wider text-zinc-500">
          Valor estimado
        </p>

        <h3 className="mt-2 text-3xl font-black text-orange-400">
          {formatCurrency(
            lead.estimatedValue
          )}
        </h3>

      </div>

      <div className="mt-6 flex items-center gap-2">

        <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700 text-zinc-400 transition hover:border-orange-500 hover:text-orange-400">

          <Phone size={16} />

        </button>

        <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700 text-zinc-400 transition hover:border-orange-500 hover:text-orange-400">

          <MessageCircle size={16} />

        </button>

        <button
          onClick={() =>
            onOpen(lead.id)
          }
          className="ml-auto flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 font-semibold text-white transition hover:bg-orange-600"
        >

          Abrir

          <ArrowRight size={16} />

        </button>

      </div>

    </div>
  );
}