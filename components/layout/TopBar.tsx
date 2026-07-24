"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ChevronDown,
  Plus,
  Settings,
} from "lucide-react";
import { GlobalSearch } from "./GlobalSearch";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { MobileNav } from "@/components/layout/MobileNav";
import type { AppRole } from "@/lib/auth/permissions";

const pageTitles: Record<
  string,
  {
    title: string;
    description: string;
  }
> = {
  "/": {
    title: "Visão geral",
    description: "Acompanhe a operação da PRD.",
  },

  "/leads": {
    title: "Oportunidades",
    description: "Gestão comercial e acompanhamento dos leads.",
  },

  "/pipeline": {
    title: "Pipeline",
    description: "Acompanhe a evolução das oportunidades.",
  },

  "/clientes": {
    title: "Clientes",
    description: "Cadastro e histórico dos clientes.",
  },

  "/propostas": {
    title: "Propostas",
    description: "Propostas comerciais da PRD.",
  },

  "/engenharia": {
    title: "Engenharia",
    description: "Projetos, documentos e homologações.",
  },

  "/os": {
    title: "Ordens de Serviço",
    description: "Execução, equipes e atividades de campo.",
  },

  "/agenda": {
    title: "Agenda",
    description: "Visitas, instalações e compromissos.",
  },

  "/financeiro": {
    title: "Financeiro",
    description: "Vendas, custos e recebimentos.",
  },

  "/financeiro/fluxo-caixa": {
    title: "Fluxo de Caixa",
    description: "Entradas, saídas e vencimentos.",
  },

  "/financeiro/dre": {
    title: "DRE",
    description: "Demonstrativo de resultados da empresa.",
  },
  "/relatorios": {
    title: "Relatórios",
    description: "Indicadores consolidados da operação.",
  },
  "/configuracoes": {
    title: "Configurações",
    description: "Conta, empresa e preferências do ERP.",
  },
  "/notificacoes": {
    title: "Notificações",
    description: "Prazos e pendências da operação.",
  },
};

function getPageInformation(pathname: string) {
  const routes = Object.keys(pageTitles).sort(
    (first, second) =>
      second.length - first.length
  );

  const route = routes.find((item) => {
    if (item === "/") {
      return pathname === "/";
    }

    return (
      pathname === item ||
      pathname.startsWith(`${item}/`)
    );
  });

  return (
    pageTitles[route ?? "/"] ?? {
      title: "PRD ERP",
      description:
        "Sistema integrado de gestão.",
    }
  );
}

export function Topbar({ role }: { role: AppRole }) {
  const pathname = usePathname();

  const pageInformation =
    getPageInformation(pathname);

  return (
    <header className="sticky top-0 z-30 mb-6 border-b border-white/[0.06] bg-[#0b0b0d]/85 px-4 py-4 backdrop-blur-xl sm:px-6 lg:mb-8 lg:px-8">
      <div className="flex items-center justify-between gap-5">
        <MobileNav role={role} />
        <div className="min-w-0">
          <p className="truncate text-lg font-bold text-white">
            {pageInformation.title}
          </p>

          <p className="mt-0.5 hidden truncate text-sm text-zinc-500 sm:block">
            {pageInformation.description}
          </p>
        </div>

        <div className="flex flex-1 items-center justify-end gap-3">
          <GlobalSearch />

          <Link
            href="/agenda"
            title="Abrir agenda"
            className="hidden h-11 w-11 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.035] text-zinc-500 transition hover:border-orange-500/40 hover:bg-orange-500/10 hover:text-orange-400 sm:flex"
          >
            <CalendarDays size={18} />
          </Link>

          <NotificationCenter />

          <Link
            href="/configuracoes"
            title="Configurações"
            className="hidden h-11 w-11 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.035] text-zinc-500 transition hover:border-orange-500/40 hover:bg-orange-500/10 hover:text-orange-400 md:flex"
          >
            <Settings size={18} />
          </Link>

          <Link
            href="/leads"
            className="hidden h-11 items-center gap-2 rounded-xl bg-orange-500 px-4 text-sm font-bold text-white shadow-lg shadow-orange-500/15 transition hover:bg-orange-600 hover:shadow-orange-500/25 lg:flex"
          >
            <Plus size={18} />

            Nova oportunidade
          </Link>

          <button
            type="button"
            className="flex h-11 items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.035] px-2.5 transition hover:border-white/[0.13] hover:bg-white/[0.055]"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 text-xs font-black text-white shadow-lg shadow-orange-500/15">
              DP
            </div>

            <div className="hidden text-left 2xl:block">
              <p className="max-w-32 truncate text-xs font-bold text-white">
                Daniel Panazzolo
              </p>

              <p className="text-[10px] text-zinc-600">
                Administrador
              </p>
            </div>

            <ChevronDown
              size={14}
              className="hidden text-zinc-600 2xl:block"
            />
          </button>
        </div>
      </div>
    </header>
  );
}
