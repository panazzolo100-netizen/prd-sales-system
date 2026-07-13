import { revalidatePath } from "next/cache";

import { AppLayout } from "@/components/layout/AppLayout";
import {
  cashFlowSummary,
  createCashFlow,
  listCompanyCashFlow,
  removeCashFlow,
  updateCashFlow,
} from "@/services/cash-flow.service";

const COMPANY_ID = "default-company";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(value: Date | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR").format(value);
}

function parseNumber(value: FormDataEntryValue | null) {
  const parsed = Number(
    String(value ?? "")
      .replace(/\./g, "")
      .replace(",", ".")
      .trim()
  );

  return Number.isFinite(parsed) ? parsed : 0;
}

async function createEntry(formData: FormData) {
  "use server";

  const description = String(
    formData.get("description") ?? ""
  ).trim();

  const type = String(
    formData.get("type") ?? "ENTRADA"
  ).trim();

  const category = String(
    formData.get("category") ?? ""
  ).trim();

  const value = parseNumber(
    formData.get("value")
  );

  const dueDateValue = String(
    formData.get("dueDate") ?? ""
  ).trim();

  const status = String(
    formData.get("status") ?? "PENDENTE"
  ).trim();

  const notes = String(
    formData.get("notes") ?? ""
  ).trim();

  if (!description) {
    throw new Error(
      "Informe a descrição do lançamento."
    );
  }

  if (value <= 0) {
    throw new Error(
      "Informe um valor maior que zero."
    );
  }

  await createCashFlow({
    description,
    type,
    category: category || null,
    value,
    dueDate: dueDateValue
      ? new Date(`${dueDateValue}T12:00:00`)
      : null,
    paidAt:
      status === "PAGO"
        ? new Date()
        : null,
    status,
    notes: notes || null,
    companyId: COMPANY_ID,
  });

  revalidatePath(
    "/financeiro/fluxo-caixa"
  );

  revalidatePath("/");
}

async function updateEntry(formData: FormData) {
  "use server";

  const id = String(
    formData.get("id") ?? ""
  ).trim();

  const description = String(
    formData.get("description") ?? ""
  ).trim();

  const type = String(
    formData.get("type") ?? "ENTRADA"
  ).trim();

  const category = String(
    formData.get("category") ?? ""
  ).trim();

  const value = parseNumber(
    formData.get("value")
  );

  const dueDateValue = String(
    formData.get("dueDate") ?? ""
  ).trim();

  const status = String(
    formData.get("status") ?? "PENDENTE"
  ).trim();

  const notes = String(
    formData.get("notes") ?? ""
  ).trim();

  if (!id) {
    throw new Error(
      "Lançamento não identificado."
    );
  }

  await updateCashFlow({
    id,
    companyId: COMPANY_ID,
    description,
    type,
    category: category || null,
    value,
    dueDate: dueDateValue
      ? new Date(`${dueDateValue}T12:00:00`)
      : null,
    paidAt:
      status === "PAGO"
        ? new Date()
        : null,
    status,
    notes: notes || null,
  });

  revalidatePath(
    "/financeiro/fluxo-caixa"
  );

  revalidatePath("/");
}

async function deleteEntry(formData: FormData) {
  "use server";

  const id = String(
    formData.get("id") ?? ""
  ).trim();

  if (!id) {
    throw new Error(
      "Lançamento não identificado."
    );
  }

  await removeCashFlow(
    id,
    COMPANY_ID
  );

  revalidatePath(
    "/financeiro/fluxo-caixa"
  );

  revalidatePath("/");
}

export default async function CashFlowPage() {
  const [cashFlow, summary] =
    await Promise.all([
      listCompanyCashFlow(
        COMPANY_ID
      ),

      cashFlowSummary(
        COMPANY_ID
      ),
    ]);

  const pendingEntries =
    cashFlow
      .filter(
        (item) =>
          item.type === "ENTRADA" &&
          item.status !== "PAGO"
      )
      .reduce(
        (total, item) =>
          total + item.value,
        0
      );

  const pendingExpenses =
    cashFlow
      .filter(
        (item) =>
          item.type === "SAIDA" &&
          item.status !== "PAGO"
      )
      .reduce(
        (total, item) =>
          total + item.value,
        0
      );

  const balance =
    summary.entries -
    summary.expenses;

  return (
    <AppLayout>
      <main className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-white">
            Fluxo de Caixa
          </h1>

          <p className="mt-2 text-zinc-400">
            Entradas, saídas e vencimentos financeiros.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          <Card
            label="Entradas realizadas"
            value={formatCurrency(
              summary.entries
            )}
            valueClass="text-emerald-400"
          />

          <Card
            label="Saídas realizadas"
            value={formatCurrency(
              summary.expenses
            )}
            valueClass="text-red-400"
          />

          <Card
            label="Saldo realizado"
            value={formatCurrency(
              balance
            )}
            valueClass={
              balance >= 0
                ? "text-cyan-400"
                : "text-red-400"
            }
          />

          <Card
            label="A receber"
            value={formatCurrency(
              pendingEntries
            )}
            valueClass="text-orange-400"
          />

          <Card
            label="A pagar"
            value={formatCurrency(
              pendingExpenses
            )}
            valueClass="text-red-400"
          />
        </div>

        <details className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <summary className="cursor-pointer list-none text-xl font-bold text-white">
            Novo lançamento
          </summary>

          <form
            action={createEntry}
            className="mt-6"
          >
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <Field label="Descrição">
                <input
                  name="description"
                  required
                  placeholder="Descrição do lançamento"
                  className={inputClass}
                />
              </Field>

              <Field label="Tipo">
                <select
                  name="type"
                  defaultValue="ENTRADA"
                  className={inputClass}
                >
                  <option value="ENTRADA">
                    Entrada
                  </option>

                  <option value="SAIDA">
                    Saída
                  </option>
                </select>
              </Field>

              <Field label="Categoria">
                <input
                  name="category"
                  placeholder="Ex.: Venda, material, comissão"
                  className={inputClass}
                />
              </Field>

              <Field label="Valor">
                <input
                  name="value"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  className={inputClass}
                />
              </Field>

              <Field label="Vencimento">
                <input
                  name="dueDate"
                  type="date"
                  className={inputClass}
                />
              </Field>

              <Field label="Status">
                <select
                  name="status"
                  defaultValue="PENDENTE"
                  className={inputClass}
                >
                  <option value="PENDENTE">
                    Pendente
                  </option>

                  <option value="PAGO">
                    Pago
                  </option>

                  <option value="CANCELADO">
                    Cancelado
                  </option>
                </select>
              </Field>
            </div>

            <div className="mt-5">
              <Field label="Observações">
                <textarea
                  name="notes"
                  rows={3}
                  className={textareaClass}
                />
              </Field>
            </div>

            <button
              type="submit"
              className="mt-6 rounded-xl bg-orange-500 px-6 py-3 font-bold text-white transition hover:bg-orange-600"
            >
              Criar lançamento
            </button>
          </form>
        </details>

        <div className="space-y-5">
          {cashFlow.map((item) => (
            <form
              key={item.id}
              action={updateEntry}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
            >
              <input
                type="hidden"
                name="id"
                value={item.id}
              />

              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <p
                    className={`text-sm font-semibold ${
                      item.type === "ENTRADA"
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {item.type === "ENTRADA"
                      ? "Entrada"
                      : "Saída"}
                  </p>

                  <h2 className="mt-1 text-2xl font-bold text-white">
                    {item.description}
                  </h2>

                  <p className="mt-2 text-zinc-500">
                    Vencimento:{" "}
                    {formatDate(
                      item.dueDate
                    )}
                  </p>
                </div>

                <span
                  className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusClass(
                    item.status
                  )}`}
                >
                  {statusLabel(
                    item.status
                  )}
                </span>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                <Field label="Descrição">
                  <input
                    name="description"
                    defaultValue={
                      item.description
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Tipo">
                  <select
                    name="type"
                    defaultValue={
                      item.type
                    }
                    className={inputClass}
                  >
                    <option value="ENTRADA">
                      Entrada
                    </option>

                    <option value="SAIDA">
                      Saída
                    </option>
                  </select>
                </Field>

                <Field label="Categoria">
                  <input
                    name="category"
                    defaultValue={
                      item.category ?? ""
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Valor">
                  <input
                    name="value"
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={
                      item.value
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Vencimento">
                  <input
                    name="dueDate"
                    type="date"
                    defaultValue={
                      item.dueDate
                        ? item.dueDate
                            .toISOString()
                            .slice(0, 10)
                        : ""
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Status">
                  <select
                    name="status"
                    defaultValue={
                      item.status
                    }
                    className={inputClass}
                  >
                    <option value="PENDENTE">
                      Pendente
                    </option>

                    <option value="PAGO">
                      Pago
                    </option>

                    <option value="CANCELADO">
                      Cancelado
                    </option>
                  </select>
                </Field>
              </div>

              <div className="mt-5">
                <Field label="Observações">
                  <textarea
                    name="notes"
                    rows={3}
                    defaultValue={
                      item.notes ?? ""
                    }
                    className={textareaClass}
                  />
                </Field>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-white transition hover:bg-orange-600"
                >
                  Salvar lançamento
                </button>

                <button
                  type="submit"
                  formAction={deleteEntry}
                  className="rounded-xl border border-red-500/40 px-6 py-3 font-bold text-red-400 transition hover:bg-red-500/10"
                >
                  Excluir
                </button>
              </div>
              {item.financial && (
  <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
    <p className="text-sm text-zinc-500">
      Projeto vinculado
    </p>

    <h3 className="mt-2 font-bold text-white">
      {item.financial.project.title}
    </h3>

    <p className="mt-1 text-zinc-400">
      {item.financial.project.client.name}
    </p>

    <a
      href="/financeiro"
      className="mt-4 inline-flex rounded-lg border border-orange-500 px-4 py-2 text-sm font-semibold text-orange-500 hover:bg-orange-500 hover:text-white"
    >
      Abrir Financeiro
    </a>
  </div>
)}
            </form>
          ))}

          {cashFlow.length === 0 && (
            <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900 p-12 text-center">
              <h2 className="text-xl font-bold text-white">
                Nenhum lançamento
              </h2>

              <p className="mt-2 text-zinc-500">
                Crie a primeira entrada ou saída.
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

function statusLabel(status: string) {
  switch (status) {
    case "PAGO":
      return "Pago";

    case "CANCELADO":
      return "Cancelado";

    default:
      return "Pendente";
  }
}

function statusClass(status: string) {
  switch (status) {
    case "PAGO":
      return "bg-emerald-500/15 text-emerald-400";

    case "CANCELADO":
      return "bg-red-500/15 text-red-400";

    default:
      return "bg-orange-500/15 text-orange-400";
  }
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

function Card({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <p className="text-sm text-zinc-400">
        {label}
      </p>

      <h2
        className={`mt-2 text-2xl font-bold ${valueClass}`}
      >
        {value}
      </h2>
    </div>
  );
}