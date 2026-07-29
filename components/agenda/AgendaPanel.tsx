"use client";

import {
  CalendarDays,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

type Option = {
  id: string;
  name: string;
};

type AgendaEvent = {
  id: string;
  title: string;
  type: string;
  status: string;
  color: string;
  allDay: boolean;
  startAt: string | Date;
  endAt: string | Date | null;
  location: string | null;
  description: string | null;
  responsibleId: string | null;
  clientId: string | null;
  leadId: string | null;
  projectId: string | null;
  serviceOrderId: string | null;
  responsible: Option | null;
  client: Option | null;
  lead: {
    id: string;
    companyName: string;
    contactName: string;
  } | null;
  project: {
    id: string;
    title: string;
  } | null;
  serviceOrder: {
    id: string;
    number: string;
    title: string;
  } | null;
};

type AgendaData = {
  events: AgendaEvent[];
  users: Option[];
  clients: Option[];
  leads: Array<{
    id: string;
    companyName: string;
    contactName: string;
  }>;
  projects: Array<{
    id: string;
    title: string;
    client: {
      name: string;
    };
  }>;
  serviceOrders: Array<{
    id: string;
    number: string;
    title: string;
    project: {
      client: {
        name: string;
      };
    };
  }>;
};

type FormState = {
  id: string;
  title: string;
  type: string;
  status: string;
  color: string;
  allDay: boolean;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  responsibleId: string;
  clientId: string;
  leadId: string;
  projectId: string;
  serviceOrderId: string;
  location: string;
  description: string;
};

const emptyForm: FormState = {
  id: "",
  title: "",
  type: "OUTRO",
  status: "AGENDADO",
  color: "ORANGE",
  allDay: false,
  startDate: "",
  startTime: "08:00",
  endDate: "",
  endTime: "09:00",
  responsibleId: "",
  clientId: "",
  leadId: "",
  projectId: "",
  serviceOrderId: "",
  location: "",
  description: "",
};

const typeLabels: Record<string, string> = {
  VISITA_TECNICA: "Visita técnica",
  VISTORIA: "Vistoria",
  INSTALACAO: "Instalação",
  MANUTENCAO: "Manutenção",
  REUNIAO: "Reunião",
  HOMOLOGACAO: "Homologação",
  ENTREGA: "Entrega",
  OUTRO: "Outro",
};

const statusLabels: Record<string, string> = {
  AGENDADO: "Agendado",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
};

function dateInput(value: string | Date) {
  return new Date(value).toISOString().slice(0, 10);
}

function timeInput(value: string | Date) {
  return new Date(value).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function combine(date: string, time: string, allDay: boolean) {
  if (!date) return "";
  return new Date(`${date}T${allDay ? "12:00" : time || "08:00"}:00`).toISOString();
}

function displayDate(event: AgendaEvent) {
  const value = new Date(event.startAt);
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    ...(event.allDay ? {} : { timeStyle: "short" }),
  }).format(value);
}

export function AgendaPanel({
  initialData,
}: {
  initialData: AgendaData;
}) {
  const [data, setData] = useState(initialData);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const events = useMemo(
    () =>
      [...data.events].sort(
        (a, b) =>
          new Date(a.startAt).getTime() -
          new Date(b.startAt).getTime()
      ),
    [data.events]
  );

  async function reload() {
    const response = await fetch("/api/agenda", {
      cache: "no-store",
    });
    const result = (await response.json()) as AgendaData & {
      error?: string;
    };

    if (!response.ok) {
      throw new Error(result.error ?? "Erro ao carregar agenda.");
    }

    setData(result);
  }

  function createNew() {
    const today = new Date().toISOString().slice(0, 10);
    setForm({
      ...emptyForm,
      startDate: today,
      endDate: today,
    });
    setError("");
    setOpen(true);
  }

  function edit(event: AgendaEvent) {
    setForm({
      id: event.id,
      title: event.title,
      type: event.type,
      status: event.status,
      color: event.color,
      allDay: event.allDay,
      startDate: dateInput(event.startAt),
      startTime: timeInput(event.startAt),
      endDate: event.endAt ? dateInput(event.endAt) : "",
      endTime: event.endAt ? timeInput(event.endAt) : "",
      responsibleId: event.responsibleId ?? "",
      clientId: event.clientId ?? "",
      leadId: event.leadId ?? "",
      projectId: event.projectId ?? "",
      serviceOrderId: event.serviceOrderId ?? "",
      location: event.location ?? "",
      description: event.description ?? "",
    });
    setError("");
    setOpen(true);
  }

  async function save() {
    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/agenda", {
        method: form.id ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: form.id || undefined,
          title: form.title,
          type: form.type,
          status: form.status,
          color: form.color,
          allDay: form.allDay,
          startAt: combine(form.startDate, form.startTime, form.allDay),
          endAt: form.endDate
            ? combine(form.endDate, form.endTime, form.allDay)
            : null,
          responsibleId: form.responsibleId || null,
          clientId: form.clientId || null,
          leadId: form.leadId || null,
          projectId: form.projectId || null,
          serviceOrderId: form.serviceOrderId || null,
          location: form.location || null,
          description: form.description || null,
        }),
      });

      const result = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(result.error ?? "Erro ao salvar evento.");
      }

      await reload();
      setOpen(false);
      setForm(emptyForm);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Erro ao salvar evento."
      );
    } finally {
      setSaving(false);
    }
  }

  async function remove(event: AgendaEvent) {
    if (!window.confirm(`Excluir o evento "${event.title}"?`)) {
      return;
    }

    const response = await fetch(
      `/api/agenda?id=${encodeURIComponent(event.id)}`,
      {
        method: "DELETE",
      }
    );

    const result = (await response.json()) as {
      error?: string;
    };

    if (!response.ok) {
      window.alert(result.error ?? "Erro ao excluir evento.");
      return;
    }

    await reload();
  }

  return (
    <main className="space-y-6">
      <section className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
            Operação
          </p>
          <h1 className="mt-2 text-3xl font-black text-white">
            Agenda
          </h1>
          <p className="mt-2 text-zinc-400">
            Eventos independentes com data, horário, responsável e cliente.
          </p>
        </div>

        <button
          type="button"
          onClick={createNew}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-bold text-white hover:bg-orange-600"
        >
          <Plus size={18} />
          Novo evento
        </button>
      </section>

      {events.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900 p-12 text-center">
          <CalendarDays className="mx-auto text-zinc-600" size={42} />
          <h2 className="mt-4 text-xl font-bold text-white">
            Nenhum evento cadastrado
          </h2>
        </section>
      ) : (
        <section className="grid gap-4 xl:grid-cols-2">
          {events.map((event) => (
            <article
              key={event.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-orange-400">
                    {typeLabels[event.type] ?? event.type}
                  </p>
                  <h2 className="mt-2 text-xl font-black text-white">
                    {event.title}
                  </h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    {displayDate(event)} ·{" "}
                    {statusLabels[event.status] ?? event.status}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => edit(event)}
                    className="rounded-lg border border-zinc-700 p-2 text-zinc-300 hover:bg-zinc-800"
                    title="Editar evento"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => remove(event)}
                    className="rounded-lg border border-red-500/30 p-2 text-red-400 hover:bg-red-500/10"
                    title="Excluir evento"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-1 text-sm text-zinc-300">
                {event.responsible && (
                  <p>Responsável: {event.responsible.name}</p>
                )}
                {event.client && <p>Cliente: {event.client.name}</p>}
                {event.lead && (
                  <p>Oportunidade: {event.lead.companyName}</p>
                )}
                {event.project && <p>Projeto: {event.project.title}</p>}
                {event.serviceOrder && (
                  <p>OS: {event.serviceOrder.number}</p>
                )}
                {event.location && <p>Local: {event.location}</p>}
                {event.description && (
                  <p className="whitespace-pre-wrap pt-2 text-zinc-400">
                    {event.description}
                  </p>
                )}
              </div>
            </article>
          ))}
        </section>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-zinc-800 bg-zinc-900">
            <header className="flex items-center justify-between border-b border-zinc-800 p-6">
              <div>
                <h2 className="text-2xl font-black text-white">
                  {form.id ? "Editar evento" : "Novo evento"}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-zinc-700 p-2 text-zinc-400 hover:bg-zinc-800"
              >
                <X size={20} />
              </button>
            </header>

            <div className="grid gap-5 p-6 md:grid-cols-2">
              <Field label="Título" wide>
                <input
                  value={form.title}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      title: event.target.value,
                    })
                  }
                  className={inputClass}
                />
              </Field>

              <SelectField
                label="Tipo"
                value={form.type}
                onChange={(value) =>
                  setForm({ ...form, type: value })
                }
                options={Object.entries(typeLabels)}
              />

              <SelectField
                label="Status"
                value={form.status}
                onChange={(value) =>
                  setForm({ ...form, status: value })
                }
                options={Object.entries(statusLabels)}
              />

              <InputField
                label="Data inicial"
                type="date"
                value={form.startDate}
                onChange={(value) =>
                  setForm({ ...form, startDate: value })
                }
              />

              <InputField
                label="Hora inicial"
                type="time"
                value={form.startTime}
                disabled={form.allDay}
                onChange={(value) =>
                  setForm({ ...form, startTime: value })
                }
              />

              <InputField
                label="Data final"
                type="date"
                value={form.endDate}
                onChange={(value) =>
                  setForm({ ...form, endDate: value })
                }
              />

              <InputField
                label="Hora final"
                type="time"
                value={form.endTime}
                disabled={form.allDay}
                onChange={(value) =>
                  setForm({ ...form, endTime: value })
                }
              />

              <EntitySelect
                label="Responsável"
                value={form.responsibleId}
                onChange={(value) =>
                  setForm({ ...form, responsibleId: value })
                }
                options={data.users.map((item) => [item.id, item.name])}
              />

              <EntitySelect
                label="Cliente"
                value={form.clientId}
                onChange={(value) =>
                  setForm({ ...form, clientId: value })
                }
                options={data.clients.map((item) => [item.id, item.name])}
              />

              <EntitySelect
                label="Oportunidade"
                value={form.leadId}
                onChange={(value) =>
                  setForm({ ...form, leadId: value })
                }
                options={data.leads.map((item) => [
                  item.id,
                  `${item.companyName} — ${item.contactName}`,
                ])}
              />

              <EntitySelect
                label="Projeto"
                value={form.projectId}
                onChange={(value) =>
                  setForm({ ...form, projectId: value })
                }
                options={data.projects.map((item) => [
                  item.id,
                  `${item.title} — ${item.client.name}`,
                ])}
              />

              <EntitySelect
                label="Ordem de Serviço"
                value={form.serviceOrderId}
                onChange={(value) =>
                  setForm({ ...form, serviceOrderId: value })
                }
                options={data.serviceOrders.map((item) => [
                  item.id,
                  `${item.number} — ${item.project.client.name}`,
                ])}
              />

              <InputField
                label="Local"
                value={form.location}
                onChange={(value) =>
                  setForm({ ...form, location: value })
                }
              />

              <Field label="Observações" wide>
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      description: event.target.value,
                    })
                  }
                  rows={5}
                  className={textareaClass}
                />
              </Field>

              <label className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm font-semibold text-zinc-300 md:col-span-2">
                <input
                  type="checkbox"
                  checked={form.allDay}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      allDay: event.target.checked,
                    })
                  }
                  className="h-4 w-4 accent-orange-500"
                />
                Evento de dia inteiro
              </label>

              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300 md:col-span-2">
                  {error}
                </div>
              )}
            </div>

            <footer className="flex justify-end gap-3 border-t border-zinc-800 p-6">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-zinc-700 px-5 py-3 font-bold text-zinc-300"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-white disabled:opacity-60"
              >
                {saving ? "Salvando..." : "Salvar evento"}
              </button>
            </footer>
          </div>
        </div>
      )}
    </main>
  );
}

const inputClass =
  "w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-orange-500 disabled:opacity-50";

const textareaClass =
  "w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-white outline-none focus:border-orange-500";

function Field({
  label,
  children,
  wide = false,
}: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <label className={wide ? "md:col-span-2" : ""}>
      <span className="mb-2 block text-sm font-semibold text-zinc-400">
        {label}
      </span>
      {children}
    </label>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
}: {
  label: string;
  value: string;
  onChange(value: string): void;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <Field label={label}>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      />
    </Field>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange(value: string): void;
  options: Array<[string, string]>;
}) {
  return (
    <Field label={label}>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </Field>
  );
}

function EntitySelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange(value: string): void;
  options: Array<[string, string]>;
}) {
  return (
    <Field label={label}>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      >
        <option value="">Sem vínculo</option>
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </Field>
  );
}