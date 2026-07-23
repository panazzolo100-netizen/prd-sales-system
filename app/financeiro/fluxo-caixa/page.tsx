import { revalidatePath } from "next/cache";

import { AppLayout } from "@/components/layout/AppLayout";
import { getCurrentCompanyId } from "@/lib/auth/current-user";
import { MiniBarChart, SectionCard } from "@/components/ui/erp";
import {
  cashFlowSummary,
  createCashFlow,
  listCompanyCashFlow,
  removeCashFlow,
  updateCashFlow,
} from "@/services/cash-flow.service";

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

  const companyId = await getCurrentCompanyId();

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
  const paidAtValue = String(formData.get("paidAt") ?? "").trim();

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
    paidAt: status === "PAGO" ? (paidAtValue ? new Date(`${paidAtValue}T12:00:00`) : new Date()) : null,
    status,
    notes: notes || null,
    companyId,
  });

  revalidatePath(
    "/financeiro/fluxo-caixa"
  );

  revalidatePath("/");
}

async function updateEntry(formData: FormData) {
  "use server";

  const companyId = await getCurrentCompanyId();

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
  const paidAtValue = String(formData.get("paidAt") ?? "").trim();

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
    companyId,
    description,
    type,
    category: category || null,
    value,
    dueDate: dueDateValue
      ? new Date(`${dueDateValue}T12:00:00`)
      : null,
    paidAt: status === "PAGO" ? (paidAtValue ? new Date(`${paidAtValue}T12:00:00`) : new Date()) : null,
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

  const companyId = await getCurrentCompanyId();

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
    companyId
  );

  revalidatePath(
    "/financeiro/fluxo-caixa"
  );

  revalidatePath("/");
}

export default async function CashFlowPage({ searchParams }: { searchParams: Promise<{ q?: string; type?: string; status?: string; from?: string; to?: string }> }) {
  const filters = await searchParams;
  const companyId = await getCurrentCompanyId();
  const [cashFlow, summary] =
    await Promise.all([
      listCompanyCashFlow(
        companyId
      ),

      cashFlowSummary(
        companyId
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
  const filteredCashFlow = cashFlow.filter((item) => {
    const term = filters.q?.trim().toLowerCase();
    const date = item.dueDate ?? item.createdAt;
    return (!term || item.description.toLowerCase().includes(term) || item.category?.toLowerCase().includes(term)) && (!filters.type || item.type === filters.type) && (!filters.status || item.status === filters.status) && (!filters.from || date >= new Date(`${filters.from}T00:00:00`)) && (!filters.to || date <= new Date(`${filters.to}T23:59:59`));
  });
  const chartData = Object.values(cashFlow.reduce<Record<string, { label: string; primary: number; secondary: number }>>((accumulator, item) => { const date = item.paidAt ?? item.dueDate ?? item.createdAt; const key = `${date.getFullYear()}-${date.getMonth()}`; accumulator[key] ??= { label: date.toLocaleDateString("pt-BR", { month: "short" }), primary: 0, secondary: 0 }; if (item.type === "ENTRADA") accumulator[key].primary += item.value; else accumulator[key].secondary += item.value; return accumulator; }, {})).slice(-6);

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

        <form className="grid gap-3 rounded-2xl border border-white/[0.07] bg-zinc-900 p-4 md:grid-cols-2 xl:grid-cols-6">
          <input name="q" defaultValue={filters.q} placeholder="Buscar descrição..." className={inputClass} />
          <select name="type" defaultValue={filters.type ?? ""} className={inputClass}><option value="">Todos os tipos</option><option value="ENTRADA">Entradas</option><option value="SAIDA">Saídas</option></select>
          <select name="status" defaultValue={filters.status ?? ""} className={inputClass}><option value="">Todos os status</option><option value="PENDENTE">Previstos</option><option value="PAGO">Pagos</option></select>
          <input type="date" name="from" defaultValue={filters.from} className={inputClass} />
          <input type="date" name="to" defaultValue={filters.to} className={inputClass} />
          <button className="rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white">Filtrar</button>
        </form>

        {chartData.length > 0 && <SectionCard title="Entradas x saídas" description="Movimentação mensal com dados realizados e previstos."><div className="mb-3 flex gap-5 text-xs font-semibold"><span className="flex items-center gap-2 text-zinc-500"><i className="h-2.5 w-2.5 rounded-full bg-emerald-500" />Entradas</span><span className="flex items-center gap-2 text-zinc-500"><i className="h-2.5 w-2.5 rounded-full bg-red-500" />Saídas</span></div><MiniBarChart data={chartData} /></SectionCard>}

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
              <Field label="Pagamento (opcional)"><input name="paidAt" type="date" className={inputClass} /></Field>
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
          {filteredCashFlow.map((item) => (
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
                <Field label="Pagamento"><input name="paidAt" type="date" defaultValue={item.paidAt ? item.paidAt.toISOString().slice(0, 10) : ""} className={inputClass} /></Field>
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

          {filteredCashFlow.length === 0 && (
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
