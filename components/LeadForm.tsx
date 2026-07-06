"use client";

import { useState } from "react";

export function LeadForm() {
  const [salvando, setSalvando] = useState(false);

  async function salvarLead(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSalvando(true);

    const form = new FormData(event.currentTarget);

    await fetch("/api/leads", {
      method: "POST",
      body: JSON.stringify({
        nome: form.get("nome"),
        telefone: form.get("telefone"),
        email: form.get("email"),
        cidade: form.get("cidade"),
        origem: form.get("origem"),
        observacao: form.get("observacao"),
      }),
    });

    window.location.reload();
  }

  return (
    <form onSubmit={salvarLead} className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="mb-6 text-2xl font-bold">Novo Lead</h2>

      <div className="grid grid-cols-2 gap-4">
        <input name="nome" required placeholder="Nome" className="rounded-xl bg-zinc-800 p-3" />
        <input name="telefone" placeholder="Telefone" className="rounded-xl bg-zinc-800 p-3" />
        <input name="email" placeholder="E-mail" className="rounded-xl bg-zinc-800 p-3" />
        <input name="cidade" placeholder="Cidade" className="rounded-xl bg-zinc-800 p-3" />
        <input name="origem" placeholder="Origem" className="rounded-xl bg-zinc-800 p-3" />
        <input name="observacao" placeholder="Observação" className="rounded-xl bg-zinc-800 p-3" />
      </div>

      <button
        disabled={salvando}
        className="mt-5 rounded-xl bg-orange-500 px-5 py-3 font-semibold hover:bg-orange-600"
      >
        {salvando ? "Salvando..." : "Salvar Lead"}
      </button>
    </form>
  );
}