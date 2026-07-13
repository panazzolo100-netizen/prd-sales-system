"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import type { LeadListItem } from "@/types/lead";
import { LeadStatus } from "@/lib/generated/prisma/enums";
import { LeadStageBar } from "@/components/leads/LeadStageBar";
import { LeadTabs } from "@/components/leads/LeadTabs";

type Props = {
  lead: LeadListItem | null;
  open: boolean;
  onClose: () => void;
};

export function LeadDetailsDrawer({ lead, open, onClose }: Props) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState<LeadStatus | null>(null);

  useEffect(() => {
    if (lead) setCurrentStatus(lead.status);
  }, [lead]);

  if (!open || !lead || !currentStatus) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="h-full w-full max-w-5xl overflow-y-auto border-l border-zinc-800 bg-zinc-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold text-white">{lead.companyName}</h1>
            <p className="mt-1 text-zinc-400">{lead.contactName}</p>
          </div>

          <button type="button" onClick={onClose} className="rounded-lg p-2 transition hover:bg-zinc-800">
            <X className="text-white" />
          </button>
        </div>

        <LeadStageBar
          leadId={lead.id}
          currentStatus={currentStatus}
          onStatusChange={(status) => {
            setCurrentStatus(status);
            router.refresh();
          }}
        />

        <div className="grid grid-cols-4 gap-6 border-b border-zinc-800 px-8 py-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500">Status</p>
            <h2 className="mt-2 text-lg font-semibold text-orange-500">{currentStatus}</h2>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500">Telefone</p>
            <h2 className="mt-2 text-lg text-white">{lead.phone ?? "-"}</h2>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500">Cidade</p>
            <h2 className="mt-2 text-lg text-white">
              {lead.city ?? "-"}
              {lead.state ? ` - ${lead.state}` : ""}
            </h2>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500">Valor Estimado</p>
            <h2 className="mt-2 text-2xl font-bold text-orange-500">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(lead.estimatedValue ?? 0)}
            </h2>
          </div>
        </div>

        <LeadTabs lead={lead} />
      </div>
    </div>
  );
}