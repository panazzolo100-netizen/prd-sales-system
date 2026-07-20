"use client";

import {
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock3,
  DollarSign,
  ExternalLink,
  FileText,
  Flame,
  FolderOpen,
  LoaderCircle,
  MoreVertical,
  RotateCcw,
  Search,
  Snowflake,
  Sun,
  Target,
  TrendingUp,
  UserRound,
  X,
  XCircle,
} from "lucide-react";

import { LeadDetailsDrawer } from "@/components/leads/LeadDetailsDrawer";
import type { LeadTab } from "@/components/leads/LeadTabs";
import { LeadStatus } from "@/lib/generated/prisma/enums";
import type { LeadListItem } from "@/types/lead";

type PipelineLead = {
  id: string;
  companyName: string;
  contactName: string;
  estimatedValue: number | null;
  status: LeadStatus;
  updatedAt: Date | string;

  owner: {
    name: string;
  } | null;

  activities: {
    createdAt: Date | string;
  }[];
};

type PipelineBoardProps = {
  initialLeads: PipelineLead[];
};

type ToastMessage = {
  type: "success" | "error";
  message: string;
} | null;

type TemperatureFilter =
  | "TODOS"
  | "QUENTE"
  | "MORNO"
  | "FRIO";

const etapas = [
  {
    status: LeadStatus.NOVO,
    nome: "Novo",
  },
  {
    status: LeadStatus.CONTATO,
    nome: "Contato",
  },
  {
    status: LeadStatus.VISITA,
    nome: "Visita",
  },
  {
    status: LeadStatus.PROPOSTA,
    nome: "Proposta",
  },
  {
    status: LeadStatus.NEGOCIACAO,
    nome: "Negociação",
  },
  {
    status: LeadStatus.GANHO,
    nome: "Ganho",
  },
  {
    status: LeadStatus.PERDIDO,
    nome: "Perdido",
  },
];

function formatCurrency(value: number | null) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

function formatPercentage(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value / 100);
}

function getDaysSince(value: Date | string) {
  const date = new Date(value);

  const difference =
    Date.now() - date.getTime();

  return Math.max(
    0,
    Math.floor(
      difference /
        (1000 * 60 * 60 * 24)
    )
  );
}

function formatDaysSince(days: number) {
  if (days <= 0) {
    return "hoje";
  }

  if (days === 1) {
    return "1 dia";
  }

  return `${days} dias`;
}

function getLeadTemperature(days: number) {
  if (days <= 2) {
    return {
      key: "QUENTE" as const,
      label: "Quente",
      Icon: Flame,
      className:
        "border-orange-500/25 bg-orange-500/10 text-orange-400",
    };
  }

  if (days <= 5) {
    return {
      key: "MORNO" as const,
      label: "Morno",
      Icon: Sun,
      className:
        "border-amber-500/25 bg-amber-500/10 text-amber-400",
    };
  }

  return {
    key: "FRIO" as const,
    label: "Frio",
    Icon: Snowflake,
    className:
      "border-sky-500/25 bg-sky-500/10 text-sky-400",
  };
}

function getLeadReferenceDate(
  lead: PipelineLead
) {
  return (
    lead.activities[0]?.createdAt ??
    lead.updatedAt
  );
}

export function PipelineBoard({
  initialLeads,
}: PipelineBoardProps) {
  const [leads, setLeads] =
    useState(initialLeads);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [ownerFilter, setOwnerFilter] =
    useState("TODOS");

  const [
    temperatureFilter,
    setTemperatureFilter,
  ] =
    useState<TemperatureFilter>("TODOS");

  const [draggedLeadId, setDraggedLeadId] =
    useState<string | null>(null);

  const [dragOverStatus, setDragOverStatus] =
    useState<LeadStatus | null>(null);

  const [savingLeadId, setSavingLeadId] =
    useState<string | null>(null);

  const [selectedLead, setSelectedLead] =
    useState<LeadListItem | null>(null);

  const [selectedTab, setSelectedTab] =
    useState<LeadTab>("Resumo");

  const [loadingLeadId, setLoadingLeadId] =
    useState<string | null>(null);

  const [openMenuLeadId, setOpenMenuLeadId] =
    useState<string | null>(null);

  const [toast, setToast] =
    useState<ToastMessage>(null);

  const didDrag = useRef(false);

  const owners = useMemo(() => {
    const names = leads
      .map((lead) => lead.owner?.name)
      .filter(
        (name): name is string =>
          Boolean(name)
      );

    return Array.from(
      new Set(names)
    ).sort((a, b) =>
      a.localeCompare(b, "pt-BR")
    );
  }, [leads]);

  const filteredLeads = useMemo(() => {
    const normalizedSearch =
      searchTerm
        .trim()
        .toLocaleLowerCase("pt-BR");

    return leads.filter((lead) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        lead.companyName
          .toLocaleLowerCase("pt-BR")
          .includes(normalizedSearch) ||
        lead.contactName
          .toLocaleLowerCase("pt-BR")
          .includes(normalizedSearch);

      const leadOwner =
        lead.owner?.name ??
        "SEM_RESPONSAVEL";

      const matchesOwner =
        ownerFilter === "TODOS" ||
        ownerFilter === leadOwner;

      const referenceDate =
        getLeadReferenceDate(lead);

      const stoppedDays =
        getDaysSince(referenceDate);

      const temperature =
        getLeadTemperature(stoppedDays);

      const matchesTemperature =
        temperatureFilter === "TODOS" ||
        temperatureFilter ===
          temperature.key;

      return (
        matchesSearch &&
        matchesOwner &&
        matchesTemperature
      );
    });
  }, [
    leads,
    ownerFilter,
    searchTerm,
    temperatureFilter,
  ]);

  const metrics = useMemo(() => {
    const totalLeads = leads.length;

    const totalValue = leads.reduce(
      (total, lead) =>
        total +
        (lead.estimatedValue ?? 0),
      0
    );

    const ticketAverage =
      totalLeads > 0
        ? totalValue / totalLeads
        : 0;

    const wonLeads = leads.filter(
      (lead) =>
        lead.status === LeadStatus.GANHO
    ).length;

    const lostLeads = leads.filter(
      (lead) =>
        lead.status === LeadStatus.PERDIDO
    ).length;

    const closedLeads =
      wonLeads + lostLeads;

    const winRate =
      closedLeads > 0
        ? (wonLeads / closedLeads) * 100
        : 0;

    const totalStoppedDays =
      leads.reduce((total, lead) => {
        const referenceDate =
          getLeadReferenceDate(lead);

        return (
          total +
          getDaysSince(referenceDate)
        );
      }, 0);

    const averageStoppedDays =
      totalLeads > 0
        ? Math.round(
            totalStoppedDays / totalLeads
          )
        : 0;

    return {
      totalLeads,
      totalValue,
      ticketAverage,
      winRate,
      averageStoppedDays,
    };
  }, [leads]);

  const filteredValue = useMemo(() => {
    return filteredLeads.reduce(
      (total, lead) =>
        total +
        (lead.estimatedValue ?? 0),
      0
    );
  }, [filteredLeads]);

  const hasActiveFilters =
    searchTerm.trim().length > 0 ||
    ownerFilter !== "TODOS" ||
    temperatureFilter !== "TODOS";

  function clearFilters() {
    setSearchTerm("");
    setOwnerFilter("TODOS");
    setTemperatureFilter("TODOS");
  }

  function showToast(
    type: "success" | "error",
    message: string
  ) {
    setToast({
      type,
      message,
    });

    window.setTimeout(() => {
      setToast(null);
    }, 3500);
  }

  async function openLead(
    leadId: string,
    tab: LeadTab = "Resumo"
  ) {
    if (didDrag.current) {
      didDrag.current = false;
      return;
    }

    setOpenMenuLeadId(null);
    setSelectedTab(tab);
    setLoadingLeadId(leadId);

    try {
      const response = await fetch(
        `/api/leads/${leadId}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Não foi possível carregar o lead."
        );
      }

      const data = await response.json();
      const lead = data.lead ?? data;

      setSelectedLead(
        lead as LeadListItem
      );
    } catch {
      showToast(
        "error",
        "Não foi possível abrir os detalhes da oportunidade."
      );
    } finally {
      setLoadingLeadId(null);
    }
  }

  async function moveLead(
    leadId: string,
    newStatus: LeadStatus
  ) {
    const currentLead = leads.find(
      (lead) => lead.id === leadId
    );

    if (
      !currentLead ||
      currentLead.status === newStatus
    ) {
      setDraggedLeadId(null);
      setDragOverStatus(null);

      return;
    }

    const previousLeads = leads;

    const newStage = etapas.find(
      (etapa) =>
        etapa.status === newStatus
    );

    setSavingLeadId(leadId);

    setLeads((current) =>
      current.map((lead) =>
        lead.id === leadId
          ? {
              ...lead,
              status: newStatus,
              updatedAt:
                new Date().toISOString(),
            }
          : lead
      )
    );

    try {
      const response = await fetch(
        "/api/leads",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            id: leadId,
            status: newStatus,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Erro ao atualizar o lead."
        );
      }

      setSelectedLead((current) => {
        if (
          !current ||
          current.id !== leadId
        ) {
          return current;
        }

        return {
          ...current,
          status: newStatus,
        };
      });

      showToast(
        "success",
        `Oportunidade movida para ${
          newStage?.nome ??
          "a nova etapa"
        }.`
      );
    } catch {
      setLeads(previousLeads);

      showToast(
        "error",
        "Não foi possível mover a oportunidade."
      );
    } finally {
      setSavingLeadId(null);
      setDraggedLeadId(null);
      setDragOverStatus(null);
    }
  }

  function handleDrawerStatusChange(
    leadId: string,
    status: LeadStatus
  ) {
    setLeads((current) =>
      current.map((lead) =>
        lead.id === leadId
          ? {
              ...lead,
              status,
              updatedAt:
                new Date().toISOString(),
            }
          : lead
      )
    );

    setSelectedLead((current) => {
      if (
        !current ||
        current.id !== leadId
      ) {
        return current;
      }

      return {
        ...current,
        status,
      };
    });

    const stage = etapas.find(
      (etapa) =>
        etapa.status === status
    );

    showToast(
      "success",
      `Oportunidade movida para ${
        stage?.nome ?? "a nova etapa"
      }.`
    );
  }

  return (
    <>
      <div
        className="relative space-y-6"
        onClick={() =>
          setOpenMenuLeadId(null)
        }
      >
        {toast && (
          <div className="fixed right-6 top-24 z-[100] w-[calc(100%-3rem)] max-w-sm animate-in slide-in-from-right-5 fade-in duration-300">
            <div
              className={`flex items-start gap-3 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl ${
                toast.type === "success"
                  ? "border-emerald-500/20 bg-emerald-950/90"
                  : "border-red-500/20 bg-red-950/90"
              }`}
            >
              <div
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  toast.type === "success"
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-red-500/15 text-red-400"
                }`}
              >
                {toast.type === "success" ? (
                  <CheckCircle2 size={19} />
                ) : (
                  <XCircle size={19} />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white">
                  {toast.type === "success"
                    ? "Pipeline atualizado"
                    : "Erro na atualização"}
                </p>

                <p className="mt-1 text-sm leading-5 text-zinc-300">
                  {toast.message}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setToast(null)
                }
                className="rounded-lg p-1 text-zinc-500 transition hover:bg-white/5 hover:text-white"
                aria-label="Fechar notificação"
              >
                <X size={17} />
              </button>
            </div>
          </div>
        )}

        <div className="rounded-3xl border border-white/[0.07] bg-zinc-900 p-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-500">
              Comercial
            </p>

            <h1 className="mt-2 text-4xl font-black text-white">
              Pipeline
            </h1>

            <p className="mt-2 text-zinc-400">
              Gestão completa das oportunidades comerciais.
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard
              icon={BarChart3}
              label="Oportunidades"
              value={String(
                metrics.totalLeads
              )}
              description="Leads no pipeline"
            />

            <MetricCard
              icon={DollarSign}
              label="Valor total"
              value={formatCurrency(
                metrics.totalValue
              )}
              description="Valor estimado"
              highlight
            />

            <MetricCard
              icon={TrendingUp}
              label="Ticket médio"
              value={formatCurrency(
                metrics.ticketAverage
              )}
              description="Média por oportunidade"
            />

            <MetricCard
              icon={Target}
              label="Taxa de ganho"
              value={formatPercentage(
                metrics.winRate
              )}
              description="Ganhos entre encerrados"
            />

            <MetricCard
              icon={Clock3}
              label="Tempo parado"
              value={`${metrics.averageStoppedDays} dias`}
              description="Média sem atualização"
            />
          </div>
        </div>

        <div className="rounded-3xl border border-white/[0.07] bg-zinc-900/70 p-4">
          <div className="grid gap-3 xl:grid-cols-[minmax(280px,1fr)_240px_220px_auto]">
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
                placeholder="Buscar empresa ou contato..."
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

            <select
              value={temperatureFilter}
              onChange={(event) =>
                setTemperatureFilter(
                  event.target
                    .value as TemperatureFilter
                )
              }
              className="h-12 w-full rounded-xl border border-white/[0.07] bg-zinc-950 px-4 text-sm text-white outline-none transition focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5"
            >
              <option value="TODOS">
                Todas as temperaturas
              </option>

              <option value="QUENTE">
                Quentes
              </option>

              <option value="MORNO">
                Mornos
              </option>

              <option value="FRIO">
                Frios
              </option>
            </select>

            <button
              type="button"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className="flex h-12 items-center justify-center gap-2 rounded-xl border border-white/[0.07] bg-zinc-950 px-5 text-sm font-semibold text-zinc-300 transition hover:border-orange-500/30 hover:bg-orange-500/10 hover:text-orange-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RotateCcw size={16} />

              Limpar filtros
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
            <p className="text-sm text-zinc-500">
              Exibindo{" "}
              <span className="font-bold text-white">
                {filteredLeads.length}
              </span>{" "}
              de{" "}
              <span className="font-bold text-white">
                {leads.length}
              </span>{" "}
              oportunidades
            </p>

            <div className="flex items-center gap-3">
              {hasActiveFilters && (
                <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-400">
                  Filtros ativos
                </span>
              )}

              <span className="text-sm text-zinc-500">
                Valor exibido:{" "}
                <strong className="text-orange-400">
                  {formatCurrency(
                    filteredValue
                  )}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {filteredLeads.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/[0.09] bg-zinc-950 p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.07] bg-zinc-900 text-zinc-500">
              <Search size={24} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-white">
              Nenhuma oportunidade encontrada
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              Altere a pesquisa ou limpe os filtros.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-400"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto pb-4">
            <div className="grid min-w-[1900px] grid-cols-7 gap-4">
              {etapas.map((etapa) => {
                const leadsDaEtapa =
                  filteredLeads.filter(
                    (lead) =>
                      lead.status ===
                      etapa.status
                  );

                const value =
                  leadsDaEtapa.reduce(
                    (total, lead) =>
                      total +
                      (lead.estimatedValue ??
                        0),
                    0
                  );

                const stagePercentage =
                  filteredLeads.length > 0
                    ? (leadsDaEtapa.length /
                        filteredLeads.length) *
                      100
                    : 0;

                const isDragOver =
                  dragOverStatus ===
                  etapa.status;

                return (
                  <section
                    key={etapa.status}
                    onDragEnter={(event) => {
                      event.preventDefault();

                      setDragOverStatus(
                        etapa.status
                      );
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();

                      event.dataTransfer.dropEffect =
                        "move";

                      setDragOverStatus(
                        etapa.status
                      );
                    }}
                    onDrop={(event) => {
                      event.preventDefault();

                      setDragOverStatus(null);

                      if (draggedLeadId) {
                        moveLead(
                          draggedLeadId,
                          etapa.status
                        );
                      }
                    }}
                    className={`min-h-[650px] rounded-2xl border p-4 transition-all duration-300 ${
                      isDragOver
                        ? "border-orange-500 bg-orange-500/[0.06] shadow-[0_0_35px_rgba(249,115,22,0.12)]"
                        : "border-white/[0.06] bg-zinc-950"
                    }`}
                  >
                    <div className="mb-5">
                      <div className="flex items-center justify-between">
                        <h2 className="font-bold text-white">
                          {etapa.nome}
                        </h2>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                            isDragOver
                              ? "bg-orange-500/15 text-orange-400"
                              : "bg-zinc-900 text-zinc-400"
                          }`}
                        >
                          {
                            leadsDaEtapa.length
                          }
                        </span>
                      </div>

                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-900">
                        <div
                          className="h-full rounded-full bg-orange-500 transition-all duration-500"
                          style={{
                            width: `${stagePercentage}%`,
                          }}
                        />
                      </div>

                      <div className="mt-2 flex items-center justify-between gap-2">
                        <p className="text-xs text-zinc-500">
                          {formatCurrency(value)}
                        </p>

                        <p className="text-xs font-semibold text-zinc-600">
                          {formatPercentage(
                            stagePercentage
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {leadsDaEtapa.map(
                        (lead) => {
                          const referenceDate =
                            getLeadReferenceDate(
                              lead
                            );

                          const stoppedDays =
                            getDaysSince(
                              referenceDate
                            );

                          const hasAlert =
                            stoppedDays >= 5 &&
                            lead.status !==
                              LeadStatus.GANHO &&
                            lead.status !==
                              LeadStatus.PERDIDO;

                          const temperature =
                            getLeadTemperature(
                              stoppedDays
                            );

                          const TemperatureIcon =
                            temperature.Icon;

                          const isDragging =
                            draggedLeadId ===
                            lead.id;

                          const isSaving =
                            savingLeadId ===
                            lead.id;

                          const isLoading =
                            loadingLeadId ===
                            lead.id;

                          const isMenuOpen =
                            openMenuLeadId ===
                            lead.id;

                          return (
                            <article
                              key={lead.id}
                              draggable={
                                !isSaving &&
                                !isLoading &&
                                !isMenuOpen
                              }
                              onClick={() =>
                                openLead(
                                  lead.id,
                                  "Resumo"
                                )
                              }
                              onDragStart={(
                                event
                              ) => {
                                didDrag.current =
                                  true;

                                setOpenMenuLeadId(
                                  null
                                );

                                event.dataTransfer.effectAllowed =
                                  "move";

                                event.dataTransfer.setData(
                                  "text/plain",
                                  lead.id
                                );

                                setDraggedLeadId(
                                  lead.id
                                );
                              }}
                              onDragEnd={() => {
                                setDraggedLeadId(
                                  null
                                );

                                setDragOverStatus(
                                  null
                                );

                                window.setTimeout(
                                  () => {
                                    didDrag.current =
                                      false;
                                  },
                                  100
                                );
                              }}
                              className={`group relative cursor-pointer rounded-2xl border p-4 transition-all duration-300 ${
                                isDragging
                                  ? "scale-90 rotate-1 opacity-40"
                                  : "hover:-translate-y-0.5 hover:shadow-xl"
                              } ${
                                isSaving ||
                                isLoading
                                  ? "pointer-events-none opacity-70"
                                  : ""
                              } ${
                                hasAlert
                                  ? "border-red-500/40 bg-red-950/20 hover:border-red-500/60"
                                  : "border-zinc-800 bg-zinc-900 hover:border-orange-500/40"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <h3 className="truncate font-bold text-white">
                                    {
                                      lead.companyName
                                    }
                                  </h3>

                                  <p className="mt-1 truncate text-xs text-zinc-500">
                                    {
                                      lead.contactName
                                    }
                                  </p>
                                </div>

                                <div className="flex shrink-0 items-center gap-1">
                                  {(isSaving ||
                                    isLoading) && (
                                    <LoaderCircle
                                      size={17}
                                      className="animate-spin text-orange-400"
                                    />
                                  )}

                                  {!isSaving &&
                                    !isLoading && (
                                      <div
                                        className="relative"
                                        onClick={(
                                          event
                                        ) =>
                                          event.stopPropagation()
                                        }
                                      >
                                        <button
                                          type="button"
                                          draggable={
                                            false
                                          }
                                          onMouseDown={(
                                            event
                                          ) =>
                                            event.stopPropagation()
                                          }
                                          onClick={(
                                            event
                                          ) => {
                                            event.stopPropagation();

                                            setOpenMenuLeadId(
                                              (
                                                current
                                              ) =>
                                                current ===
                                                lead.id
                                                  ? null
                                                  : lead.id
                                            );
                                          }}
                                          className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                                            isMenuOpen
                                              ? "bg-orange-500/15 text-orange-400"
                                              : "text-zinc-600 opacity-0 hover:bg-white/5 hover:text-white group-hover:opacity-100"
                                          }`}
                                          aria-label="Abrir ações rápidas"
                                        >
                                          <MoreVertical
                                            size={
                                              17
                                            }
                                          />
                                        </button>

                                        {isMenuOpen && (
                                          <div className="absolute right-0 top-10 z-30 w-52 overflow-hidden rounded-xl border border-white/[0.08] bg-zinc-950 p-1.5 shadow-2xl">
                                            <QuickAction
                                              icon={
                                                ExternalLink
                                              }
                                              label="Abrir lead"
                                              onClick={() =>
                                                openLead(
                                                  lead.id,
                                                  "Resumo"
                                                )
                                              }
                                            />

                                            <QuickAction
                                              icon={
                                                Activity
                                              }
                                              label="Nova atividade"
                                              onClick={() =>
                                                openLead(
                                                  lead.id,
                                                  "Timeline"
                                                )
                                              }
                                            />

                                            <QuickAction
                                              icon={
                                                FileText
                                              }
                                              label="Proposta"
                                              onClick={() =>
                                                openLead(
                                                  lead.id,
                                                  "Propostas"
                                                )
                                              }
                                            />

                                            <QuickAction
                                              icon={
                                                FolderOpen
                                              }
                                              label="Arquivos"
                                              onClick={() =>
                                                openLead(
                                                  lead.id,
                                                  "Arquivos"
                                                )
                                              }
                                            />
                                          </div>
                                        )}
                                      </div>
                                    )}
                                </div>
                              </div>

                              {lead.status !==
                                LeadStatus.GANHO &&
                                lead.status !==
                                  LeadStatus.PERDIDO && (
                                  <div className="mt-3">
                                    <span
                                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${temperature.className}`}
                                    >
                                      <TemperatureIcon
                                        size={12}
                                      />

                                      {
                                        temperature.label
                                      }
                                    </span>
                                  </div>
                                )}

                              <div className="mt-4 space-y-3 text-sm text-zinc-300">
                                <div className="flex items-center gap-2">
                                  <DollarSign
                                    size={15}
                                    className="text-orange-500"
                                  />

                                  {formatCurrency(
                                    lead.estimatedValue
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  <Calendar
                                    size={15}
                                    className="text-zinc-500"
                                  />

                                  Atualizado há{" "}
                                  {formatDaysSince(
                                    stoppedDays
                                  )}
                                </div>
                              </div>

                              <div className="mt-4 flex items-center justify-between gap-3 border-t border-zinc-800 pt-4">
                                <span className="truncate text-xs text-zinc-500">
                                  {lead.owner
                                    ?.name ??
                                    "Sem responsável"}
                                </span>

                                {hasAlert && (
                                  <span className="flex shrink-0 items-center gap-1 text-xs text-red-400">
                                    <AlertTriangle
                                      size={14}
                                    />

                                    Sem retorno
                                  </span>
                                )}
                              </div>
                            </article>
                          );
                        }
                      )}

                      {leadsDaEtapa.length ===
                        0 && (
                        <div
                          className={`rounded-xl border border-dashed p-6 text-center text-sm transition-all duration-300 ${
                            isDragOver
                              ? "border-orange-500/50 bg-orange-500/[0.05] text-orange-300"
                              : "border-zinc-800 text-zinc-600"
                          }`}
                        >
                          {isDragOver
                            ? "Solte a oportunidade"
                            : hasActiveFilters
                              ? "Nenhum resultado nesta etapa"
                              : "Solte uma oportunidade aqui"}
                        </div>
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <LeadDetailsDrawer
        lead={selectedLead}
        open={selectedLead !== null}
        initialTab={selectedTab}
        onClose={() => {
          setSelectedLead(null);
          setSelectedTab("Resumo");
        }}
        onStatusChange={
          handleDrawerStatusChange
        }
      />
    </>
  );
}

type MetricCardProps = {
  icon: typeof BarChart3;
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

type QuickActionProps = {
  icon: typeof ExternalLink;
  label: string;
  onClick: () => void;
};

function QuickAction({
  icon: Icon,
  label,
  onClick,
}: QuickActionProps) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-zinc-300 transition hover:bg-orange-500/10 hover:text-orange-400"
    >
      <Icon size={16} />

      {label}
    </button>
  );
}