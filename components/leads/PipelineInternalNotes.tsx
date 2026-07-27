"use client";

import { CheckCircle2, LoaderCircle, MessageSquareText } from "lucide-react";
import { useEffect, useState } from "react";

import type { LeadListItem } from "@/types/lead";

type Props = {
  leadId: string;
  initialValue: string | null;
  onSaved: (lead: LeadListItem) => void;
};

export function PipelineInternalNotes({ leadId, initialValue, onSaved }: Props) {
  const [value, setValue] = useState(initialValue ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    setValue(initialValue ?? "");
    setMessage(null);
  }, [initialValue, leadId]);

  async function save() {
    if (saving) return;
    setSaving(true);
    setMessage(null);
    const notes = value.trim();

    try {
      const response = await fetch("/api/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: leadId, notes }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Não foi possível salvar a observação.");
      }

      setValue(payload.notes ?? "");
      setMessage({ type: "success", text: "Observação salva com sucesso." });
      onSaved(payload as LeadListItem);
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Não foi possível salvar a observação.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mx-6 mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
          <MessageSquareText size={19} />
        </span>
        <div>
          <h2 className="font-bold text-white">📝 Observações</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Informações comerciais visíveis apenas no ambiente interno.
          </p>
        </div>
      </div>

      <textarea
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          setMessage(null);
        }}
        rows={5}
        placeholder="Registre informações importantes sobre esta oportunidade."
        className="mt-5 w-full resize-y rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-zinc-600 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
      />
      {!value.trim() && (
        <p className="mt-2 text-sm text-zinc-500">Sem observações.</p>
      )}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div aria-live="polite">
          {message?.type === "success" && (
            <p className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
              <CheckCircle2 size={16} />
              {message.text}
            </p>
          )}
          {message?.type === "error" && (
            <p role="alert" className="text-sm font-semibold text-red-400">
              {message.text}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving && <LoaderCircle className="animate-spin" size={17} />}
          {saving ? "Salvando..." : "Salvar observação"}
        </button>
      </div>
    </section>
  );
}
