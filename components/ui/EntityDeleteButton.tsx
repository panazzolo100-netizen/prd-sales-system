"use client";

import {
  CheckCircle2,
  LoaderCircle,
  Trash2,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

type Props = {
  endpoint: string;
  entityName: string;
  buttonLabel: string;
  consequence: string;
  successMessage: string;
  onDeleted?: () => void;
  className?: string;
};

export function EntityDeleteButton({
  endpoint,
  entityName,
  buttonLabel,
  consequence,
  successMessage,
  onDeleted,
  className,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const deletionInFlight = useRef(false);
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  async function confirmDeletion() {
    if (deletionInFlight.current) return;
    deletionInFlight.current = true;
    setDeleting(true);
    setResult(null);

    try {
      const response = await fetch(endpoint, {
        method: "DELETE",
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(
          payload.error ?? "Não foi possível excluir o registro."
        );
      }
      setResult({
        type: "success",
        message: successMessage,
      });
      window.setTimeout(() => {
        setOpen(false);
        onDeleted?.();
        router.refresh();
      }, 700);
    } catch (error) {
      setResult({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Não foi possível excluir o registro.",
      });
    } finally {
      deletionInFlight.current = false;
      setDeleting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setResult(null);
          setOpen(true);
        }}
        className={
          className ??
          "inline-flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-300 transition hover:bg-red-500/20"
        }
      >
        <Trash2 size={16} />
        {buttonLabel}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`Confirmar exclusão de ${entityName}`}
        >
          <div className="w-full max-w-lg rounded-3xl border border-red-500/20 bg-zinc-900 p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
              <Trash2 size={23} />
            </div>
            <h2 className="mt-5 text-2xl font-black text-white">
              Confirmar exclusão?
            </h2>
            <p className="mt-3 leading-6 text-zinc-400">
              Você está prestes a excluir{" "}
              <strong className="text-white">{entityName}</strong>.
            </p>
            <p className="mt-3 rounded-xl border border-white/[0.07] bg-zinc-950 p-3 text-sm leading-5 text-zinc-500">
              {consequence}
            </p>

            {result && (
              <div
                className={`mt-4 flex items-start gap-2 rounded-xl border p-3 text-sm ${
                  result.type === "success"
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                    : "border-red-500/20 bg-red-500/10 text-red-300"
                }`}
              >
                {result.type === "success" ? (
                  <CheckCircle2 className="shrink-0" size={18} />
                ) : (
                  <XCircle className="shrink-0" size={18} />
                )}
                <span>{result.message}</span>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={deleting || result?.type === "success"}
                onClick={() => setOpen(false)}
                className="rounded-xl border border-white/10 px-5 py-3 text-sm font-bold text-zinc-300 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={deleting || result?.type === "success"}
                onClick={confirmDeletion}
                className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                {deleting && (
                  <LoaderCircle className="animate-spin" size={17} />
                )}
                {deleting ? "Excluindo..." : "Excluir definitivamente"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
