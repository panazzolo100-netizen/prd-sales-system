"use client";


import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Target,
  Users,
  FileText,
  BriefcaseBusiness,
  Wrench,
  Calendar,
  DollarSign,
  Landmark,
  BarChart3,
  Settings,
  ChevronRight,
  ClipboardList,
} from "lucide-react";

const grupos = [
  {
    titulo: "",
    itens: [
      {
        nome: "Dashboard",
        rota: "/",
        icon: Home,
        badge: "",
      },
    ],
  },
  {
    titulo: "Comercial",
    itens: [
      {
        nome: "Oportunidades",
        rota: "/leads",
        icon: Target,
        badge: "12",
      },
      {
        nome: "Pipeline",
        rota: "/pipeline",
        icon: BarChart3,
        badge: "",
      },
      {
        nome: "Clientes",
        rota: "/clientes",
        icon: Users,
        badge: "",
      },
      {
        nome: "Propostas",
        rota: "/propostas",
        icon: FileText,
        badge: "3",
      },
    ],
  },
  {
    titulo: "Operação",
    itens: [
      {
        nome: "Engenharia",
        rota: "/engenharia",
        icon: Wrench,
        badge: "",
      },
      {
        nome: "Ordens de Serviço",
        rota: "/os",
        icon: ClipboardList,
        badge: "",
      },
      {
        nome: "Projetos",
        rota: "/projetos",
        icon: BriefcaseBusiness,
        badge: "",
      },
      {
        nome: "Agenda",
        rota: "/agenda",
        icon: Calendar,
        badge: "2",
      },
    ],
  },
  {
    titulo: "Gestão",
    itens: [
      {
        nome: "Financeiro",
        rota: "/financeiro",
        icon: DollarSign,
        badge: "",
      },
      
      {
  nome: "Fluxo de Caixa",
  rota: "/financeiro/fluxo-caixa",
  icon: Landmark,
  badge: "",
},
{
  nome: "DRE",
  rota: "/financeiro/dre",
  icon: BarChart3,
  badge: "",
},
      {
        nome: "Relatórios",
        rota: "/relatorios",
        icon: BarChart3,
        badge: "",
      },

      {
        nome: "Configurações",
        rota: "/configuracoes",
        icon: Settings,
        badge: "",
      },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex min-h-screen w-72 flex-col border-r border-zinc-800 bg-[#0f0f11] p-5">
      <div className="mb-8 flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
        <img
          src="/logo-prd.png"
          alt="PRD OS"
          className="w-44"
        />
      </div>

      <nav className="space-y-6">
        {grupos.map((grupo) => (
          <div key={grupo.titulo || "principal"}>
            {grupo.titulo && (
              <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                {grupo.titulo}
              </p>
            )}

            <div className="space-y-1">
              {grupo.itens.map((item) => {
                const Icon = item.icon;

                const ativo =
                  pathname === item.rota ||
                  (item.rota !== "/" &&
                    pathname.startsWith(
                      item.rota
                    ));

                return (
                  <Link
                    key={item.nome}
                    href={item.rota}
                    className={`group flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium transition ${
                      ativo
                        ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                        : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} />

                      <span>
                        {item.nome}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                            ativo
                              ? "bg-white/20 text-white"
                              : "bg-orange-500/15 text-orange-400"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}

                      {ativo && (
                        <ChevronRight
                          size={15}
                        />
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-auto rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
        <p className="text-sm font-bold text-white">
          PRD OS
        </p>

        <p className="mt-1 text-xs text-zinc-500">
          CRM para engenharia, solar e obras.
        </p>

        <div className="mt-4 h-2 rounded-full bg-zinc-800">
          <div className="h-2 w-[62%] rounded-full bg-orange-500" />
        </div>

        <p className="mt-2 text-xs text-zinc-500">
          Versão interna PRD
        </p>
      </div>
    </aside>
  );
}