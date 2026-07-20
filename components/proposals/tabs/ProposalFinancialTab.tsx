"use client";

import {
  useEffect,
  useState,
} from "react";
import {
  CalendarDays,
  Check,
  CircleDollarSign,
  Landmark,
  LoaderCircle,
  Save,
  Send,
  XCircle,
} from "lucide-react";

import type {
  ProposalListItem,
  ProposalStatus,
} from "@/types/proposal";

export type ProposalCommercialData = {
  validUntil: string | null;
  paymentTerms: string | null;
  executionDeadline: string | null;
  commercialNotes: string | null;
};

type Props = {
  proposal: ProposalListItem;

  onStatusChange: (
    status: ProposalStatus
  ) => Promise<void>;

  onCommercialChange: (
    data: ProposalCommercialData
  ) => Promise<void>;
};

const statusOptions: {
  value: ProposalStatus;
  label: string;
  description: string;
  icon: typeof Landmark;
  className: string;
  activeClassName: string;
}[] = [
  {
    value: "RASCUNHO",
    label: "Rascunho",
    description:
      "A proposta ainda está em preparação.",
    icon: Landmark,
    className:
      "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-600",
    activeClassName:
      "border-zinc-500 bg-zinc-500/10 text-zinc-200",
  },
  {
    value: "ENVIADA",
    label: "Enviada",
    description:
      "A proposta foi enviada ao cliente.",
    icon: Send,
    className:
      "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-sky-500/40",
    activeClassName:
      "border-sky-500/40 bg-sky-500/10 text-sky-400",
  },
  {
    value: "APROVADA",
    label: "Aprovada",
    description:
      "O cliente aprovou a proposta.",
    icon: Check,
    className:
      "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-emerald-500/40",
    activeClassName:
      "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  },
  {
    value: "RECUSADA",
    label: "Recusada",
    description:
      "O cliente recusou a proposta.",
    icon: XCircle,
    className:
      "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-red-500/40",
    activeClassName:
      "border-red-500/40 bg-red-500/10 text-red-400",
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

function formatDate(
  value: Date | string | null
) {
  if (!value) {
    return "Não informada";
  }

  return new Intl.DateTimeFormat(
    "pt-BR"
  ).format(new Date(value));
}

function formatDateInput(
  value: Date | string | null
) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (
    Number.isNaN(date.getTime())
  ) {
    return "";
  }

  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
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

export function ProposalFinancialTab({
  proposal,
  onStatusChange,
  onCommercialChange,
}: Props) {
  const [
    savingStatus,
    setSavingStatus,
  ] =
    useState<ProposalStatus | null>(
      null
    );

  const [
    savingCommercial,
    setSavingCommercial,
  ] =
    useState(false);

  const [form, setForm] =
    useState({
      validUntil:
        formatDateInput(
          proposal.validUntil
        ),

      paymentTerms:
        proposal.paymentTerms ?? "",

      executionDeadline:
        proposal.executionDeadline ??
        "",

      commercialNotes:
        proposal.commercialNotes ?? "",
    });

  useEffect(() => {
    setForm({
      validUntil:
        formatDateInput(
          proposal.validUntil
        ),

      paymentTerms:
        proposal.paymentTerms ?? "",

      executionDeadline:
        proposal.executionDeadline ??
        "",

      commercialNotes:
        proposal.commercialNotes ?? "",
    });
  }, [proposal]);

  const currentStatus =
    normalizeStatus(
      proposal.status
    );

  async function handleStatusChange(
    status: ProposalStatus
  ) {
    if (
      savingStatus ||
      status === currentStatus
    ) {
      return;
    }

    setSavingStatus(status);

    try {
      await onStatusChange(status);
    } finally {
      setSavingStatus(null);
    }
  }

  async function saveCommercialData() {
    if (savingCommercial) {
      return;
    }

    setSavingCommercial(true);

    try {
      await onCommercialChange({
        validUntil:
          form.validUntil || null,

        paymentTerms:
          form.paymentTerms.trim() ||
          null,

        executionDeadline:
          form.executionDeadline.trim() ||
          null,

        commercialNotes:
          form.commercialNotes.trim() ||
          null,
      });
    } finally {
      setSavingCommercial(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2">
        <FinancialCard
          icon={CircleDollarSign}
          label="Valor comercial"
          value={formatCurrency(
            proposal.amount
          )}
          highlight
        />

        <FinancialCard
          icon={CalendarDays}
          label="Validade"
          value={formatDate(
            proposal.validUntil
          )}
        />

        <FinancialCard
          icon={Landmark}
          label="Situação atual"
          value={
            statusOptions.find(
              (option) =>
                option.value ===
                currentStatus
            )?.label ?? "Rascunho"
          }
        />

        <FinancialCard
          icon={CircleDollarSign}
          label="Valor recebido"
          value="Ainda não vinculado"
        />
      </section>

      <section className="rounded-3xl border border-white/[0.07] bg-zinc-900/60 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">
          Dados comerciais
        </p>

        <h2 className="mt-2 text-xl font-black text-white">
          Condições da proposta
        </h2>

        <p className="mt-2 text-sm text-zinc-500">
          Estas informações serão utilizadas no documento comercial.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="proposal-valid-until"
              className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500"
            >
              Validade
            </label>

            <input
              id="proposal-valid-until"
              type="date"
              value={form.validUntil}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  validUntil:
                    event.target.value,
                }))
              }
              className="h-12 w-full rounded-xl border border-white/[0.08] bg-zinc-950 px-4 text-sm text-white outline-none transition focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5"
            />
          </div>

          <div>
            <label
              htmlFor="proposal-execution-deadline"
              className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500"
            >
              Prazo de execução
            </label>

            <input
              id="proposal-execution-deadline"
              type="text"
              value={
                form.executionDeadline
              }
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  executionDeadline:
                    event.target.value,
                }))
              }
              placeholder="Ex.: 30 dias após a assinatura"
              className="h-12 w-full rounded-xl border border-white/[0.08] bg-zinc-950 px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5"
            />
          </div>
        </div>

        <div className="mt-5">
          <label
            htmlFor="proposal-payment-terms"
            className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500"
          >
            Condições de pagamento
          </label>

          <textarea
            id="proposal-payment-terms"
            value={form.paymentTerms}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                paymentTerms:
                  event.target.value,
              }))
            }
            placeholder="Ex.: 30% de entrada e saldo na instalação"
            rows={4}
            className="w-full resize-y rounded-xl border border-white/[0.08] bg-zinc-950 p-4 text-sm leading-6 text-white outline-none transition placeholder:text-zinc-600 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5"
          />
        </div>

        <div className="mt-5">
          <label
            htmlFor="proposal-commercial-notes"
            className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500"
          >
            Observações comerciais
          </label>

          <textarea
            id="proposal-commercial-notes"
            value={
              form.commercialNotes
            }
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                commercialNotes:
                  event.target.value,
              }))
            }
            placeholder="Informações complementares, responsabilidades e condições específicas."
            rows={5}
            className="w-full resize-y rounded-xl border border-white/[0.08] bg-zinc-950 p-4 text-sm leading-6 text-white outline-none transition placeholder:text-zinc-600 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5"
          />
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={saveCommercialData}
            disabled={savingCommercial}
            className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {savingCommercial ? (
              <LoaderCircle
                size={17}
                className="animate-spin"
              />
            ) : (
              <Save size={17} />
            )}

            {savingCommercial
              ? "Salvando..."
              : "Salvar condições"}
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-white/[0.07] bg-zinc-900/60 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">
          Fluxo comercial
        </p>

        <h2 className="mt-2 text-xl font-black text-white">
          Status da proposta
        </h2>

        <p className="mt-2 text-sm text-zinc-500">
          Atualize a situação conforme o andamento da negociação.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {statusOptions.map(
            (option) => {
              const Icon = option.icon;

              const isActive =
                currentStatus ===
                option.value;

              const isSaving =
                savingStatus ===
                option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  disabled={
                    savingStatus !== null
                  }
                  onClick={() =>
                    handleStatusChange(
                      option.value
                    )
                  }
                  className={`flex items-start gap-4 rounded-2xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    isActive
                      ? option.activeClassName
                      : option.className
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/20">
                    {isSaving ? (
                      <LoaderCircle
                        size={18}
                        className="animate-spin"
                      />
                    ) : (
                      <Icon size={18} />
                    )}
                  </div>

                  <div>
                    <p className="font-bold">
                      {option.label}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-zinc-500">
                      {
                        option.description
                      }
                    </p>
                  </div>
                </button>
              );
            }
          )}
        </div>
      </section>

      <div className="rounded-2xl border border-dashed border-white/[0.08] bg-zinc-900/40 p-8 text-center">
        <h3 className="font-bold text-white">
          Integração financeira
        </h3>

        <p className="mt-2 text-sm text-zinc-500">
          Quando a proposta for aprovada,
          este espaço mostrará parcelas,
          recebimentos e saldo pendente.
        </p>
      </div>
    </div>
  );
}

type FinancialCardProps = {
  icon: typeof Landmark;
  label: string;
  value: string;
  highlight?: boolean;
};

function FinancialCard({
  icon: Icon,
  label,
  value,
  highlight = false,
}: FinancialCardProps) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        highlight
          ? "border-orange-500/20 bg-orange-500/[0.05]"
          : "border-white/[0.07] bg-zinc-900/60"
      }`}
    >
      <Icon
        size={20}
        className={
          highlight
            ? "text-orange-400"
            : "text-zinc-500"
        }
      />

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </p>

      <p
        className={`mt-2 text-xl font-black ${
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