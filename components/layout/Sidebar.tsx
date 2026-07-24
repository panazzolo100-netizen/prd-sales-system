"use client";

import Link from "next/link";
import {
  usePathname,
  useRouter,
} from "next/navigation";
import { useMemo, useState } from "react";

import {
  BarChart3,
  BriefcaseBusiness,
  Calendar,
  ChevronRight,
  ClipboardList,
  DollarSign,
  FileText,
  Home,
  Landmark,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Target,
  UserCog,
  Users,
  Wrench,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { CompanyLogo } from "@/components/layout/CompanyLogo";
import {
  type AppRole,
  type Permission,
  PERMISSIONS,
  canAccessModule,
} from "@/lib/auth/permissions";

const grupos = [
  {
    titulo: "",
    itens: [
      {
        nome: "Dashboard",
        rota: "/",
        icon: Home,
        badge: "",
        permission: PERMISSIONS.DASHBOARD_COMMERCIAL,
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
        badge: "",
        permission: PERMISSIONS.COMMERCIAL,
      },
      {
        nome: "Pipeline",
        rota: "/pipeline",
        icon: BarChart3,
        badge: "",
        permission: PERMISSIONS.COMMERCIAL,
      },
      {
        nome: "Clientes",
        rota: "/clientes",
        icon: Users,
        badge: "",
        permission: PERMISSIONS.COMMERCIAL,
      },
      {
        nome: "Propostas",
        rota: "/propostas",
        icon: FileText,
        badge: "",
        permission: PERMISSIONS.COMMERCIAL,
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
        permission: PERMISSIONS.ENGINEERING,
      },
      {
        nome: "Ordens de Serviço",
        rota: "/os",
        icon: ClipboardList,
        badge: "",
        permission: PERMISSIONS.SERVICE_ORDERS_INTERNAL,
      },
      {
        nome: "Projetos",
        rota: "/projetos",
        icon: BriefcaseBusiness,
        badge: "",
        permission: PERMISSIONS.PROJECTS,
      },
      {
        nome: "Agenda",
        rota: "/agenda",
        icon: Calendar,
        badge: "",
        permission: PERMISSIONS.AGENDA,
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
        permission: PERMISSIONS.FINANCIAL,
      },
      {
        nome: "Fluxo de Caixa",
        rota: "/financeiro/fluxo-caixa",
        icon: Landmark,
        badge: "",
        permission: PERMISSIONS.FINANCIAL,
      },
      {
        nome: "DRE",
        rota: "/financeiro/dre",
        icon: BarChart3,
        badge: "",
        permission: PERMISSIONS.FINANCIAL,
      },
      {
        nome: "Relatórios",
        rota: "/relatorios",
        icon: BarChart3,
        badge: "",
        permission: PERMISSIONS.REPORTS,
      },
      {
        nome: "Configurações",
        rota: "/configuracoes",
        icon: Settings,
        badge: "",
        permission: PERMISSIONS.ADMINISTRATION,
      },
      {
        nome: "Usuários",
        rota: "/configuracoes/usuarios",
        icon: UserCog,
        badge: "",
        permission: PERMISSIONS.ADMINISTRATION,
      },
    ],
  },
];

export function Sidebar({ role, name }: { role: AppRole; name: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const [collapsed, setCollapsed] =
    useState(false);

  const [loggingOut, setLoggingOut] =
    useState(false);

  const activeRoute = useMemo(() => {
    const routes = grupos
      .flatMap((grupo) =>
        grupo.itens.map((item) => item.rota)
      )
      .sort(
        (first, second) =>
          second.length - first.length
      );

    return (
      routes.find((route) => {
        if (route === "/") {
          return pathname === "/";
        }

        return (
          pathname === route ||
          pathname.startsWith(`${route}/`)
        );
      }) ?? ""
    );
  }, [pathname]);

  async function logout() {
    try {
      setLoggingOut(true);

      await supabase.auth.signOut();

      router.push("/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <aside
      className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-white/[0.06] bg-[#0b0b0d] transition-all duration-300 lg:flex ${
        collapsed ? "w-[88px]" : "w-72"
      }`}
    >
      <div className="border-b border-white/[0.05] p-4">
        <div
          className={`relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025] ${
            collapsed ? "p-2" : "p-4"
          }`}
        >
          <div className="pointer-events-none absolute -left-10 -top-10 h-28 w-28 rounded-full bg-orange-500/15 blur-3xl" />

          {collapsed ? (
            <button
              type="button"
              onClick={() =>
                setCollapsed(false)
              }
              title="Expandir menu"
              className="relative flex h-12 w-full items-center justify-center rounded-xl transition hover:bg-white/[0.05]"
            >
              <CompanyLogo collapsed />
            </button>
          ) : (
            <div className="relative">
              <div className="flex items-start justify-between gap-3">
                <Link
                  href="/"
                  className="flex min-w-0 flex-1 items-center"
                >
                  <CompanyLogo collapsed={false} />
                </Link>

                <button
                  type="button"
                  onClick={() =>
                    setCollapsed(true)
                  }
                  title="Recolher menu"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-white/[0.06] hover:text-white"
                >
                  <PanelLeftClose size={18} />
                </button>
              </div>

              <div className="mt-3 border-t border-white/[0.05] pt-3">
                <p className="text-xs font-semibold text-zinc-400">
                  Sistema integrado de gestão
                </p>

                <p className="mt-1 text-[11px] text-zinc-600">
                  Engenharia, energia e obras
                </p>
              </div>
            </div>
          )}
        </div>

        {collapsed && (
          <button
            type="button"
            onClick={() =>
              setCollapsed(false)
            }
            title="Expandir menu"
            className="mt-3 flex h-10 w-full items-center justify-center rounded-xl text-zinc-500 transition hover:bg-white/[0.05] hover:text-white"
          >
            <PanelLeftOpen size={19} />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {grupos.map((grupo) => {
          const allowedItems = grupo.itens.filter((item) =>
            canAccessModule(role, item.permission as Permission)
          );
          if (allowedItems.length === 0) return null;
          return (
          <div
            key={
              grupo.titulo || "principal"
            }
          >
            {grupo.titulo &&
              !collapsed && (
                <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-600">
                  {grupo.titulo}
                </p>
              )}

            {grupo.titulo &&
              collapsed && (
                <div className="mx-auto mb-3 h-px w-8 bg-zinc-800" />
              )}

            <div className="space-y-1">
              {allowedItems.map((item) => {
                const Icon = item.icon;

                const ativo =
                  activeRoute === item.rota;

                return (
                  <Link
                    key={item.rota}
                    href={item.rota}
                    title={
                      collapsed
                        ? item.nome
                        : undefined
                    }
                    className={`group relative flex h-12 items-center rounded-xl transition-all duration-200 ${
                      collapsed
                        ? "justify-center px-3"
                        : "justify-between px-3"
                    } ${
                      ativo
                        ? "bg-orange-500 text-white shadow-lg shadow-orange-500/15"
                        : "text-zinc-500 hover:bg-white/[0.045] hover:text-zinc-100"
                    }`}
                  >
                    {ativo && (
                      <span className="absolute -left-3 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-orange-400" />
                    )}

                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${
                          ativo
                            ? "bg-white/15"
                            : "group-hover:bg-white/[0.05]"
                        }`}
                      >
                        <Icon
                          size={18}
                          strokeWidth={
                            ativo ? 2.4 : 2
                          }
                        />
                      </div>

                      {!collapsed && (
                        <span className="truncate text-sm font-semibold">
                          {item.nome}
                        </span>
                      )}
                    </div>

                    {!collapsed && (
                      <div className="flex items-center gap-2">
                        {item.badge && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              ativo
                                ? "bg-white/20 text-white"
                                : "bg-orange-500/10 text-orange-400"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}

                        {ativo && (
                          <ChevronRight
                            size={15}
                            className="text-white/80"
                          />
                        )}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
          );
        })}
      </nav>

      <div className="border-t border-white/[0.05] p-3">
        {!collapsed && (
          <div className="mb-3 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-sm font-black text-white shadow-lg shadow-orange-500/10">
                DP
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">
                  {name}
                </p>

                <p className="truncate text-xs text-zinc-500">
                  {role.replaceAll("_", " ")}
                </p>
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={logout}
          disabled={loggingOut}
          title={
            collapsed
              ? "Sair do sistema"
              : undefined
          }
          className={`flex h-11 w-full items-center rounded-xl text-sm font-semibold text-zinc-500 transition hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50 ${
            collapsed
              ? "justify-center"
              : "gap-3 px-3"
          }`}
        >
          <LogOut size={18} />

          {!collapsed && (
            <span>
              {loggingOut
                ? "Saindo..."
                : "Sair do sistema"}
            </span>
          )}
        </button>

        {!collapsed && (
          <p className="mt-3 text-center text-[10px] uppercase tracking-[0.18em] text-zinc-700">
            PRD ERP • Versão interna
          </p>
        )}
      </div>
    </aside>
  );
}
