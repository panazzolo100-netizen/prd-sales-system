"use client";

import { useFormStatus } from "react-dom";

export function ChecklistSaveStatus() {
  const { pending } = useFormStatus();

  return (
    <div className="mt-5 flex h-6 items-center">
      {pending ? (
        <span className="text-sm font-medium text-orange-400">
          Salvando checklist...
        </span>
      ) : (
        <span className="text-sm text-zinc-500">
          Alterações salvas automaticamente.
        </span>
      )}
    </div>
  );
}