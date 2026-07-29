"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";

export type EngineeringEquipmentItem = {
  id: string;
  projectId: string;
  type: string;
  manufacturer: string | null;
  model: string | null;
  description: string | null;
  quantity: number;
  power: number | null;
  unit: string | null;
  voltage: number | null;
  current: number | null;
  mppt: number | null;
  efficiency: number | null;
  dimensions: string | null;
  weight: number | null;
  notes: string | null;
  position: number;
  createdAt: Date | string;
  updatedAt: Date | string;
};

type Props = {
  projectId: string;
  initialEquipments: EngineeringEquipmentItem[];
};

type EquipmentForm = {
  type: string;
  manufacturer: string;
  model: string;
  description: string;
  quantity: string;
  power: string;
  unit: string;
  voltage: string;
  current: string;
  mppt: string;
  efficiency: string;
  dimensions: string;
  weight: string;
  notes: string;
};

const EQUIPMENT_TYPES = [
  { value: "INVERSOR", label: "Inversor" },
  { value: "MODULO", label: "Módulo fotovoltaico" },
  { value: "BESS", label: "BESS / Banco de baterias" },
  { value: "TRANSFORMADOR", label: "Transformador" },
  { value: "QGBT", label: "QGBT" },
  { value: "STRING_BOX", label: "String Box" },
  { value: "GERADOR", label: "Gerador" },
  { value: "CONTROLADOR", label: "Controlador" },
  { value: "MEDIDOR", label: "Medidor" },
  { value: "OUTRO", label: "Outro" },
] as const;

const EMPTY_FORM: EquipmentForm = {
  type: "INVERSOR",
  manufacturer: "",
  model: "",
  description: "",
  quantity: "1",
  power: "",
  unit: "kW",
  voltage: "",
  current: "",
  mppt: "",
  efficiency: "",
  dimensions: "",
  weight: "",
  notes: "",
};

function equipmentTypeLabel(type: string) {
  return EQUIPMENT_TYPES.find((item) => item.value === type)?.label ?? type;
}

function formatNumber(value: number | null, suffix?: string | null) {
  if (value === null) return "-";

  const formatted = new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 2,
  }).format(value);

  return suffix ? `${formatted} ${suffix}` : formatted;
}

function toForm(equipment: EngineeringEquipmentItem): EquipmentForm {
  return {
    type: equipment.type,
    manufacturer: equipment.manufacturer ?? "",
    model: equipment.model ?? "",
    description: equipment.description ?? "",
    quantity: String(equipment.quantity),
    power: equipment.power === null ? "" : String(equipment.power),
    unit: equipment.unit ?? "kW",
    voltage: equipment.voltage === null ? "" : String(equipment.voltage),
    current: equipment.current === null ? "" : String(equipment.current),
    mppt: equipment.mppt === null ? "" : String(equipment.mppt),
    efficiency:
      equipment.efficiency === null ? "" : String(equipment.efficiency),
    dimensions: equipment.dimensions ?? "",
    weight: equipment.weight === null ? "" : String(equipment.weight),
    notes: equipment.notes ?? "",
  };
}

export function EngineeringEquipmentManager({
  projectId,
  initialEquipments,
}: Props) {
  const [equipments, setEquipments] =
    useState<EngineeringEquipmentItem[]>(initialEquipments);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EquipmentForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const totals = useMemo(() => {
    const inverterPower = equipments
      .filter((item) => item.type === "INVERSOR")
      .reduce((sum, item) => sum + (item.power ?? 0) * item.quantity, 0);

    const modulePower = equipments
      .filter((item) => item.type === "MODULO")
      .reduce((sum, item) => sum + (item.power ?? 0) * item.quantity, 0);

    const moduleQuantity = equipments
      .filter((item) => item.type === "MODULO")
      .reduce((sum, item) => sum + item.quantity, 0);

    return { inverterPower, modulePower, moduleQuantity };
  }, [equipments]);

  function updateField<K extends keyof EquipmentForm>(
    field: K,
    value: EquipmentForm[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function openCreateForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
    setFeedback(null);
    setShowForm(true);
  }

  function openEditForm(equipment: EngineeringEquipmentItem) {
    setEditingId(equipment.id);
    setForm(toForm(equipment));
    setError(null);
    setFeedback(null);
    setShowForm(true);
  }

  function closeForm() {
    if (loading) return;
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
  }

  async function saveEquipment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);
    setFeedback(null);

    try {
      const response = await fetch("/api/engineering/equipment", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          id: editingId,
          ...form,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error ?? "Erro ao salvar equipamento.");
      }

      const saved = responseData as EngineeringEquipmentItem;

      if (editingId) {
        setEquipments((current) =>
          current.map((item) => (item.id === saved.id ? saved : item))
        );
        setFeedback("Equipamento atualizado com sucesso.");
      } else {
        setEquipments((current) => [...current, saved]);
        setFeedback("Equipamento adicionado com sucesso.");
      }

      closeForm();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Não foi possível salvar o equipamento."
      );
    } finally {
      setLoading(false);
    }
  }

  async function deleteEquipment(equipment: EngineeringEquipmentItem) {
    if (deletingId) return;

    const description = [equipment.manufacturer, equipment.model]
      .filter(Boolean)
      .join(" ") || equipmentTypeLabel(equipment.type);

    if (!window.confirm(`Excluir o equipamento “${description}”?`)) return;

    setDeletingId(equipment.id);
    setError(null);
    setFeedback(null);

    try {
      const response = await fetch(
        `/api/engineering/equipment?projectId=${encodeURIComponent(
          projectId
        )}&id=${encodeURIComponent(equipment.id)}`,
        { method: "DELETE" }
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error ?? "Erro ao excluir equipamento.");
      }

      setEquipments((current) =>
        current.filter((item) => item.id !== equipment.id)
      );
      setFeedback("Equipamento excluído com sucesso.");
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Não foi possível excluir o equipamento."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">
            Projeto Executivo
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white">
            Equipamentos do Projeto
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            Cadastre inversores, módulos, BESS, transformadores e demais equipamentos.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-400"
        >
          <Plus size={17} />
          Adicionar equipamento
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <SummaryCard
          label="Potência total dos inversores"
          value={formatNumber(totals.inverterPower, "kW")}
        />
        <SummaryCard
          label="Quantidade de módulos"
          value={String(totals.moduleQuantity)}
        />
        <SummaryCard
          label="Potência total dos módulos"
          value={formatNumber(totals.modulePower, "W")}
        />
      </div>

      {error && (
        <p className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {feedback && (
        <p className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300">
          {feedback}
        </p>
      )}

      {equipments.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-zinc-700 bg-zinc-950 p-8 text-center">
          <p className="font-semibold text-zinc-300">
            Nenhum equipamento cadastrado.
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            Adicione o primeiro equipamento do projeto executivo.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {equipments.map((equipment) => (
            <article
              key={equipment.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-400">
                    {equipmentTypeLabel(equipment.type)}
                  </span>
                  <h3 className="mt-3 break-words text-lg font-bold text-white">
                    {[equipment.manufacturer, equipment.model]
                      .filter(Boolean)
                      .join(" ") || "Equipamento sem modelo informado"}
                  </h3>
                  {equipment.description && (
                    <p className="mt-2 text-sm text-zinc-500">
                      {equipment.description}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => openEditForm(equipment)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] text-zinc-400 transition hover:border-orange-500/30 hover:text-orange-400"
                    aria-label="Editar equipamento"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => void deleteEquipment(equipment)}
                    disabled={deletingId === equipment.id}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-500/15 text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                    aria-label="Excluir equipamento"
                  >
                    <Trash2
                      size={16}
                      className={
                        deletingId === equipment.id ? "animate-pulse" : ""
                      }
                    />
                  </button>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Detail label="Quantidade" value={String(equipment.quantity)} />
                <Detail
                  label="Potência unitária"
                  value={formatNumber(equipment.power, equipment.unit)}
                />
                <Detail
                  label="Potência total"
                  value={
                    equipment.power === null
                      ? "-"
                      : formatNumber(
                          equipment.power * equipment.quantity,
                          equipment.unit
                        )
                  }
                />
                <Detail
                  label="Tensão"
                  value={formatNumber(equipment.voltage, "V")}
                />
                <Detail
                  label="Corrente"
                  value={formatNumber(equipment.current, "A")}
                />
                <Detail
                  label="MPPT"
                  value={equipment.mppt === null ? "-" : String(equipment.mppt)}
                />
              </div>

              {equipment.notes && (
                <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-600">
                    Observações
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-300">
                    {equipment.notes}
                  </p>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {showForm && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeForm();
          }}
        >
          <form
            onSubmit={saveEquipment}
            className="my-8 w-full max-w-4xl rounded-3xl border border-white/[0.1] bg-zinc-950 p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {editingId ? "Editar equipamento" : "Adicionar equipamento"}
                </h3>
                <p className="mt-2 text-sm text-zinc-500">
                  Preencha somente os dados aplicáveis ao equipamento.
                </p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-400 transition hover:bg-red-500/10 hover:text-red-400"
                aria-label="Fechar formulário"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              <Field label="Tipo do equipamento">
                <select
                  value={form.type}
                  onChange={(event) => updateField("type", event.target.value)}
                  className={inputClassName}
                  required
                >
                  {EQUIPMENT_TYPES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Fabricante">
                <input
                  value={form.manufacturer}
                  onChange={(event) =>
                    updateField("manufacturer", event.target.value)
                  }
                  placeholder="Ex.: WEG"
                  className={inputClassName}
                />
              </Field>

              <Field label="Modelo">
                <input
                  value={form.model}
                  onChange={(event) => updateField("model", event.target.value)}
                  placeholder="Ex.: SIW500H"
                  className={inputClassName}
                />
              </Field>

              <Field label="Quantidade">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={form.quantity}
                  onChange={(event) =>
                    updateField("quantity", event.target.value)
                  }
                  className={inputClassName}
                  required
                />
              </Field>

              <Field label="Potência unitária">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={form.power}
                  onChange={(event) => updateField("power", event.target.value)}
                  placeholder="Ex.: 75"
                  className={inputClassName}
                />
              </Field>

              <Field label="Unidade da potência">
                <select
                  value={form.unit}
                  onChange={(event) => updateField("unit", event.target.value)}
                  className={inputClassName}
                >
                  <option value="W">W</option>
                  <option value="kW">kW</option>
                  <option value="kVA">kVA</option>
                  <option value="kWh">kWh</option>
                  <option value="MWh">MWh</option>
                </select>
              </Field>

              <Field label="Tensão (V)">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={form.voltage}
                  onChange={(event) =>
                    updateField("voltage", event.target.value)
                  }
                  className={inputClassName}
                />
              </Field>

              <Field label="Corrente (A)">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={form.current}
                  onChange={(event) =>
                    updateField("current", event.target.value)
                  }
                  className={inputClassName}
                />
              </Field>

              <Field label="Quantidade de MPPT">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.mppt}
                  onChange={(event) => updateField("mppt", event.target.value)}
                  className={inputClassName}
                />
              </Field>

              <Field label="Eficiência (%)">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="any"
                  value={form.efficiency}
                  onChange={(event) =>
                    updateField("efficiency", event.target.value)
                  }
                  className={inputClassName}
                />
              </Field>

              <Field label="Dimensões">
                <input
                  value={form.dimensions}
                  onChange={(event) =>
                    updateField("dimensions", event.target.value)
                  }
                  placeholder="Ex.: 650 × 500 × 250 mm"
                  className={inputClassName}
                />
              </Field>

              <Field label="Peso (kg)">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={form.weight}
                  onChange={(event) => updateField("weight", event.target.value)}
                  className={inputClassName}
                />
              </Field>
            </div>

            <div className="mt-5">
              <Field label="Descrição">
                <input
                  value={form.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  placeholder="Descrição curta do equipamento"
                  className={inputClassName}
                />
              </Field>
            </div>

            <div className="mt-5">
              <Field label="Observações técnicas">
                <textarea
                  value={form.notes}
                  onChange={(event) => updateField("notes", event.target.value)}
                  rows={4}
                  className={`${inputClassName} resize-none py-3`}
                />
              </Field>
            </div>

            {error && (
              <p className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                {error}
              </p>
            )}

            <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-white/[0.07] pt-5">
              <button
                type="button"
                onClick={closeForm}
                disabled={loading}
                className="rounded-xl border border-zinc-700 px-5 py-3 font-semibold text-zinc-300 transition hover:border-zinc-500 hover:text-white disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-white transition hover:bg-orange-400 disabled:cursor-wait disabled:opacity-60"
              >
                {loading
                  ? "Salvando..."
                  : editingId
                    ? "Salvar alterações"
                    : "Adicionar equipamento"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

const inputClassName =
  "h-12 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 text-white outline-none placeholder:text-zinc-700 focus:border-orange-500";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-zinc-400">
        {label}
      </span>
      {children}
    </label>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3">
      <p className="text-xs text-zinc-600">{label}</p>
      <p className="mt-1 font-semibold text-zinc-200">{value}</p>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-2 text-xl font-bold text-white">{value}</p>
    </div>
  );
}