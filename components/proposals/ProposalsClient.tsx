"use client";

import { useState } from "react";
import { KanbanBoard, type KanbanColumn } from "@/components/kanban/KanbanBoard";
import { ProposalDetailsDrawer } from "@/components/proposals/ProposalDetailsDrawer";
import type { ProposalListItem } from "@/types/proposal";

const columns: KanbanColumn[] = [
  { id: "draft", label: "Rascunho", statuses: ["RASCUNHO"], moveStatus: "RASCUNHO", tone: "sky" },
  { id: "sent", label: "Enviada", statuses: ["ENVIADA"], moveStatus: "ENVIADA", tone: "orange" },
  { id: "negotiation", label: "Em negociação", statuses: ["EM_NEGOCIACAO"], moveStatus: "EM_NEGOCIACAO", tone: "amber" },
  { id: "approved", label: "Aprovada", statuses: ["APROVADA"], moveStatus: "APROVADA", tone: "green" },
  { id: "done", label: "Concluída", statuses: ["CONCLUIDA"], moveStatus: "CONCLUIDA", tone: "green" },
  { id: "archive", label: "Arquivadas", statuses: ["RECUSADA", "REJEITADA", "EXPIRADA", "CANCELADA"], tone: "red" },
];

export function ProposalsClient({ initialProposals }: { initialProposals: ProposalListItem[] }) {
  const [proposals, setProposals] = useState(initialProposals);
  const [selected, setSelected] = useState<ProposalListItem | null>(null);
  const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

  return <>
    <KanbanBoard
      eyebrow="Comercial / Propostas"
      title="Propostas"
      description="Acompanhe cada negociação do rascunho à conclusão."
      columns={columns}
      items={proposals.map((proposal) => {
        const validUntil = proposal.validUntil ? new Date(proposal.validUntil) : null;
        const expired = Boolean(validUntil && validUntil.getTime() < new Date().setHours(0, 0, 0, 0) && !["APROVADA", "CONCLUIDA"].includes(proposal.status));
        return {
          id: proposal.id,
          status: proposal.status,
          title: proposal.title,
          subtitle: proposal.lead?.companyName ?? "Cliente não vinculado",
          meta: currency.format(proposal.amount),
          detail: `${proposal.lead?.owner?.name ?? "Sem responsável"} · ${validUntil ? `válida até ${validUntil.toLocaleDateString("pt-BR")}` : "sem validade"}`,
          updatedAt: proposal.updatedAt,
          overdue: expired,
          movable: !["RECUSADA", "REJEITADA", "EXPIRADA", "CANCELADA"].includes(proposal.status),
        };
      })}
      statusEndpoint={(id) => `/api/proposals/${id}/status`}
      confirmStatuses={["APROVADA", "CONCLUIDA", "RECUSADA", "REJEITADA", "EXPIRADA", "CANCELADA"]}
      extraMoves={[
        { label: "Rejeitar proposta", status: "RECUSADA" },
        { label: "Marcar como expirada", status: "EXPIRADA" },
        { label: "Cancelar proposta", status: "CANCELADA" },
      ]}
      onStatusChanged={(id, status) => setProposals((all) => all.map((proposal) => proposal.id === id ? { ...proposal, status } : proposal))}
      onOpen={(id) => setSelected(proposals.find((proposal) => proposal.id === id) ?? null)}
      metric={(items) => [
        { label: "Enviadas", value: items.filter((item) => item.status === "ENVIADA").length },
        { label: "Em negociação", value: items.filter((item) => item.status === "EM_NEGOCIACAO").length },
        { label: "Aprovadas", value: items.filter((item) => item.status === "APROVADA").length },
        { label: "Valor aprovado", value: currency.format(proposals.filter((item) => item.status === "APROVADA").reduce((sum, item) => sum + item.amount, 0)) },
      ]}
    />
    <ProposalDetailsDrawer proposal={selected} open={selected !== null} onClose={() => setSelected(null)} onDeleted={(id) => { setProposals((all) => all.filter((item) => item.id !== id)); setSelected(null); }} onProposalChange={(proposal) => { setProposals((all) => all.map((item) => item.id === proposal.id ? { ...item, ...proposal, lead: proposal.lead ?? item.lead } : item)); setSelected(proposal); }} />
  </>;
}
