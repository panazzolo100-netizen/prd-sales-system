"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CircleDot,
  FileSpreadsheet,
  FileText,
  History,
  MoveRight,
  NotebookPen,
  Paperclip,
  Search,
  UserRound,
  WalletCards,
} from "lucide-react";

import type { LeadActivityItem } from "@/types/lead";

type HistoryCategory =
  | "CREATION"
  | "STAGE"
  | "VALUE"
  | "PROPOSAL"
  | "EXCEL"
  | "ATTACHMENT"
  | "NOTES"
  | "MANUAL"
  | "OTHER";

const categoryLabels: Record<HistoryCategory, string> = {
  CREATION: "Criação",
  STAGE: "Mudança de etapa",
  VALUE: "Valor",
  PROPOSAL: "Proposta",
  EXCEL: "Excel",
  ATTACHMENT: "Anexos",
  NOTES: "Observações",
  MANUAL: "Atividades manuais",
  OTHER: "Outros",
};

function categoryFor(activity: LeadActivityItem): HistoryCategory {
  const searchable = `${activity.type} ${activity.title}`.toLocaleLowerCase("pt-BR");
  if (searchable.includes("lead criado") || searchable.includes("oportunidade criada")) return "CREATION";
  if (searchable.includes("moveu o card") || searchable.includes("mudança de etapa")) return "STAGE";
  if (searchable.includes("preço estimado") || searchable.includes("valor estimado")) return "VALUE";
  if (searchable.includes("excel") || searchable.includes("planilha")) return "EXCEL";
  if (searchable.includes("proposta")) return "PROPOSAL";
  if (searchable.includes("arquivo") || searchable.includes("pdf") || searchable.includes("anexo")) return "ATTACHMENT";
  if (searchable.includes("observa")) return "NOTES";
  if (activity.type === "MANUAL") return "MANUAL";
  return "OTHER";
}

function EventIcon({ category }: { category: HistoryCategory }) {
  const className = "h-5 w-5";
  switch (category) {
    case "CREATION":
      return <CircleDot className={className} />;
    case "STAGE":
      return <MoveRight className={className} />;
    case "VALUE":
      return <WalletCards className={className} />;
    case "PROPOSAL":
      return <FileText className={className} />;
    case "EXCEL":
      return <FileSpreadsheet className={className} />;
    case "ATTACHMENT":
      return <Paperclip className={className} />;
    case "NOTES":
      return <NotebookPen className={className} />;
    case "MANUAL":
      return <UserRound className={className} />;
    default:
      return <History className={className} />;
  }
}

type Props = {
  activities: LeadActivityItem[];
  showAuthors?: boolean;
  leadId: string;
};

export function LeadHistory({ activities, showAuthors = false, leadId }: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<HistoryCategory | "ALL">("ALL");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localActivities, setLocalActivities] = useState(activities);

  useEffect(() => {
    setLocalActivities(activities);
  }, [activities]);

  const filteredActivities = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
    return localActivities.filter((activity) => {
      const eventCategory = categoryFor(activity);
      if (category !== "ALL" && eventCategory !== category) return false;
      if (!normalizedSearch) return true;
      return [activity.title, activity.notes, activity.type, activity.user?.name]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("pt-BR")
        .includes(normalizedSearch);
    });
  }, [category, localActivities, search]);

  async function createActivity() {
    if (!title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/leads/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId,
          type: "MANUAL",
          title: title.trim(),
          notes: notes.trim() || null,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Erro ao criar atividade.");
      setLocalActivities((current) => [payload as LeadActivityItem, ...current]);
      setTitle("");
      setNotes("");
    } catch (activityError) {
      setError(
        activityError instanceof Error
          ? activityError.message
          : "Erro ao criar atividade."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="font-bold text-zinc-950 dark:text-white">Nova atividade</h3>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Título"
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-zinc-950 outline-none focus:border-orange-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
        />
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Observações"
          className="w-full rounded-xl border border-zinc-200 bg-white p-4 text-zinc-950 outline-none focus:border-orange-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
        />
        <button
          type="button"
          onClick={createActivity}
          disabled={saving || !title.trim()}
          className="rounded-xl bg-orange-500 px-5 py-3 font-bold text-white disabled:opacity-50"
        >
          {saving ? "Salvando..." : "Criar atividade"}
        </button>
        {error && <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}
      </section>

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
        <label className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Pesquisar no histórico..."
            className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-11 pr-4 text-sm text-zinc-950 outline-none focus:border-orange-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
          />
        </label>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value as HistoryCategory | "ALL")}
          aria-label="Filtrar histórico por tipo"
          className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700 outline-none focus:border-orange-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
        >
          <option value="ALL">Todos os eventos</option>
          {Object.entries(categoryLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {filteredActivities.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-800">
          {localActivities.length === 0
            ? "Nenhum evento registrado."
            : "Nenhum evento corresponde aos filtros."}
        </div>
      ) : (
        <div className="relative before:absolute before:bottom-6 before:left-6 before:top-6 before:w-px before:bg-zinc-200 dark:before:bg-zinc-800">
          {filteredActivities.map((activity) => {
            const eventCategory = categoryFor(activity);
            return (
              <article key={activity.id} className="relative flex gap-4 pb-6 last:pb-0">
                <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400">
                  <EventIcon category={eventCategory} />
                </div>
                <div className="min-w-0 flex-1 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-orange-600 dark:text-orange-400">
                        {categoryLabels[eventCategory]}
                      </p>
                      <h3 className="mt-1 font-bold text-zinc-950 dark:text-white">{activity.title}</h3>
                    </div>
                    <time className="shrink-0 text-xs text-zinc-500">
                      {new Date(activity.createdAt).toLocaleDateString("pt-BR")} às{" "}
                      {new Date(activity.createdAt).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>
                  {activity.notes && (
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                      {activity.notes}
                    </p>
                  )}
                  {showAuthors && activity.user?.name && (
                    <p className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-zinc-500">
                      <UserRound className="h-3.5 w-3.5" />
                      {activity.user.name}
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
