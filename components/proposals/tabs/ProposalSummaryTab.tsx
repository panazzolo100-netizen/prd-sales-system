"use client";

import {
  Building2,
  CircleDollarSign,
  Gauge,
  MapPin,
  Phone,
  TrendingUp,
  UserRound,
  Zap,
} from "lucide-react";

import type { ProposalListItem } from "@/types/proposal";

type Props = {
  proposal: ProposalListItem;
};

function formatCurrency(
  value: number | null
) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value ?? 0);
}

export function ProposalSummaryTab({
  proposal,
}: Props) {
  const location = [
    proposal.lead?.city,
    proposal.lead?.state,
  ]
    .filter(Boolean)
    .join(" - ");

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-lg font-bold text-white">
          Dados do cliente
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <InfoCard
            icon={Building2}
            label="Empresa"
            value={
              proposal.lead
                ?.companyName ?? "-"
            }
          />

          <InfoCard
            icon={UserRound}
            label="Contato"
            value={
              proposal.lead
                ?.contactName ?? "-"
            }
          />

          <InfoCard
            icon={Phone}
            label="Telefone"
            value={
              proposal.lead?.phone ??
              "-"
            }
          />

          <InfoCard
            icon={MapPin}
            label="Localização"
            value={location || "-"}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-white">
          Indicadores da proposta
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <InfoCard
            icon={CircleDollarSign}
            label="Investimento"
            value={formatCurrency(
              proposal.amount
            )}
            highlight
          />

          <InfoCard
            icon={Zap}
            label="Potência instalada"
            value={
              proposal.systemPower
                ? `${proposal.systemPower} kWp`
                : "-"
            }
          />

          <InfoCard
            icon={TrendingUp}
            label="Economia mensal"
            value={formatCurrency(
              proposal.monthlySaving
            )}
          />

          <InfoCard
            icon={TrendingUp}
            label="Economia anual"
            value={formatCurrency(
              proposal.annualSaving
            )}
          />

          <InfoCard
            icon={Gauge}
            label="Payback estimado"
            value={
              proposal.payback
                ? `${proposal.payback} anos`
                : "-"
            }
          />
        </div>
      </section>
    </div>
  );
}

type InfoCardProps = {
  icon: typeof Building2;
  label: string;
  value: string;
  highlight?: boolean;
};

function InfoCard({
  icon: Icon,
  label,
  value,
  highlight = false,
}: InfoCardProps) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        highlight
          ? "border-orange-500/20 bg-orange-500/[0.05]"
          : "border-white/[0.07] bg-zinc-900/60"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            highlight
              ? "bg-orange-500/15 text-orange-400"
              : "bg-zinc-950 text-zinc-500"
          }`}
        >
          <Icon size={18} />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {label}
          </p>

          <p
            className={`mt-2 truncate text-lg font-bold ${
              highlight
                ? "text-orange-400"
                : "text-white"
            }`}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}