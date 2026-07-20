"use client";

import {
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { LeadStageBar } from "@/components/leads/LeadStageBar";
import {
  LeadTabs,
  type LeadTab,
} from "@/components/leads/LeadTabs";
import { Drawer } from "@/components/ui/Drawer";
import { LeadStatus } from "@/lib/generated/prisma/enums";
import type { LeadListItem } from "@/types/lead";

type Props = {
  lead: LeadListItem | null;
  open: boolean;
  initialTab?: LeadTab;
  onClose: () => void;

  onStatusChange?: (
    leadId: string,
    status: LeadStatus
  ) => void;
};

function formatCurrency(
  value: number | null
) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value ?? 0);
}

function getStatusLabel(
  status: LeadStatus
) {
  switch (status) {
    case LeadStatus.NOVO:
      return "Novo";

    case LeadStatus.CONTATO:
      return "Contato";

    case LeadStatus.VISITA:
      return "Visita";

    case LeadStatus.PROPOSTA:
      return "Proposta";

    case LeadStatus.NEGOCIACAO:
      return "Negociação";

    case LeadStatus.GANHO:
      return "Ganho";

    case LeadStatus.PERDIDO:
      return "Perdido";

    default:
      return status;
  }
}

export function LeadDetailsDrawer({
  lead,
  open,
  initialTab = "Resumo",
  onClose,
  onStatusChange,
}: Props) {
  const router = useRouter();

  const [
    currentStatus,
    setCurrentStatus,
  ] =
    useState<LeadStatus | null>(
      lead?.status ?? null
    );

  useEffect(() => {
    if (lead) {
      setCurrentStatus(
        lead.status
      );
    }
  }, [lead]);

  if (!lead || !currentStatus) {
    return null;
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      eyebrow="Oportunidade comercial"
      title={lead.companyName}
      description={lead.contactName}
      maxWidthClassName="max-w-5xl"
    >
      <LeadStageBar
        leadId={lead.id}
        currentStatus={currentStatus}
        onStatusChange={(status) => {
          setCurrentStatus(status);

          onStatusChange?.(
            lead.id,
            status
          );

          router.refresh();
        }}
      />

      <section className="grid gap-4 border-b border-white/[0.07] px-8 py-6 sm:grid-cols-2 xl:grid-cols-4">
        <LeadSummaryCard
          label="Status"
          value={getStatusLabel(
            currentStatus
          )}
          highlight
        />

        <LeadSummaryCard
          label="Telefone"
          value={lead.phone ?? "-"}
        />

        <LeadSummaryCard
          label="Cidade"
          value={
            lead.city
              ? `${lead.city}${
                  lead.state
                    ? ` - ${lead.state}`
                    : ""
                }`
              : "-"
          }
        />

        <LeadSummaryCard
          label="Valor estimado"
          value={formatCurrency(
            lead.estimatedValue
          )}
          highlight
        />
      </section>

      <LeadTabs
        lead={{
          ...lead,
          status: currentStatus,
        }}
        initialTab={initialTab}
      />
    </Drawer>
  );
}

type LeadSummaryCardProps = {
  label: string;
  value: string;
  highlight?: boolean;
};

function LeadSummaryCard({
  label,
  value,
  highlight = false,
}: LeadSummaryCardProps) {
  return (
    <div
      className={`rounded-2xl border p-4 transition hover:-translate-y-0.5 ${
        highlight
          ? "border-orange-500/15 bg-orange-500/[0.05]"
          : "border-white/[0.06] bg-zinc-900/70"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </p>

      <p
        className={`mt-2 truncate font-black ${
          highlight
            ? "text-xl text-orange-400"
            : "text-lg text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}