"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";

type DeleteServiceOrderButtonProps = {
  serviceOrderId: string;
  serviceOrderNumber: string;
};

export function DeleteServiceOrderButton({
  serviceOrderId,
  serviceOrderNumber,
}: DeleteServiceOrderButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir a ${serviceOrderNumber}?\n\nEssa ação não poderá ser desfeita.`
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(
        `/api/os?id=${encodeURIComponent(serviceOrderId)}`,
        {
          method: "DELETE",
        }
      );

      const result = (await response.json().catch(() => null)) as
        | {
            success?: boolean;
            error?: string;
          }
        | null;

      if (!response.ok) {
        throw new Error(
          result?.error ??
            "Não foi possível excluir a Ordem de Serviço."
        );
      }

      router.push("/os");
      router.refresh();
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Não foi possível excluir a Ordem de Serviço."
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-5 py-3 font-bold text-red-400 transition hover:border-red-500 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isDeleting ? (
        <Loader2
          size={18}
          className="animate-spin"
        />
      ) : (
        <Trash2 size={18} />
      )}

      {isDeleting
        ? "Excluindo..."
        : "Excluir OS"}
    </button>
  );
}