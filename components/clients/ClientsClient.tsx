"use client";

import { useMemo, useState } from "react";
import {
  Building2,
  CircleDollarSign,
  FolderKanban,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  Search,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

import { ClientDetailsDrawer } from "@/components/clients/ClientDetailsDrawer";
import type { ClientListItem } from "@/types/client";

type ClientsClientProps = {
  initialClients: ClientListItem[];
};

type ProjectFilter =
  | "TODOS"
  | "COM_PROJETOS"
  | "SEM_PROJETOS";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

export function ClientsClient({
  initialClients,
}: ClientsClientProps) {
  const [clients, setClients] =
    useState<ClientListItem[]>(
      initialClients
    );

  const [
    selectedClient,
    setSelectedClient,
  ] =
    useState<ClientListItem | null>(
      null
    );

  const [searchTerm, setSearchTerm] =
    useState("");

  const [stateFilter, setStateFilter] =
    useState("TODOS");

  const [projectFilter, setProjectFilter] =
    useState<ProjectFilter>("TODOS");

  const states = useMemo(() => {
    const values = clients
      .map((client) => client.state)
      .filter(
        (state): state is string =>
          Boolean(state)
      );

    return Array.from(
      new Set(values)
    ).sort((a, b) =>
      a.localeCompare(b, "pt-BR")
    );
  }, [clients]);

  const filteredClients = useMemo(() => {
    const normalizedSearch =
      searchTerm
        .trim()
        .toLocaleLowerCase("pt-BR");

    return clients.filter(
      (client) => {
        const matchesSearch =
          normalizedSearch.length === 0 ||
          client.name
            .toLocaleLowerCase("pt-BR")
            .includes(normalizedSearch) ||
          (client.email ?? "")
            .toLocaleLowerCase("pt-BR")
            .includes(normalizedSearch) ||
          (client.phone ?? "")
            .toLocaleLowerCase("pt-BR")
            .includes(normalizedSearch) ||
          (client.document ?? "")
            .toLocaleLowerCase("pt-BR")
            .includes(normalizedSearch);

        const matchesState =
          stateFilter === "TODOS" ||
          client.state === stateFilter;

        const hasProjects =
          client.projects.length > 0;

        const matchesProject =
          projectFilter === "TODOS" ||
          (projectFilter ===
            "COM_PROJETOS" &&
            hasProjects) ||
          (projectFilter ===
            "SEM_PROJETOS" &&
            !hasProjects);

        return (
          matchesSearch &&
          matchesState &&
          matchesProject
        );
      }
    );
  }, [
    clients,
    projectFilter,
    searchTerm,
    stateFilter,
  ]);

  const metrics = useMemo(() => {
    const totalClients =
      clients.length;

    const clientsWithProjects =
      clients.filter(
        (client) =>
          client.projects.length > 0
      ).length;

    const totalProjects =
      clients.reduce(
        (total, client) =>
          total +
          client.projects.length,
        0
      );

    const totalProposalValue =
      clients.reduce(
        (total, client) =>
          total +
          client.proposals.reduce(
            (proposalTotal, proposal) =>
              proposalTotal +
              proposal.amount,
            0
          ),
        0
      );

    return {
      totalClients,
      clientsWithProjects,
      totalProjects,
      totalProposalValue,
    };
  }, [clients]);

  const hasActiveFilters =
    searchTerm.trim().length > 0 ||
    stateFilter !== "TODOS" ||
    projectFilter !== "TODOS";

   function clearFilters() {
    setSearchTerm("");
    setStateFilter("TODOS");
    setProjectFilter("TODOS");
  }

  function handleClientChange(
    updatedClient: ClientListItem
  ) {
    setClients((currentClients) =>
      currentClients.map(
        (currentClient) =>
          currentClient.id ===
          updatedClient.id
            ? {
                ...currentClient,
                ...updatedClient,
                lead:
                  updatedClient.lead ??
                  currentClient.lead,
                proposals:
                  updatedClient.proposals ??
                  currentClient.proposals,
                projects:
                  updatedClient.projects ??
                  currentClient.projects,
              }
            : currentClient
      )
    );

    setSelectedClient(
      (currentClient) => {
        if (
          !currentClient ||
          currentClient.id !==
            updatedClient.id
        ) {
          return currentClient;
        }

        return {
          ...currentClient,
          ...updatedClient,
          lead:
            updatedClient.lead ??
            currentClient.lead,
          proposals:
            updatedClient.proposals ??
            currentClient.proposals,
          projects:
            updatedClient.projects ??
            currentClient.projects,
        };
      }
    );
  }


  return (
    <>
      <div className="space-y-6">
        <section className="rounded-3xl border border-white/[0.07] bg-zinc-900 p-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-500">
              Relacionamento
            </p>

            <h1 className="mt-2 text-4xl font-black text-white">
              Clientes
            </h1>

            <p className="mt-2 text-zinc-400">
              Gestão dos clientes convertidos pelo comercial.
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              icon={UsersRound}
              label="Clientes"
              value={String(
                metrics.totalClients
              )}
              description="Total cadastrado"
            />

            <MetricCard
              icon={FolderKanban}
              label="Com projetos"
              value={String(
                metrics.clientsWithProjects
              )}
              description="Clientes em operação"
            />

            <MetricCard
              icon={Building2}
              label="Projetos"
              value={String(
                metrics.totalProjects
              )}
              description="Projetos vinculados"
            />

            <MetricCard
              icon={CircleDollarSign}
              label="Volume comercial"
              value={formatCurrency(
                metrics.totalProposalValue
              )}
              description="Valor em propostas"
              highlight
            />
          </div>
        </section>

        <section className="rounded-3xl border border-white/[0.07] bg-zinc-900/70 p-4">
          <div className="grid gap-3 xl:grid-cols-[minmax(300px,1fr)_220px_220px_auto]">
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
                placeholder="Buscar nome, documento, telefone ou e-mail..."
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
              value={stateFilter}
              onChange={(event) =>
                setStateFilter(
                  event.target.value
                )
              }
              className="h-12 rounded-xl border border-white/[0.07] bg-zinc-950 px-4 text-sm text-white outline-none transition focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5"
            >
              <option value="TODOS">
                Todos os estados
              </option>

              {states.map((state) => (
                <option
                  key={state}
                  value={state}
                >
                  {state}
                </option>
              ))}
            </select>

            <select
              value={projectFilter}
              onChange={(event) =>
                setProjectFilter(
                  event.target
                    .value as ProjectFilter
                )
              }
              className="h-12 rounded-xl border border-white/[0.07] bg-zinc-950 px-4 text-sm text-white outline-none transition focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5"
            >
              <option value="TODOS">
                Todos os clientes
              </option>

              <option value="COM_PROJETOS">
                Com projetos
              </option>

              <option value="SEM_PROJETOS">
                Sem projetos
              </option>
            </select>

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

          <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-4">
            <p className="text-sm text-zinc-500">
              Exibindo{" "}
              <strong className="text-white">
                {filteredClients.length}
              </strong>{" "}
              de{" "}
              <strong className="text-white">
                {clients.length}
              </strong>{" "}
              clientes
            </p>

            {hasActiveFilters && (
              <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-400">
                Filtros ativos
              </span>
            )}
          </div>
        </section>

        {filteredClients.length === 0 ? (
          <EmptyState
            hasFilters={hasActiveFilters}
            onClear={clearFilters}
          />
        ) : (
          <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {filteredClients.map(
              (client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onOpen={
                    setSelectedClient
                  }
                />
              )
            )}
          </section>
        )}
      </div>

            <ClientDetailsDrawer
        client={selectedClient}
        open={selectedClient !== null}
        onClose={() =>
          setSelectedClient(null)
        }
        onClientChange={
          handleClientChange
        }
      />
    </>
  );
}

type ClientCardProps = {
  client: ClientListItem;

  onOpen: (
    client: ClientListItem
  ) => void;
};

function ClientCard({
  client,
  onOpen,
}: ClientCardProps) {
  const location = [
    client.city,
    client.state,
  ]
    .filter(Boolean)
    .join(" - ");

  const proposalValue =
    client.proposals.reduce(
      (total, proposal) =>
        total + proposal.amount,
      0
    );

  return (
    <article
      onClick={() => onOpen(client)}
      className="group cursor-pointer rounded-3xl border border-white/[0.07] bg-zinc-950 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/30 hover:shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10 text-orange-400">
          <Building2 size={21} />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-orange-500">
            Cliente
          </p>

          <h2 className="mt-1 truncate text-xl font-bold text-white">
            {client.name}
          </h2>

          <p className="mt-1 truncate text-xs text-zinc-500">
            {client.document ??
              "Documento não informado"}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <InfoBox
          label="Projetos"
          value={String(
            client.projects.length
          )}
        />

        <InfoBox
          label="Propostas"
          value={String(
            client.proposals.length
          )}
        />

        <InfoBox
          label="Volume comercial"
          value={formatCurrency(
            proposalValue
          )}
          highlight
        />

        <InfoBox
          label="Origem"
          value={
            client.lead
              ? "Lead convertido"
              : "Cadastro direto"
          }
        />
      </div>

      <div className="mt-5 space-y-3 border-t border-white/[0.06] pt-4">
        <ContactLine
          icon={MapPin}
          value={
            location ||
            "Localização não informada"
          }
        />

        <ContactLine
          icon={Phone}
          value={
            client.phone ??
            "Telefone não informado"
          }
        />

        <ContactLine
          icon={Mail}
          value={
            client.email ??
            "E-mail não informado"
          }
        />
      </div>
    </article>
  );
}

type ContactLineProps = {
  icon: typeof MapPin;
  value: string;
};

function ContactLine({
  icon: Icon,
  value,
}: ContactLineProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-zinc-400">
      <Icon
        size={15}
        className="shrink-0 text-zinc-600"
      />

      <span className="truncate">
        {value}
      </span>
    </div>
  );
}

type InfoBoxProps = {
  label: string;
  value: string;
  highlight?: boolean;
};

function InfoBox({
  label,
  value,
  highlight = false,
}: InfoBoxProps) {
  return (
    <div
      className={`rounded-xl border p-3 ${
        highlight
          ? "border-orange-500/15 bg-orange-500/[0.05]"
          : "border-white/[0.06] bg-zinc-900/70"
      }`}
    >
      <p className="text-[11px] uppercase tracking-wide text-zinc-600">
        {label}
      </p>

      <p
        className={`mt-1 truncate text-sm font-bold ${
          highlight
            ? "text-orange-400"
            : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

type MetricCardProps = {
  icon: typeof UsersRound;
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
        <UserRound size={24} />
      </div>

      <h2 className="mt-5 text-xl font-bold text-white">
        {hasFilters
          ? "Nenhum cliente encontrado"
          : "Nenhum cliente cadastrado"}
      </h2>

      <p className="mt-2 text-sm text-zinc-500">
        {hasFilters
          ? "Altere a pesquisa ou limpe os filtros."
          : "Os leads ganhos e convertidos aparecerão aqui."}
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