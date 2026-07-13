"use client";

import { X } from "lucide-react";
import { useState } from "react";

type NewLeadDrawerProps = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

export function NewLeadDrawer({
  open,
  onClose,
  onCreated,
}: NewLeadDrawerProps) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    const form = new FormData(event.currentTarget);

    const response = await fetch("/api/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        companyName: form.get("companyName"),
        contactName: form.get("contactName"),
        phone: form.get("phone"),
        email: form.get("email"),
        city: form.get("city"),
        state: form.get("state"),
        distributor: form.get("distributor"),
        consumerUnit: form.get("consumerUnit"),
        consumptionKwh: Number(form.get("consumptionKwh") || 0),
        demandKw: Number(form.get("demandKw") || 0),
        estimatedValue: Number(form.get("estimatedValue") || 0),
        expectedSaving: Number(form.get("expectedSaving") || 0),
        notes: form.get("notes"),
      }),
    });

    setLoading(false);

    if (!response.ok) {
      alert("Erro ao salvar lead.");
      return;
    }

    onCreated();
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60">
      <div className="h-full w-full max-w-xl overflow-y-auto border-l border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Novo Lead</h2>
            <p className="text-sm text-zinc-400">
              Cadastre uma nova oportunidade comercial.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input name="companyName" placeholder="Empresa" required className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-orange-500" />
          <input name="contactName" placeholder="Nome do contato" required className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-orange-500" />
          <input name="phone" placeholder="Telefone" className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-orange-500" />
          <input name="email" placeholder="E-mail" className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-orange-500" />

          <div className="grid grid-cols-2 gap-4">
            <input name="city" placeholder="Cidade" className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-orange-500" />
            <input name="state" placeholder="UF" maxLength={2} className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white uppercase outline-none focus:border-orange-500" />
          </div>

          <input name="distributor" placeholder="Distribuidora" className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-orange-500" />
          <input name="consumerUnit" placeholder="Unidade Consumidora" className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-orange-500" />

          <div className="grid grid-cols-2 gap-4">
            <input name="consumptionKwh" type="number" placeholder="Consumo kWh" className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-orange-500" />
            <input name="demandKw" type="number" placeholder="Demanda kW" className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-orange-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input name="estimatedValue" type="number" placeholder="Valor estimado" className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-orange-500" />
            <input name="expectedSaving" type="number" placeholder="Economia prevista" className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-orange-500" />
          </div>

          <textarea name="notes" placeholder="Observações" rows={4} className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-orange-500" />

          <div className="flex justify-end gap-3 border-t border-zinc-800 pt-5">
            <button type="button" onClick={onClose} className="rounded-xl border border-zinc-700 px-5 py-3 font-semibold text-zinc-300 hover:bg-zinc-800">
              Cancelar
            </button>

            <button type="submit" disabled={loading} className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-60">
              {loading ? "Salvando..." : "Salvar Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}