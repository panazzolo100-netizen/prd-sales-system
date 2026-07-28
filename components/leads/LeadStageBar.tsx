"use client";

import { LeadStatus } from "@/lib/generated/prisma/enums";
import { PIPELINE_STAGES } from "@/lib/pipeline-stages";

type Props = {
  leadId: string;
  currentStatus: LeadStatus;
  onStatusChange: (status: LeadStatus) => void;
};

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
      {PIPELINE_STAGES.map((stage) => (
        <button
          key={stage.status}
          onClick={() => changeStatus(stage.status)}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
            stage.status === currentStatus
              ? "bg-orange-500 text-white"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
          }`}
        >
          {stage.label}
        </button>
      ))}
    </div>
  );
}
