"use client";

import {
  useEffect,
  useState,
} from "react";
import {
  CheckCircle2,
  CircleDollarSign,
  FileClock,
  FileText,
  Landmark,
  X,
  XCircle,
} from "lucide-react";

import { ProposalFinancialTab } from "@/components/proposals/tabs/ProposalFinancialTab";
import type { ProposalCommercialData } from "@/components/proposals/tabs/ProposalFinancialTab";
import { ProposalHistoryTab } from "@/components/proposals/tabs/ProposalHistoryTab";
import { ProposalPdfTab } from "@/components/proposals/tabs/ProposalPdfTab";
import { ProposalSummaryTab } from "@/components/proposals/tabs/ProposalSummaryTab";
import { Drawer } from "@/components/ui/Drawer";

import type {
  ProposalListItem,
  ProposalStatus,
} from "@/types/proposal";

type ProposalTab =
  | "Resumo"
  | "PDF"
  | "Financeiro"
  | "Histórico";

type Props = {
  proposal: ProposalListItem | null;
  open: boolean;
  onClose: () => void;

  onProposalChange?: (
    proposal: ProposalListItem
  ) => void;
};

type FeedbackMessage = {
  type: "success" | "error";
  text: string;
} | null;

const tabs: {
  name: ProposalTab;
  icon: typeof FileText;
}[] = [
  {
    name: "Resumo",
    icon: FileText,
  },
  {
    name: "PDF",
    icon: FileText,
  },
  {
    name: "Financeiro",
    icon: Landmark,
  },
  {
    name: "Histórico",
    icon: FileClock,
  },
];

function formatCurrency(
  value: number
) {
  return new Intl.NumberFormat(
    "pt-BR",
    {
      style: "currency",
      currency: "BRL",
    }
  ).format(value);
}

function normalizeStatus(
  status: string
): ProposalStatus {
  const normalized =
    status.toUpperCase();

  if (
    normalized === "ENVIADA" ||
    normalized === "APROVADA" ||
    normalized === "RECUSADA"
  ) {
    return normalized;
  }

  return "RASCUNHO";
}

function getStatusLabel(
  status: string
) {
  switch (
    normalizeStatus(status)
  ) {
    case "ENVIADA":
      return "Enviada";

    case "APROVADA":
      return "Aprovada";

    case "RECUSADA":
      return "Recusada";

    default:
      return "Rascunho";
  }
}

function getStatusStyle(
  status: string
) {
  switch (
    normalizeStatus(status)
  ) {
    case "APROVADA":
      return "border-emerald-500/25 bg-emerald-500/10 text-emerald-400";

    case "ENVIADA":
      return "border-sky-500/25 bg-sky-500/10 text-sky-400";

    case "RECUSADA":
      return "border-red-500/25 bg-red-500/10 text-red-400";

    default:
      return "border-zinc-500/25 bg-zinc-500/10 text-zinc-400";
  }
}

export function ProposalDetailsDrawer({
  proposal,
  open,
  onClose,
  onProposalChange,
}: Props) {
  const [activeTab, setActiveTab] =
    useState<ProposalTab>("Resumo");

  const [
    currentProposal,
    setCurrentProposal,
  ] =
    useState<ProposalListItem | null>(
      proposal
    );

  const [feedback, setFeedback] =
    useState<FeedbackMessage>(null);

  useEffect(() => {
    setCurrentProposal(proposal);

    if (proposal) {
      setActiveTab("Resumo");
      setFeedback(null);
    }
  }, [proposal]);

  async function persistChanges(
    changes: Partial<ProposalListItem>,
    successMessage: string
  ) {
    if (!currentProposal) {
      return;
    }

    if (!currentProposal.leadId) {
      setFeedback({
        type: "error",
        text:
          "A proposta não possui um lead vinculado.",
      });

      throw new Error(
        "Lead não vinculado."
      );
    }

    const previousProposal =
      currentProposal;

    const updatedProposal:
      ProposalListItem = {
      ...currentProposal,
      ...changes,
      updatedAt:
        new Date().toISOString(),
    };

    setFeedback(null);

    setCurrentProposal(
      updatedProposal
    );

    onProposalChange?.(
      updatedProposal
    );

    try {
      const response = await fetch(
        "/api/proposals",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            leadId:
              currentProposal.leadId,
            ...changes,
          }),
        }
      );

      if (!response.ok) {
        const responseData =
          await response.json();

        throw new Error(
          responseData.error ??
            "Erro ao atualizar a proposta."
        );
      }

      const responseData =
        await response.json();

      const savedProposal:
        ProposalListItem = {
        ...updatedProposal,
        ...responseData,
        lead: updatedProposal.lead,
      };

      setCurrentProposal(
        savedProposal
      );

      onProposalChange?.(
        savedProposal
      );

      setFeedback({
        type: "success",
        text: successMessage,
      });
    } catch (error) {
      setCurrentProposal(
        previousProposal
      );

      onProposalChange?.(
        previousProposal
      );

      setFeedback({
        type: "error",
        text:
          "Não foi possível salvar as alterações da proposta.",
      });

      throw error;
    }
  }

  async function updateStatus(
    status: ProposalStatus
  ) {
    await persistChanges(
      {
        status,
      },
      `Proposta atualizada para ${getStatusLabel(
        status
      )}.`
    );
  }

  async function updateCommercialData(
    data: ProposalCommercialData
  ) {
    await persistChanges(
      data,
      "Condições comerciais salvas com sucesso."
    );
  }

  if (
    !proposal ||
    !currentProposal
  ) {
    return null;
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      eyebrow="Proposta comercial"
      title={currentProposal.title}
      description={
        currentProposal.lead
          ?.companyName ??
        "Lead não vinculado"
      }
      maxWidthClassName="max-w-5xl"
    >
      {feedback && (
        <div className="animate-in fade-in slide-in-from-top-2 px-8 pt-6 duration-300">
          <div
            className={`flex items-center justify-between gap-4 rounded-2xl border p-4 ${
              feedback.type ===
              "success"
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                : "border-red-500/20 bg-red-500/10 text-red-300"
            }`}
          >
            <div className="flex items-center gap-3">
              {feedback.type ===
              "success" ? (
                <CheckCircle2
                  size={18}
                />
              ) : (
                <XCircle size={18} />
              )}

              <p className="text-sm font-semibold">
                {feedback.text}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setFeedback(null)
              }
              className="rounded-lg p-1 transition hover:bg-black/10"
              aria-label="Fechar mensagem"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <section className="grid gap-4 border-b border-white/[0.07] px-8 py-6 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Valor"
          value={formatCurrency(
            currentProposal.amount
          )}
          highlight
        />

        <SummaryCard
          label="Potência"
          value={
            currentProposal.systemPower
              ? `${currentProposal.systemPower} kWp`
              : "-"
          }
        />

        <SummaryCard
          label="Economia mensal"
          value={formatCurrency(
            currentProposal.monthlySaving ??
              0
          )}
        />

        <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/70 p-4 transition hover:-translate-y-0.5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Status
              </p>

              <span
                className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(
                  currentProposal.status
                )}`}
              >
                {getStatusLabel(
                  currentProposal.status
                )}
              </span>
            </div>

            <CircleDollarSign
              size={22}
              className="text-zinc-600"
            />
          </div>
        </div>
      </section>

      <nav className="overflow-x-auto border-b border-white/[0.07] px-8">
        <div className="flex min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.name}
                type="button"
                onClick={() =>
                  setActiveTab(tab.name)
                }
                className={`flex items-center gap-2 border-b-2 px-5 py-4 text-sm font-semibold outline-none transition ${
                  activeTab === tab.name
                    ? "border-orange-500 text-orange-400"
                    : "border-transparent text-zinc-500 hover:text-white"
                } focus:text-orange-400`}
              >
                <Icon size={16} />

                {tab.name}
              </button>
            );
          })}
        </div>
      </nav>

      <main
        key={activeTab}
        className="animate-in fade-in slide-in-from-bottom-2 p-8 duration-300"
      >
        {activeTab === "Resumo" && (
          <ProposalSummaryTab
            proposal={currentProposal}
          />
        )}

        {activeTab === "PDF" && (
          <ProposalPdfTab
            proposal={currentProposal}
          />
        )}

        {activeTab ===
          "Financeiro" && (
          <ProposalFinancialTab
            proposal={currentProposal}
            onStatusChange={
              updateStatus
            }
            onCommercialChange={
              updateCommercialData
            }
          />
        )}

        {activeTab ===
          "Histórico" && (
          <ProposalHistoryTab
            proposal={currentProposal}
          />
        )}
      </main>
    </Drawer>
  );
}

type SummaryCardProps = {
  label: string;
  value: string;
  highlight?: boolean;
};

function SummaryCard({
  label,
  value,
  highlight = false,
}: SummaryCardProps) {
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
        className={`mt-2 font-black ${
          highlight
            ? "text-2xl text-orange-400"
            : "text-lg text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}