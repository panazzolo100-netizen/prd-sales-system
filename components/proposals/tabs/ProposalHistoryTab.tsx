"use client";

import {
  CheckCircle2,
  Clock3,
  FileText,
} from "lucide-react";

import type { ProposalListItem } from "@/types/proposal";

type Props = {
  proposal: ProposalListItem;
};

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle: "long",
      timeStyle: "short",
    }
  ).format(new Date(value));
}

export function ProposalHistoryTab({
  proposal,
}: Props) {
  return (
    <div className="space-y-4">
      <HistoryItem
        icon={FileText}
        title="Proposta criada"
        description="A proposta comercial foi cadastrada no sistema."
        date={formatDate(
          proposal.createdAt
        )}
      />

      {proposal.updatedAt && (
        <HistoryItem
          icon={Clock3}
          title="Última atualização"
          description="Os dados comerciais da proposta foram atualizados."
          date={formatDate(
            proposal.updatedAt
          )}
        />
      )}

      {proposal.status.toUpperCase() ===
        "APROVADA" && (
        <HistoryItem
          icon={CheckCircle2}
          title="Proposta aprovada"
          description="A proposta está marcada como aprovada."
          date="Status atual"
          success
        />
      )}
    </div>
  );
}

type HistoryItemProps = {
  icon: typeof FileText;
  title: string;
  description: string;
  date: string;
  success?: boolean;
};

function HistoryItem({
  icon: Icon,
  title,
  description,
  date,
  success = false,
}: HistoryItemProps) {
  return (
    <div className="flex gap-4 rounded-2xl border border-white/[0.07] bg-zinc-900/60 p-5">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          success
            ? "bg-emerald-500/10 text-emerald-400"
            : "bg-zinc-950 text-zinc-500"
        }`}
      >
        <Icon size={18} />
      </div>

      <div>
        <h3 className="font-bold text-white">
          {title}
        </h3>

        <p className="mt-1 text-sm text-zinc-400">
          {description}
        </p>

        <p className="mt-3 text-xs text-zinc-600">
          {date}
        </p>
      </div>
    </div>
  );
}