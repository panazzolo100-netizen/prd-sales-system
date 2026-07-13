"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  projectId: string;
  type:
    | "CONTRATO"
    | "ART"
    | "PROJETO"
    | "MEMORIAL"
    | "NOTA_FISCAL"
    | "GARANTIA"
    | "MANUAL"
    | "OUTRO";
  title: string;
};

export function DocumentUpload({
  projectId,
  type,
  title,
}: Props) {
  const router = useRouter();

  const inputRef =
    useRef<HTMLInputElement>(null);

  const [file, setFile] =
    useState<File | null>(null);

  const [notes, setNotes] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function upload() {
    if (!file) return;

    setLoading(true);

    const form = new FormData();

    form.append("file", file);
    form.append("projectId", projectId);
    form.append("type", type);
    form.append("notes", notes);

    const response = await fetch(
      "/api/projects/documents",
      {
        method: "POST",
        body: form,
      }
    );

    setLoading(false);

    if (!response.ok) {
      alert("Erro ao enviar documento.");
      return;
    }

    setFile(null);
    setNotes("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <h3 className="font-bold text-white">
        {title}
      </h3>

      <input
        ref={inputRef}
        type="file"
        className="mt-4 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-white"
        onChange={(e) =>
          setFile(
            e.target.files?.[0] ?? null
          )
        }
      />

      <textarea
        rows={3}
        value={notes}
        onChange={(e) =>
          setNotes(e.target.value)
        }
        placeholder="Observações"
        className="mt-4 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-white"
      />

      <button
        type="button"
        disabled={!file || loading}
        onClick={upload}
        className="mt-4 w-full rounded-xl bg-orange-500 py-3 font-bold text-white hover:bg-orange-600 disabled:opacity-50"
      >
        {loading
          ? "Enviando..."
          : "Enviar documento"}
      </button>
    </div>
  );
}