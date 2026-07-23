"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type FinancialAttachmentItem = {
  id: string;
  name: string;
  storageReference: string;
  accessUrl: string | null;
  type: string;
  createdAt: Date;
};

type Props = { attachments: FinancialAttachmentItem[] };

export function FinancialAttachments({ attachments: initialAttachments }: Props) {
  const router = useRouter();
  const [attachments, setAttachments] = useState(initialAttachments);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function removeAttachment(id: string) {
    if (deletingId || !window.confirm("Deseja excluir este anexo financeiro?")) return;
    setDeletingId(id);
    setMessage("");
    try {
      const response = await fetch("/api/financial/attachments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Erro ao excluir anexo.");
      setAttachments((current) => current.filter((item) => item.id !== id));
      setMessage("Anexo removido com sucesso.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao excluir anexo.");
    } finally {
      setDeletingId(null);
    }
  }

  if (attachments.length === 0) {
    return (
      <div>
        {message && <p className="mb-3 text-sm text-emerald-400">{message}</p>}
        <div className="rounded-xl border border-dashed border-zinc-800 p-6 text-center text-zinc-500">
          Nenhum anexo financeiro.
        </div>
      </div>
    );
  }

  return (
    <div>
      {message && (
        <p className={message.includes("sucesso") ? "mb-3 text-sm text-emerald-400" : "mb-3 text-sm text-red-400"}>
          {message}
        </p>
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {attachments.map((file) => (
          <article
            key={file.id}
            className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 transition hover:border-orange-500"
          >
            <a
              href={`/api/financial/attachments?id=${encodeURIComponent(file.id)}`}
              target="_blank"
              rel="noreferrer"
              className="block"
            >
              <p className="truncate font-semibold text-white">{file.name}</p>
              <p className="mt-2 text-sm text-orange-500">{file.type}</p>
              <p className="mt-2 text-xs text-zinc-500">
                {new Intl.DateTimeFormat("pt-BR").format(new Date(file.createdAt))}
              </p>
            </a>
            <button
              type="button"
              onClick={() => void removeAttachment(file.id)}
              disabled={deletingId === file.id}
              className="mt-3 rounded-lg border border-red-500/20 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 disabled:opacity-50"
            >
              {deletingId === file.id ? "Excluindo..." : "Excluir"}
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
