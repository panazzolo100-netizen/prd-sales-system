"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileUp, LoaderCircle, Upload, X } from "lucide-react";

import {
  PROJECT_DOCUMENT_CATEGORIES,
  type ProjectDocumentCategory,
} from "@/components/projects/project-document-config";
import type { ProjectDocumentItem } from "@/types/project";

type Props = {
  projectId: string;
  type?: ProjectDocumentCategory;
  title?: string;
  onUploaded?: (document: ProjectDocumentItem) => void;
  onCancel?: () => void;
};

export function DocumentUpload({
  projectId,
  type: initialType = "OUTRO",
  title,
  onUploaded,
  onCancel,
}: Props) {
  const router = useRouter();
  const inputRef =
    useRef<HTMLInputElement>(null);

  const [file, setFile] =
    useState<File | null>(null);

  const [notes, setNotes] =
    useState("");

  const [type, setType] =
    useState<ProjectDocumentCategory>(initialType);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  async function upload() {
    if (!file || loading) return;

    setLoading(true);
    setError(null);

    const form = new FormData();

    form.append("file", file);
    form.append("projectId", projectId);
    form.append("type", type);
    form.append("notes", notes);

    try {
      const response = await fetch("/api/projects/documents", {
        method: "POST",
        body: form,
      });
      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error ?? "Erro ao enviar documento.");
      }

      setFile(null);
      setNotes("");

      if (inputRef.current) {
        inputRef.current.value = "";
      }

      if (onUploaded) {
        onUploaded(responseData as ProjectDocumentItem);
      } else {
        router.refresh();
      }
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Não foi possível enviar o documento."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-3xl border border-orange-500/20 bg-orange-500/[0.03] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">
            Novo arquivo
          </p>
          <h3 className="mt-2 text-xl font-black text-white">
            {title ?? "Enviar documento"}
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            Selecione o arquivo e classifique-o para facilitar a consulta.
          </p>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-white/5 hover:text-white"
            aria-label="Cancelar upload"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex min-h-40 w-full items-center justify-center rounded-2xl border border-dashed border-white/[0.12] bg-zinc-950 p-6 text-center transition hover:border-orange-500/40 hover:bg-orange-500/[0.03]"
          >
            <div>
              <FileUp className="mx-auto text-orange-400" size={28} />
              <p className="mt-3 font-bold text-white">
                {file?.name ?? "Escolha um arquivo"}
              </p>
              <p className="mt-1 text-sm text-zinc-600">
                Clique para selecionar o documento.
              </p>
            </div>
          </button>

          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx"
            hidden
            onChange={(event) =>
              setFile(event.target.files?.[0] ?? null)
            }
          />
          <p className="mt-3 text-xs leading-5 text-zinc-600">
            PDF, JPG, PNG, WebP, Word ou Excel. Tamanho máximo: 20 MB.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Categoria
            </label>
            <select
              value={type}
              onChange={(event) =>
                setType(event.target.value as ProjectDocumentCategory)
              }
              className="h-12 w-full rounded-xl border border-white/[0.08] bg-zinc-950 px-4 text-sm text-white outline-none focus:border-orange-500/50"
            >
              {PROJECT_DOCUMENT_CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Observações
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Informações opcionais"
              className="w-full resize-y rounded-xl border border-white/[0.08] bg-zinc-950 p-3 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-orange-500/50"
            />
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          disabled={!file || loading}
          onClick={upload}
          className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <LoaderCircle className="animate-spin" size={17} />
          ) : (
            <Upload size={17} />
          )}
          {loading ? "Enviando..." : "Enviar documento"}
        </button>
      </div>
    </section>
  );
}
