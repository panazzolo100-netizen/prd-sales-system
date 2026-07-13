"use client";

import {
  Bell,
  CalendarDays,
  Plus,
  Search,
  Settings,
} from "lucide-react";

export function Topbar() {
  return (
    <header className="mb-8 flex items-center justify-between rounded-2xl border border-zinc-800 bg-[#111113] px-8 py-5">

      <div>
        <h1 className="text-2xl font-bold text-white">
          CRM Comercial
        </h1>

        <p className="mt-1 text-sm text-zinc-500">
          PRD Soluções em Engenharia
        </p>
      </div>

      <div className="flex items-center gap-4">

        <div className="relative">

          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
          />

          <input
            type="text"
            placeholder="Pesquisar clientes, propostas..."
            className="w-96 rounded-xl border border-zinc-800 bg-zinc-900 py-3 pl-11 pr-4 text-sm text-white outline-none transition focus:border-orange-500"
          />

        </div>

        <button className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 transition hover:border-orange-500 hover:text-orange-500">
          <CalendarDays size={18} />
        </button>

        <button className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 transition hover:border-orange-500 hover:text-orange-500">

          <Bell size={18} />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />

        </button>

        <button className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 transition hover:border-orange-500 hover:text-orange-500">
          <Settings size={18} />
        </button>

        <button className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600">
          <Plus size={18} />
          Novo Lead
        </button>

        <button className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-2 pl-3 pr-4 transition hover:border-orange-500">

          <img
            src="/icone-prd.png"
            alt="PRD"
            className="h-10 w-10 rounded-full border border-zinc-700 bg-zinc-800 p-1"
          />

          <div className="text-left">
            <p className="text-sm font-semibold text-white">
              Daniel
            </p>

            <p className="text-xs text-zinc-500">
              Administrador
            </p>
          </div>

        </button>

      </div>

    </header>
  );
}