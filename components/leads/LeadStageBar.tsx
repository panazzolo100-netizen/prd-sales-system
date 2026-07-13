"use client";

import { LeadStatus } from "@/lib/generated/prisma/enums";

const stages = [
  LeadStatus.NOVO,
  LeadStatus.CONTATO,
  LeadStatus.VISITA,
  LeadStatus.PROPOSTA,
  LeadStatus.NEGOCIACAO,
  LeadStatus.GANHO,
  LeadStatus.PERDIDO,
];

type Props = {
  leadId: string;
  currentStatus: LeadStatus;
  onStatusChange: (status: LeadStatus) => void;
};

function label(status: LeadStatus) {
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
  }
}

export function LeadStageBar({
  leadId,
  currentStatus,
  onStatusChange,
}: Props) {
  async function changeStatus(status: LeadStatus) {
    if (status === currentStatus) return;

    const response = await fetch("/api/leads", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: leadId,
        status,
      }),
    });

    if (!response.ok) {
      alert("Erro ao alterar status.");
      return;
    }

    onStatusChange(status);
  }

  return (
    <div className="flex gap-2 overflow-x-auto border-b border-zinc-800 bg-zinc-950 px-8 py-5">
      {stages.map((stage) => (
        <button
          key={stage}
          onClick={() => changeStatus(stage)}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
            stage === currentStatus
              ? "bg-orange-500 text-white"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
          }`}
        >
          {label(stage)}
        </button>
      ))}
    </div>
  );
}