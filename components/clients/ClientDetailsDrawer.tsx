"use client";

import {
  useEffect,
  useState,
} from "react";
import {
  Building2,
  CheckCircle2,
  CircleDollarSign,
  FileText,
  FolderKanban,
  History,
  LoaderCircle,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Save,
  UserRound,
  X,
  XCircle,
} from "lucide-react";

import { Drawer } from "@/components/ui/Drawer";
import type { ClientListItem } from "@/types/client";

type ClientTab =
  | "Resumo"
  | "Projetos"
  | "Propostas"
  | "Financeiro"
  | "Histórico";

type Props = {
  client: ClientListItem | null;
  open: boolean;
  onClose: () => void;

  onClientChange?: (
    client: ClientListItem
  ) => void;
};

type FeedbackMessage = {
  type: "success" | "error";
  text: string;
} | null;

type ClientFormData = {
  name: string;
  document: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  address: string;
};

const tabs: {
  name: ClientTab;
  icon: typeof Building2;
}[] = [
  {
    name: "Resumo",
    icon: Building2,
  },
  {
    name: "Projetos",
    icon: FolderKanban,
  },
  {
    name: "Propostas",
    icon: FileText,
  },
  {
    name: "Financeiro",
    icon: CircleDollarSign,
  },
  {
    name: "Histórico",
    icon: History,
  },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

function createClientForm(
  client: ClientListItem
): ClientFormData {
  return {
    name: client.name,
    document: client.document ?? "",
    phone: client.phone ?? "",
    email: client.email ?? "",
    city: client.city ?? "",
    state: client.state ?? "",
    address: client.address ?? "",
  };
}

function nullableText(value: string) {
  const text = value.trim();

  return text.length > 0 ? text : null;
}

export function ClientDetailsDrawer({
  client,
  open,
  onClose,
  onClientChange,
}: Props) {
  const [activeTab, setActiveTab] =
    useState<ClientTab>("Resumo");

  const [
    currentClient,
    setCurrentClient,
  ] =
    useState<ClientListItem | null>(
      client
    );

  const [editing, setEditing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [feedback, setFeedback] =
    useState<FeedbackMessage>(null);

  const [form, setForm] =
    useState<ClientFormData>({
      name: "",
      document: "",
      phone: "",
      email: "",
      city: "",
      state: "",
      address: "",
    });

  useEffect(() => {
    setCurrentClient(client);

    if (client) {
      setActiveTab("Resumo");
      setEditing(false);
      setFeedback(null);
      setForm(createClientForm(client));
    }
  }, [client]);

  function cancelEditing() {
    if (!currentClient) {
      return;
    }

    setForm(
      createClientForm(currentClient)
    );

    setEditing(false);
    setFeedback(null);
  }

  async function saveClient() {
    if (!currentClient || saving) {
      return;
    }

    const name = form.name.trim();

    if (!name) {
      setFeedback({
        type: "error",
        text:
          "O nome do cliente é obrigatório.",
      });

      return;
    }

    const previousClient =
      currentClient;

    setSaving(true);
    setFeedback(null);

    try {
      const response = await fetch(
        "/api/clients",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            id: currentClient.id,
            name,
            document:
              nullableText(
                form.document
              ),
            phone:
              nullableText(form.phone),
            email:
              nullableText(form.email),
            city:
              nullableText(form.city),
            state:
              nullableText(
                form.state
              ),
            address:
              nullableText(
                form.address
              ),
          }),
        }
      );

      const responseData =
        await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.error ??
            "Erro ao salvar cliente."
        );
      }

      const updatedClient:
        ClientListItem = {
        ...previousClient,
        ...responseData,
        lead:
          responseData.lead ??
          previousClient.lead,
        proposals:
          responseData.proposals ??
          previousClient.proposals,
        projects:
          responseData.projects ??
          previousClient.projects,
      };

      setCurrentClient(
        updatedClient
      );

      setForm(
        createClientForm(
          updatedClient
        )
      );

      setEditing(false);

      onClientChange?.(
        updatedClient
      );

      setFeedback({
        type: "success",
        text:
          "Dados do cliente atualizados com sucesso.",
      });
    } catch (error) {
      console.error(
        "ERRO AO ATUALIZAR CLIENTE:",
        error
      );

      setCurrentClient(
        previousClient
      );

      setFeedback({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Não foi possível salvar o cliente.",
      });
    } finally {
      setSaving(false);
    }
  }

  if (!currentClient) {
    return null;
  }

  const proposalValue =
    currentClient.proposals.reduce(
      (total, proposal) =>
        total + proposal.amount,
      0
    );

  const location = [
    currentClient.city,
    currentClient.state,
  ]
    .filter(Boolean)
    .join(" - ");

  return (
    <Drawer
      open={open}
      onClose={onClose}
      eyebrow="Relacionamento"
      title={currentClient.name}
      description={
        currentClient.document ??
        "Documento não informado"
      }
      maxWidthClassName="max-w-5xl"
    >
      {feedback && (
        <div className="px-8 pt-6">
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
          label="Projetos"
          value={String(
            currentClient.projects.length
          )}
        />

        <SummaryCard
          label="Propostas"
          value={String(
            currentClient.proposals.length
          )}
        />

        <SummaryCard
          label="Volume comercial"
          value={formatCurrency(
            proposalValue
          )}
          highlight
        />

        <SummaryCard
          label="Origem"
          value={
            currentClient.lead
              ? "Lead convertido"
              : "Cadastro direto"
          }
        />
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
                className={`flex items-center gap-2 border-b-2 px-5 py-4 text-sm font-semibold transition ${
                  activeTab === tab.name
                    ? "border-orange-500 text-orange-400"
                    : "border-transparent text-zinc-500 hover:text-white"
                }`}
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
          <ClientSummaryTab
            client={currentClient}
            location={location}
            editing={editing}
            saving={saving}
            form={form}
            onFormChange={setForm}
            onStartEditing={() => {
              setEditing(true);
              setFeedback(null);
            }}
            onCancelEditing={
              cancelEditing
            }
            onSave={saveClient}
          />
        )}

        {activeTab === "Projetos" && (
          <ClientProjectsTab
            client={currentClient}
          />
        )}

        {activeTab === "Propostas" && (
          <ClientProposalsTab
            client={currentClient}
          />
        )}

        {activeTab === "Financeiro" && (
          <ClientFinancialTab
            proposalValue={
              proposalValue
            }
          />
        )}

        {activeTab === "Histórico" && (
          <ClientHistoryTab
            client={currentClient}
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
      className={`rounded-2xl border p-4 ${
        highlight
          ? "border-orange-500/20 bg-orange-500/[0.06]"
          : "border-white/[0.06] bg-zinc-900/70"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </p>

      <p
        className={`mt-2 truncate text-xl font-black ${
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

type ClientSummaryTabProps = {
  client: ClientListItem;
  location: string;
  editing: boolean;
  saving: boolean;
  form: ClientFormData;

  onFormChange: (
    form: ClientFormData
  ) => void;

  onStartEditing: () => void;
  onCancelEditing: () => void;
  onSave: () => void;
};

function ClientSummaryTab({
  client,
  location,
  editing,
  saving,
  form,
  onFormChange,
  onStartEditing,
  onCancelEditing,
  onSave,
}: ClientSummaryTabProps) {
  if (editing) {
    return (
      <section className="rounded-3xl border border-white/[0.07] bg-zinc-900/60 p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">
            Cadastro
          </p>

          <h2 className="mt-2 text-xl font-black text-white">
            Editar cliente
          </h2>

          <p className="mt-2 text-sm text-zinc-500">
            Atualize os dados cadastrais e salve as alterações.
          </p>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <FormField
            id="client-name"
            label="Nome"
            value={form.name}
            required
            onChange={(value) =>
              onFormChange({
                ...form,
                name: value,
              })
            }
          />

          <FormField
            id="client-document"
            label="CPF ou CNPJ"
            value={form.document}
            onChange={(value) =>
              onFormChange({
                ...form,
                document: value,
              })
            }
          />

          <FormField
            id="client-phone"
            label="Telefone"
            value={form.phone}
            onChange={(value) =>
              onFormChange({
                ...form,
                phone: value,
              })
            }
          />

          <FormField
            id="client-email"
            label="E-mail"
            type="email"
            value={form.email}
            onChange={(value) =>
              onFormChange({
                ...form,
                email: value,
              })
            }
          />

          <FormField
            id="client-city"
            label="Cidade"
            value={form.city}
            onChange={(value) =>
              onFormChange({
                ...form,
                city: value,
              })
            }
          />

          <FormField
            id="client-state"
            label="Estado"
            value={form.state}
            maxLength={2}
            onChange={(value) =>
              onFormChange({
                ...form,
                state:
                  value.toUpperCase(),
              })
            }
          />
        </div>

        <div className="mt-5">
          <label
            htmlFor="client-address"
            className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500"
          >
            Endereço
          </label>

          <textarea
            id="client-address"
            value={form.address}
            onChange={(event) =>
              onFormChange({
                ...form,
                address:
                  event.target.value,
              })
            }
            rows={4}
            placeholder="Rua, número, bairro e complemento"
            className="w-full resize-y rounded-xl border border-white/[0.08] bg-zinc-950 p-4 text-sm leading-6 text-white outline-none transition placeholder:text-zinc-600 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5"
          />
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onCancelEditing}
            disabled={saving}
            className="rounded-xl border border-white/[0.08] bg-zinc-950 px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <LoaderCircle
                size={17}
                className="animate-spin"
              />
            ) : (
              <Save size={17} />
            )}

            {saving
              ? "Salvando..."
              : "Salvar cliente"}
          </button>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-white">
            Dados do cliente
          </h2>

          <button
            type="button"
            onClick={onStartEditing}
            className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:border-orange-500/30 hover:bg-orange-500/10 hover:text-orange-400"
          >
            <Pencil size={16} />

            Editar cliente
          </button>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <InfoCard
            icon={Building2}
            label="Nome"
            value={client.name}
          />

          <InfoCard
            icon={UserRound}
            label="Documento"
            value={
              client.document ?? "-"
            }
          />

          <InfoCard
            icon={Phone}
            label="Telefone"
            value={client.phone ?? "-"}
          />

          <InfoCard
            icon={Mail}
            label="E-mail"
            value={client.email ?? "-"}
          />

          <InfoCard
            icon={MapPin}
            label="Localização"
            value={location || "-"}
          />

          <InfoCard
            icon={MapPin}
            label="Endereço"
            value={client.address ?? "-"}
          />
        </div>
      </section>

      {client.lead && (
        <section>
          <h2 className="text-lg font-bold text-white">
            Origem comercial
          </h2>

          <div className="mt-4 rounded-2xl border border-orange-500/15 bg-orange-500/[0.05] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-orange-400">
              Lead convertido
            </p>

            <h3 className="mt-2 text-lg font-bold text-white">
              {client.lead.companyName}
            </h3>

            <p className="mt-1 text-sm text-zinc-400">
              Contato:{" "}
              {client.lead.contactName}
            </p>

            <p className="mt-3 text-sm text-zinc-500">
              Valor estimado:{" "}
              <strong className="text-orange-400">
                {formatCurrency(
                  client.lead
                    .estimatedValue ?? 0
                )}
              </strong>
            </p>
          </div>
        </section>
      )}
    </div>
  );
}

type FormFieldProps = {
  id: string;
  label: string;
  value: string;
  type?: string;
  required?: boolean;
  maxLength?: number;
  onChange: (value: string) => void;
};

function FormField({
  id,
  label,
  value,
  type = "text",
  required = false,
  maxLength,
  onChange,
}: FormFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500"
      >
        {label}

        {required && (
          <span className="ml-1 text-orange-400">
            *
          </span>
        )}
      </label>

      <input
        id={id}
        type={type}
        value={value}
        maxLength={maxLength}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-12 w-full rounded-xl border border-white/[0.08] bg-zinc-950 px-4 text-sm text-white outline-none transition focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5"
      />
    </div>
  );
}

type ClientProjectsTabProps = {
  client: ClientListItem;
};

function ClientProjectsTab({
  client,
}: ClientProjectsTabProps) {
  if (client.projects.length === 0) {
    return (
      <EmptyTab
        icon={FolderKanban}
        title="Nenhum projeto vinculado"
        description="Os projetos deste cliente aparecerão aqui."
      />
    );
  }

  return (
    <div className="space-y-4">
      {client.projects.map(
        (project) => (
          <div
            key={project.id}
            className="rounded-2xl border border-white/[0.07] bg-zinc-900/60 p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-orange-500">
                  Projeto
                </p>

                <h3 className="mt-2 text-lg font-bold text-white">
                  {project.title}
                </h3>
              </div>

              <span className="rounded-full border border-white/[0.08] bg-zinc-950 px-3 py-1 text-xs font-semibold text-zinc-400">
                {project.status}
              </span>
            </div>

            <p className="mt-4 text-xs text-zinc-600">
              Criado em{" "}
              {formatDate(
                project.createdAt
              )}
            </p>
          </div>
        )
      )}
    </div>
  );
}

type ClientProposalsTabProps = {
  client: ClientListItem;
};

function ClientProposalsTab({
  client,
}: ClientProposalsTabProps) {
  if (client.proposals.length === 0) {
    return (
      <EmptyTab
        icon={FileText}
        title="Nenhuma proposta vinculada"
        description="As propostas deste cliente aparecerão aqui."
      />
    );
  }

  return (
    <div className="space-y-4">
      {client.proposals.map(
        (proposal) => (
          <div
            key={proposal.id}
            className="rounded-2xl border border-white/[0.07] bg-zinc-900/60 p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-orange-500">
                  Proposta comercial
                </p>

                <h3 className="mt-2 text-lg font-bold text-white">
                  {proposal.title}
                </h3>
              </div>

              <span className="rounded-full border border-white/[0.08] bg-zinc-950 px-3 py-1 text-xs font-semibold text-zinc-400">
                {proposal.status}
              </span>
            </div>

            <p className="mt-5 text-2xl font-black text-orange-400">
              {formatCurrency(
                proposal.amount
              )}
            </p>

            <p className="mt-3 text-xs text-zinc-600">
              Atualizada em{" "}
              {formatDate(
                proposal.updatedAt
              )}
            </p>
          </div>
        )
      )}
    </div>
  );
}

type ClientFinancialTabProps = {
  proposalValue: number;
};

function ClientFinancialTab({
  proposalValue,
}: ClientFinancialTabProps) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-orange-500/20 bg-orange-500/[0.05] p-6">
        <CircleDollarSign
          size={22}
          className="text-orange-400"
        />

        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Volume comercial
        </p>

        <p className="mt-2 text-3xl font-black text-orange-400">
          {formatCurrency(
            proposalValue
          )}
        </p>
      </div>

      <EmptyTab
        icon={CircleDollarSign}
        title="Integração financeira"
        description="Recebimentos, parcelas e valores pendentes serão exibidos após a integração com o Financeiro."
      />
    </div>
  );
}

type ClientHistoryTabProps = {
  client: ClientListItem;
};

function ClientHistoryTab({
  client,
}: ClientHistoryTabProps) {
  return (
    <div className="space-y-4">
      <HistoryItem
        title="Cliente cadastrado"
        description="O cliente foi criado no ERP."
        date={formatDate(
          client.createdAt
        )}
      />

      <HistoryItem
        title="Última atualização"
        description="Os dados do cliente foram atualizados."
        date={formatDate(
          client.updatedAt
        )}
      />

      {client.lead && (
        <HistoryItem
          title="Conversão comercial"
          description="O cliente foi criado a partir de um lead ganho."
          date={formatDate(
            client.lead.updatedAt
          )}
          highlight
        />
      )}
    </div>
  );
}

type InfoCardProps = {
  icon: typeof Building2;
  label: string;
  value: string;
};

function InfoCard({
  icon: Icon,
  label,
  value,
}: InfoCardProps) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-zinc-900/60 p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-zinc-500">
          <Icon size={18} />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            {label}
          </p>

          <p className="mt-2 truncate font-bold text-white">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

type EmptyTabProps = {
  icon: typeof FolderKanban;
  title: string;
  description: string;
};

function EmptyTab({
  icon: Icon,
  title,
  description,
}: EmptyTabProps) {
  return (
    <div className="rounded-2xl border border-dashed border-white/[0.08] bg-zinc-900/40 p-10 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-950 text-zinc-500">
        <Icon size={21} />
      </div>

      <h3 className="mt-4 font-bold text-white">
        {title}
      </h3>

      <p className="mt-2 text-sm text-zinc-500">
        {description}
      </p>
    </div>
  );
}

type HistoryItemProps = {
  title: string;
  description: string;
  date: string;
  highlight?: boolean;
};

function HistoryItem({
  title,
  description,
  date,
  highlight = false,
}: HistoryItemProps) {
  return (
    <div className="flex gap-4 rounded-2xl border border-white/[0.07] bg-zinc-900/60 p-5">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          highlight
            ? "bg-orange-500/10 text-orange-400"
            : "bg-zinc-950 text-zinc-500"
        }`}
      >
        <History size={18} />
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