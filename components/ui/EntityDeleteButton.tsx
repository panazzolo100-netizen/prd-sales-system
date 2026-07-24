"use client";

import {
  CheckCircle2,
  LoaderCircle,
  MoreHorizontal,
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
  iconOnly?: boolean;
  menuTrigger?: boolean;
};

export function EntityDeleteButton({
  endpoint,
  entityName,
  buttonLabel,
  consequence,
  successMessage,
  onDeleted,
  className,
  iconOnly = false,
  menuTrigger = false,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
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
      {menuTrigger ? (
        <div className="relative">
          <button
            type="button"
            aria-label="Abrir ações"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((current) => !current)}
            className={
              className ??
              "inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-white/5 hover:text-white"
            }
          >
            <MoreHorizontal size={17} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-9 z-40 w-36 rounded-xl border border-white/10 bg-zinc-900 p-1.5 shadow-xl shadow-black/40">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setResult(null);
                  setOpen(true);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-red-300 transition hover:bg-red-500/10"
              >
                <Trash2 size={14} />
                {buttonLabel}
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          aria-label={iconOnly ? buttonLabel : undefined}
          title={iconOnly ? buttonLabel : undefined}
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
          {iconOnly ? <span className="sr-only">{buttonLabel}</span> : buttonLabel}
        </button>
      )}

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
