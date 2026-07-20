import { revalidatePath } from "next/cache";

import {
  generateInstallments,
  getInstallments,
} from "@/services/financial-installments.service";

import { receiveFinancialInstallment } from "@/services/financial-receipt.service";

import { AppLayout } from "@/components/layout/AppLayout";
import {
  listCompanyFinancials,
  updateFinancialData,
} from "@/services/financial.service";
import { FinancialUpload } from "@/components/financial/FinancialUpload";
import { FinancialAttachments } from "@/components/financial/FinancialAttachments";
import { getCurrentCompanyId } from "@/lib/auth/current-user";


function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatNumberInput(value: number) {
  return value.toFixed(2);
}

function statusLabel(status: string) {
  switch (status) {
    case "RECEBIDO":
      return "Recebido";

    case "PARCIAL":
      return "Parcial";

    case "PENDENTE":
      return "Pendente";

    case "CANCELADO":
      return "Cancelado";

    default:
      return status;
  }
}

function statusClass(status: string) {
  switch (status) {
    case "RECEBIDO":
      return "bg-emerald-500/15 text-emerald-400";

    case "PARCIAL":
      return "bg-cyan-500/15 text-cyan-400";

    case "CANCELADO":
      return "bg-red-500/15 text-red-400";

    default:
      return "bg-orange-500/15 text-orange-400";
  }
}

function parseCurrencyValue(value: FormDataEntryValue | null) {
  const rawValue = String(value ?? "")
    .replace(/\./g, "")
    .replace(",", ".")
    .trim();

  const parsedValue = Number(rawValue);

  return Number.isFinite(parsedValue)
    ? parsedValue
    : 0;
}

async function updateFinancial(
  formData: FormData
) {
  "use server";

  const companyId =
  await getCurrentCompanyId();

  const id = String(
    formData.get("id") ?? ""
  ).trim();

  const saleValue = parseCurrencyValue(
    formData.get("saleValue")
  );

  const costValue = parseCurrencyValue(
    formData.get("costValue")
  );

  const receivedValue =
    parseCurrencyValue(
      formData.get("receivedValue")
    );

  const status = String(
    formData.get("status") ?? "PENDENTE"
  ).trim();

  const notes = String(
    formData.get("notes") ?? ""
  ).trim();

  if (!id) {
    throw new Error(
      "Registro financeiro não identificado."
    );
  }
  async function generateFinancialInstallments(
  formData: FormData
) {
  "use server";

  const financialId = String(
    formData.get("financialId") ?? ""
  );

  const totalValue = Number(
    formData.get("totalValue")
  );

  const quantity = Number(
    formData.get("quantity")
  );

  const firstDueDate = new Date(
    String(formData.get("firstDueDate"))
  );

  await generateInstallments({
    financialId,
    totalValue,
    quantity,
    firstDueDate,
  });

  revalidatePath("/financeiro");
}

  await updateFinancialData({
    id,
    companyId,
    saleValue,
    costValue,
    receivedValue,
    status,
    notes,
  });

  revalidatePath("/financeiro");
  revalidatePath("/");
  revalidatePath("/engenharia");
}
async function generateFinancialInstallments(
  formData: FormData
) {
  "use server";

  const financialId = String(
    formData.get("financialId") ?? ""
  );

  const totalValue = Number(
    formData.get("totalValue")
  );

  const quantity = Number(
    formData.get("quantity")
  );

  const firstDueDate = new Date(
    String(formData.get("firstDueDate"))
  );

  await generateInstallments({
    financialId,
    totalValue,
    quantity,
    firstDueDate,
  });

  revalidatePath("/financeiro");
}

export default async function FinanceiroPage() {

  const companyId =
  await getCurrentCompanyId();
  const financeiros =
    await listCompanyFinancials(
  companyId
);
  const totalVendido = financeiros.reduce(
    (total, item) =>
      total + item.saleValue,
    0
  );

  const totalRecebido =
    financeiros.reduce(
      (total, item) =>
        total + item.receivedValue,
      0
    );

  const totalPendente =
    totalVendido - totalRecebido;

  const totalCustos = financeiros.reduce(
    (total, item) =>
      total + item.costValue,
    0
  );

  const lucroEstimado =
    totalVendido - totalCustos;

  const margem =
    totalVendido === 0
      ? 0
      : Math.round(
          (lucroEstimado /
            totalVendido) *
            100
        );

  return (
    <AppLayout>
      <main className="space-y-8">
        <div className="flex items-start justify-between">
  <div>
    <h1 className="text-4xl font-bold text-white">
      Financeiro
    </h1>

    <p className="mt-2 text-zinc-400">
      Controle de vendas, custos e recebimentos.
    </p>
  </div>

  <a
    href="/financeiro/fluxo-caixa"
    className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-white transition hover:bg-orange-600"
  >
    Fluxo de Caixa
  </a>
</div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          <Card
            label="Total vendido"
            value={formatCurrency(
              totalVendido
            )}
          />

          <Card
            label="Total recebido"
            value={formatCurrency(
              totalRecebido
            )}
            valueClass="text-emerald-400"
          />

          <Card
            label="Total pendente"
            value={formatCurrency(
              totalPendente
            )}
            valueClass="text-orange-400"
          />

          <Card
            label="Custos"
            value={formatCurrency(
              totalCustos
            )}
            valueClass="text-red-400"
          />

          <Card
            label="Lucro estimado"
            value={formatCurrency(
              lucroEstimado
            )}
            valueClass="text-cyan-400"
          />

          <Card
            label="Margem"
            value={`${margem}%`}
            valueClass="text-emerald-400"
          />
        </div>

        <div className="space-y-5">
          {financeiros.map(
            (financeiro) => {
              const pendente =
                financeiro.saleValue -
                financeiro.receivedValue;

              const lucro =
                financeiro.saleValue -
                financeiro.costValue;

              return (
                <form
                  key={financeiro.id}
                  action={updateFinancial}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
                >
                  <input
                    type="hidden"
                    name="id"
                    value={financeiro.id}
                  />

                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-orange-500">
                        {
                          financeiro.project
                            .title
                        }
                      </p>

                      <h2 className="mt-1 text-2xl font-bold text-white">
                        {
                          financeiro.project
                            .client.name
                        }
                      </h2>
                    </div>

                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                        financeiro.status
                      )}`}
                    >
                      {statusLabel(
                        financeiro.status
                      )}
                    </span>
                  </div>

                  <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                    <Field label="Valor da venda">
                      <input
                        type="number"
                        name="saleValue"
                        min="0"
                        step="0.01"
                        defaultValue={formatNumberInput(
                          financeiro.saleValue
                        )}
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Custos">
                      <input
                        type="number"
                        name="costValue"
                        min="0"
                        step="0.01"
                        defaultValue={formatNumberInput(
                          financeiro.costValue
                        )}
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Valor recebido">
                      <input
                        type="number"
                        name="receivedValue"
                        min="0"
                        step="0.01"
                        defaultValue={formatNumberInput(
                          financeiro.receivedValue
                        )}
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Status">
                      <select
                        name="status"
                        defaultValue={
                          financeiro.status
                        }
                        className={inputClass}
                      >
                        <option value="PENDENTE">
                          Pendente
                        </option>

                        <option value="PARCIAL">
                          Parcial
                        </option>

                        <option value="RECEBIDO">
                          Recebido
                        </option>

                        <option value="CANCELADO">
                          Cancelado
                        </option>
                      </select>
                    </Field>
                  </div>

                  <div className="mt-5 grid gap-5 md:grid-cols-3">
                    <Summary
                      label="Pendente"
                      value={formatCurrency(
                        pendente
                      )}
                    />

                    <Summary
                      label="Lucro estimado"
                      value={formatCurrency(
                        lucro
                      )}
                    />

                    <Summary
                      label="Percentual recebido"
                      value={`${
                        financeiro.saleValue ===
                        0
                          ? 0
                          : Math.round(
                              (financeiro.receivedValue /
                                financeiro.saleValue) *
                                100
                            )
                      }%`}
                    />
                  </div>

                  <div className="mt-5">
                    <Field label="Observações">
                      
                      <textarea
                        name="notes"
                        rows={4}
                        defaultValue={
                          financeiro.notes ??
                          ""
                        }
                        placeholder="Observações financeiras, condições de pagamento e pendências."
                        className={textareaClass}
                      />
                    </Field>
                  </div>

                  {financeiro.installments.length > 0 && (
  <div className="mt-6 overflow-hidden rounded-xl border border-zinc-800">
    <div className="border-b border-zinc-800 bg-zinc-950 p-4">
      <h3 className="font-bold text-white">
        Parcelas
      </h3>
    </div>

    <table className="w-full">
      <thead>
        <tr className="border-b border-zinc-800 text-sm text-zinc-400">
          <th className="p-3 text-left">
            Nº
          </th>

          <th className="p-3 text-left">
            Vencimento
          </th>

          <th className="p-3 text-left">
            Valor
          </th>

          <th className="p-3 text-left">
            Status
          </th>
          <th className="p-3 text-left">
  Ações
</th>
        </tr>
      </thead>

      <tbody>
        {financeiro.installments.map(
          (parcela) => (
            <tr
              key={parcela.id}
              className="border-b border-zinc-800 last:border-b-0"
            >
              <td className="p-3 text-zinc-300">
                {parcela.number}
              </td>

              <td className="p-3 text-zinc-300">
                {new Intl.DateTimeFormat(
                  "pt-BR"
                ).format(parcela.dueDate)}
              </td>

              <td className="p-3 text-zinc-300">
                {formatCurrency(
                  parcela.value
                )}
              </td>

              <td className="p-3">
                <span
                  className={
                    parcela.status === "PAGO"
                      ? "text-emerald-400"
                      : "text-orange-400"
                  }
                >
                  {parcela.status}
                </span>
              </td>
              <td className="p-3">
  {parcela.status !== "PAGO" && (
    <form
      action={async () => {
        "use server";

        await receiveFinancialInstallment(
          financeiro.id,
          parcela.id
        );

        revalidatePath("/financeiro");
      }}
    >
      <button
        className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
      >
        Receber
      </button>
    </form>
  )}
</td>
            </tr>
          )
        )}
      </tbody>
    </table>
  </div>
)}

<form
  action={generateFinancialInstallments}
  className="mt-6 flex flex-wrap items-end gap-4"
>
  <input
    type="hidden"
    name="financialId"
    value={financeiro.id}
  />

  <input
    type="hidden"
    name="totalValue"
    value={financeiro.saleValue}
  />

  <Field label="Parcelas">
    <input
      type="number"
      name="quantity"
      defaultValue={12}
      min={1}
      className={inputClass}
    />
  </Field>

  <Field label="Primeiro vencimento">
    <input
      type="date"
      name="firstDueDate"
      className={inputClass}
    />
  </Field>
<div className="mt-6">
  <FinancialUpload
    financialId={financeiro.id}
  />
</div>

<div className="mt-6">
  <FinancialAttachments
    attachments={financeiro.attachments}
  />
</div>
<div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950 p-5">
  <div className="flex items-center justify-between gap-4">
    <h3 className="font-bold text-white">
      Histórico Financeiro
    </h3>

    <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-semibold text-zinc-300">
      {financeiro.cashFlow.length} lançamento(s)
    </span>
  </div>

  {financeiro.cashFlow.length > 0 ? (
    <div className="mt-5 space-y-3">
      {financeiro.cashFlow.map((item) => (
        <div
          key={item.id}
          className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-4 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <p className="font-semibold text-white">
              {item.description}
            </p>

            <p className="mt-1 text-sm text-zinc-500">
              {item.category ?? "Sem categoria"} •{" "}
              {new Intl.DateTimeFormat("pt-BR").format(
                item.paidAt ?? item.dueDate ?? item.createdAt
              )}
            </p>
          </div>

          <div className="text-left md:text-right">
            <p
              className={`font-bold ${
                item.type === "ENTRADA"
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}
            >
              {item.type === "ENTRADA" ? "+" : "-"}{" "}
              {formatCurrency(item.value)}
            </p>

            <p className="mt-1 text-xs font-semibold uppercase text-zinc-500">
              {item.status}
            </p>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <p className="mt-5 text-sm text-zinc-500">
      Nenhuma movimentação vinculada a este financeiro.
    </p>
  )}
</div>
  <button
    type="submit"
    className="rounded-xl bg-cyan-600 px-6 py-3 font-bold text-white hover:bg-cyan-700"
  >
    Gerar Parcelas
  </button>
</form>
                  <button
                    type="submit"
                    className="mt-6 rounded-xl bg-orange-500 px-6 py-3 font-bold text-white transition hover:bg-orange-600"
                  >
                    Salvar Financeiro
                  </button>
                </form>
              );
            }
          )}

          {financeiros.length === 0 && (
            <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900 p-12 text-center">
              <h2 className="text-xl font-bold text-white">
                Nenhum registro financeiro
              </h2>

              <p className="mt-2 text-zinc-500">
                Os registros financeiros dos projetos aparecerão aqui.
              </p>
            </div>
          )}
        </div>
      </main>
    </AppLayout>
  );
}

const inputClass =
  "w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-orange-500";

const textareaClass =
  "w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-white outline-none focus:border-orange-500";

function Card({
  label,
  value,
  valueClass = "text-orange-500",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <p className="text-sm text-zinc-400">
        {label}
      </p>

      <h2
        className={`mt-2 break-words text-2xl font-bold ${valueClass}`}
      >
        {value}
      </h2>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-zinc-400">
        {label}
      </label>

      {children}
    </div>
  );
}

function Summary({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
      <p className="text-sm text-zinc-500">
        {label}
      </p>

      <p className="mt-2 font-bold text-white">
        {value}
      </p>
    </div>
  );
}