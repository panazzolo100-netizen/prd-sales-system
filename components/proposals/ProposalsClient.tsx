"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileText,
  MapPin,
  RotateCcw,
  Search,
  TrendingUp,
  UserRound,
  X,
} from "lucide-react";

import { ProposalDetailsDrawer } from "@/components/proposals/ProposalDetailsDrawer";
import type { ProposalListItem } from "@/types/proposal";

type ProposalsClientProps = {
  initialProposals: ProposalListItem[];
};

type StatusFilter =
  | "TODOS"
  | "RASCUNHO"
  | "ENVIADA"
  | "APROVADA"
  | "RECUSADA";

 
const statusOptions: {
  value: StatusFilter;
  label: string;
}[] = [
  {
    value: "TODOS",
    label: "Todos os status",
  },
  {
    value: "RASCUNHO",
    label: "Rascunho",
  },
  {
    value: "ENVIADA",
    label: "Enviada",
  },
  {
    value: "APROVADA",
    label: "Aprovada",
  },
  {
    value: "RECUSADA",
    label: "Recusada",
  },
];

function formatCurrency(value: number | null) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

function formatDate(
  value: Date | string | null
) {
  if (!value) {
    return "Sem validade";
  }

  return new Intl.DateTimeFormat(
    "pt-BR"
  ).format(new Date(value));
}

function normalizeStatus(status: string) {
  return status
    .trim()
    .toLocaleUpperCase("pt-BR");
}

function getStatusStyle(status: string) {
  const normalized =
    normalizeStatus(status);

  switch (normalized) {
    case "APROVADA":
      return {
        label: "Aprovada",
        className:
          "border-emerald-500/25 bg-emerald-500/10 text-emerald-400",
      };

    case "ENVIADA":
      return {
        label: "Enviada",
        className:
          "border-sky-500/25 bg-sky-500/10 text-sky-400",
      };

    case "RECUSADA":
      return {
        label: "Recusada",
        className:
          "border-red-500/25 bg-red-500/10 text-red-400",
      };

    case "RASCUNHO":
      return {
        label: "Rascunho",
        className:
          "border-zinc-500/25 bg-zinc-500/10 text-zinc-400",
      };

    default:
      return {
        label: status || "Rascunho",
        className:
          "border-amber-500/25 bg-amber-500/10 text-amber-400",
      };
  }
}

export function ProposalsClient({
  initialProposals,
}: ProposalsClientProps) {
  const [proposals, setProposals] =
    useState<ProposalListItem[]>(
      initialProposals
    );

  const [
    selectedProposal,
    setSelectedProposal,
  ] =
    useState<ProposalListItem | null>(
      null
    );

  const [searchTerm, setSearchTerm] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("TODOS");

  const [ownerFilter, setOwnerFilter] =
    useState("TODOS");

  const owners = useMemo(() => {
    const names = proposals
      .map(
        (proposal) =>
          proposal.lead?.owner?.name
      )
      .filter(
        (name): name is string =>
          Boolean(name)
      );

    return Array.from(
      new Set(names)
    ).sort((a, b) =>
      a.localeCompare(b, "pt-BR")
    );
  }, [proposals]);

  const filteredProposals = useMemo(() => {
    const normalizedSearch =
      searchTerm
        .trim()
        .toLocaleLowerCase("pt-BR");

    return proposals.filter(
      (proposal) => {
        const companyName =
          proposal.lead?.companyName ?? "";

        const contactName =
          proposal.lead?.contactName ?? "";

        const matchesSearch =
          normalizedSearch.length === 0 ||
          proposal.title
            .toLocaleLowerCase("pt-BR")
            .includes(normalizedSearch) ||
          companyName
            .toLocaleLowerCase("pt-BR")
            .includes(normalizedSearch) ||
          contactName
            .toLocaleLowerCase("pt-BR")
            .includes(normalizedSearch);

        const proposalStatus =
          normalizeStatus(
            proposal.status
          );

        const matchesStatus =
          statusFilter === "TODOS" ||
          proposalStatus === statusFilter;

        const ownerName =
          proposal.lead?.owner?.name ??
          "SEM_RESPONSAVEL";

        const matchesOwner =
          ownerFilter === "TODOS" ||
          ownerFilter === ownerName;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesOwner
        );
      }
    );
  }, [
    proposals,
    ownerFilter,
    searchTerm,
    statusFilter,
  ]);

  const metrics = useMemo(() => {
    const total =
      proposals.length;

    const totalValue =
      proposals.reduce(
        (sum, proposal) =>
          sum + proposal.amount,
        0
      );

    const approved =
      proposals.filter(
        (proposal) =>
          normalizeStatus(
            proposal.status
          ) === "APROVADA"
      );

    const approvedValue =
      approved.reduce(
        (sum, proposal) =>
          sum + proposal.amount,
        0
      );

    const averageTicket =
      total > 0
        ? totalValue / total
        : 0;

    const approvalRate =
      total > 0
        ? (approved.length / total) * 100
        : 0;

    return {
      total,
      totalValue,
      approvedValue,
      averageTicket,
      approvalRate,
    };
  }, [proposals]);

  const filteredValue = useMemo(() => {
    return filteredProposals.reduce(
      (sum, proposal) =>
        sum + proposal.amount,
      0
    );
  }, [filteredProposals]);

  const hasActiveFilters =
    searchTerm.trim().length > 0 ||
    statusFilter !== "TODOS" ||
    ownerFilter !== "TODOS";

  function clearFilters() {
    setSearchTerm("");
    setStatusFilter("TODOS");
    setOwnerFilter("TODOS");
  }

    function handleProposalChange(
  updatedProposal: ProposalListItem
) {
  setProposals((currentProposals) =>
    currentProposals.map(
      (currentProposal) =>
        currentProposal.id ===
        updatedProposal.id
          ? {
              ...currentProposal,
              ...updatedProposal,
              lead:
                updatedProposal.lead ??
                currentProposal.lead,
            }
          : currentProposal
    )
  );

  setSelectedProposal(
    (currentProposal) => {
      if (
        !currentProposal ||
        currentProposal.id !==
          updatedProposal.id
      ) {
        return currentProposal;
      }

      return {
        ...currentProposal,
        ...updatedProposal,
        lead:
          updatedProposal.lead ??
          currentProposal.lead,
      };
    }
  );
}

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/[0.07] bg-zinc-900 p-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-500">
            Comercial
          </p>

          <h1 className="mt-2 text-4xl font-black text-white">
            Propostas
          </h1>

          <p className="mt-2 text-zinc-400">
            Controle comercial das propostas enviadas aos clientes.
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard
            icon={FileText}
            label="Propostas"
            value={String(metrics.total)}
            description="Total cadastrado"
          />

          <MetricCard
            icon={CircleDollarSign}
            label="Valor total"
            value={formatCurrency(
              metrics.totalValue
            )}
            description="Volume em propostas"
            highlight
          />

          <MetricCard
            icon={CheckCircle2}
            label="Aprovado"
            value={formatCurrency(
              metrics.approvedValue
            )}
            description="Valor convertido"
          />

          <MetricCard
            icon={TrendingUp}
            label="Ticket médio"
            value={formatCurrency(
              metrics.averageTicket
            )}
            description="Média por proposta"
          />

          <MetricCard
            icon={Clock3}
            label="Taxa de aprovação"
            value={`${metrics.approvalRate.toFixed(
              1
            )}%`}
            description="Sobre o total"
          />
        </div>
      </section>

      <section className="rounded-3xl border border-white/[0.07] bg-zinc-900/70 p-4">
        <div className="grid gap-3 xl:grid-cols-[minmax(300px,1fr)_220px_240px_auto]">
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
              placeholder="Buscar proposta, empresa ou contato..."
              className="h-12 w-full rounded-xl border border-white/[0.07] bg-zinc-950 pl-11 pr-10 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5"
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() =>
                  setSearchTerm("")
                }
                className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-white/5 hover:text-white"
                aria-label="Limpar pesquisa"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target
                  .value as StatusFilter
              )
            }
            className="h-12 rounded-xl border border-white/[0.07] bg-zinc-950 px-4 text-sm text-white outline-none transition focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5"
          >
            {statusOptions.map(
              (option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              )
            )}
          </select>

          <div className="relative">
            <UserRound
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
            />

            <select
              value={ownerFilter}
              onChange={(event) =>
                setOwnerFilter(
                  event.target.value
                )
              }
              className="h-12 w-full appearance-none rounded-xl border border-white/[0.07] bg-zinc-950 pl-11 pr-4 text-sm text-white outline-none transition focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5"
            >
              <option value="TODOS">
                Todos os responsáveis
              </option>

              <option value="SEM_RESPONSAVEL">
                Sem responsável
              </option>

              {owners.map((owner) => (
                <option
                  key={owner}
                  value={owner}
                >
                  {owner}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={clearFilters}
            disabled={!hasActiveFilters}
            className="flex h-12 items-center justify-center gap-2 rounded-xl border border-white/[0.07] bg-zinc-950 px-5 text-sm font-semibold text-zinc-300 transition hover:border-orange-500/30 hover:bg-orange-500/10 hover:text-orange-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RotateCcw size={16} />

            Limpar
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
          <p className="text-sm text-zinc-500">
            Exibindo{" "}
            <strong className="text-white">
              {filteredProposals.length}
            </strong>{" "}
            de{" "}
            <strong className="text-white">
              {proposals.length}
            </strong>{" "}
            propostas
          </p>

          <p className="text-sm text-zinc-500">
            Valor exibido:{" "}
            <strong className="text-orange-400">
              {formatCurrency(
                filteredValue
              )}
            </strong>
          </p>
        </div>
      </section>

            {filteredProposals.length === 0 ? (
        <EmptyState
          hasFilters={hasActiveFilters}
          onClear={clearFilters}
        />
      ) : (
        <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {filteredProposals.map(
            (proposal) => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                onOpen={setSelectedProposal}
              />
            )
          )}
        </section>
      )}

      <ProposalDetailsDrawer
        proposal={selectedProposal}
        open={selectedProposal !== null}
        onClose={() =>
          setSelectedProposal(null)
        }
        onDeleted={(proposalId) => {
          setProposals((current) =>
            current.filter(
              (proposal) => proposal.id !== proposalId
            )
          );
          setSelectedProposal(null);
        }}
        onProposalChange={
          handleProposalChange
        }
      />
    </div>
  );
}

type ProposalCardProps = {
  proposal: ProposalListItem;
  onOpen: (
    proposal: ProposalListItem
  ) => void;
};
function ProposalCard({
  proposal,
  onOpen,
}: ProposalCardProps) {
  const status = getStatusStyle(
    proposal.status
  );

  const location = [
    proposal.lead?.city,
    proposal.lead?.state,
  ]
    .filter(Boolean)
    .join(" - ");

  return (
    <article
  onClick={() => onOpen(proposal)}
  className="group cursor-pointer rounded-3xl border border-white/[0.07] bg-zinc-950 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/30 hover:shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-orange-500">
            Proposta comercial
          </p>

          <h2 className="mt-2 truncate text-xl font-bold text-white">
            {proposal.title}
          </h2>

          <p className="mt-1 truncate text-sm text-zinc-400">
            {proposal.lead?.companyName ??
              "Lead não vinculado"}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      <div className="mt-5 rounded-2xl border border-orange-500/15 bg-orange-500/[0.05] p-4">
        <p className="text-xs uppercase tracking-wide text-zinc-500">
          Valor da proposta
        </p>

        <p className="mt-1 text-3xl font-black text-orange-400">
          {formatCurrency(
            proposal.amount
          )}
        </p>

        
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <ProposalInfo
          label="Potência"
          value={
            proposal.systemPower
              ? `${proposal.systemPower} kWp`
              : "-"
          }
        />

        <ProposalInfo
          label="Payback"
          value={
            proposal.payback
              ? `${proposal.payback} anos`
              : "-"
          }
        />

        <ProposalInfo
          label="Economia mensal"
          value={formatCurrency(
            proposal.monthlySaving
          )}
        />

        <ProposalInfo
          label="Economia anual"
          value={formatCurrency(
            proposal.annualSaving
          )}
        />
      </div>

      <div className="mt-5 space-y-3 border-t border-white/[0.06] pt-4 text-sm">
        <div className="flex items-center gap-2 text-zinc-400">
          <UserRound
            size={15}
            className="text-zinc-600"
          />

          <span className="truncate">
            {proposal.lead?.owner?.name ??
              "Sem responsável"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-zinc-400">
          <MapPin
            size={15}
            className="text-zinc-600"
          />

          <span className="truncate">
            {location ||
              "Localização não informada"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-zinc-400">
          <CalendarDays
            size={15}
            className="text-zinc-600"
          />

          <span>
            Validade:{" "}
            {formatDate(
              proposal.validUntil
            )}
          </span>
        </div>
      </div>
    </article>
  );
}

type ProposalInfoProps = {
  label: string;
  value: string;
};

function ProposalInfo({
  label,
  value,
}: ProposalInfoProps) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-900/70 p-3">
      <p className="text-[11px] uppercase tracking-wide text-zinc-600">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-semibold text-white">
        {value}
      </p>
    </div>
  );
}

type MetricCardProps = {
  icon: typeof FileText;
  label: string;
  value: string;
  description: string;
  highlight?: boolean;
};

function MetricCard({
  icon: Icon,
  label,
  value,
  description,
  highlight = false,
}: MetricCardProps) {
  return (
    <div
      className={`rounded-2xl border p-4 transition hover:-translate-y-0.5 ${
        highlight
          ? "border-orange-500/20 bg-orange-500/[0.06]"
          : "border-white/[0.07] bg-zinc-950"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          {label}
        </p>

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${
            highlight
              ? "bg-orange-500/15 text-orange-400"
              : "bg-zinc-900 text-zinc-500"
          }`}
        >
          <Icon size={17} />
        </div>
      </div>

      <p
        className={`mt-3 truncate text-2xl font-black ${
          highlight
            ? "text-orange-400"
            : "text-white"
        }`}
      >
        {value}
      </p>

      <p className="mt-1 text-xs text-zinc-600">
        {description}
      </p>
    </div>
  );
}

type EmptyStateProps = {
  hasFilters: boolean;
  onClear: () => void;
};

function EmptyState({
  hasFilters,
  onClear,
}: EmptyStateProps) {
  return (
    <section className="rounded-3xl border border-dashed border-white/[0.09] bg-zinc-950 p-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.07] bg-zinc-900 text-zinc-500">
        <FileText size={24} />
        
      </div>

      <h2 className="mt-5 text-xl font-bold text-white">
        {hasFilters
          ? "Nenhuma proposta encontrada"
          : "Nenhuma proposta cadastrada"}
      </h2>

      <p className="mt-2 text-sm text-zinc-500">
        {hasFilters
          ? "Altere a pesquisa ou limpe os filtros."
          : "As propostas criadas nos leads aparecerão aqui."}
      </p>

      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="mt-5 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-400"
        >
          Limpar filtros
        </button>
      )}
    </section>
  );
}
