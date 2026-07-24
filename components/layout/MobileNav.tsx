"use client";

import Link from "next/link";
import {
  BarChart3,
  BriefcaseBusiness,
  Calendar,
  ClipboardList,
  DollarSign,
  Home,
  Menu,
  Settings,
  Target,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { CompanyLogo } from "./CompanyLogo";
import {
  type AppRole,
  type Permission,
  PERMISSIONS,
  canAccessModule,
} from "@/lib/auth/permissions";

const links: Array<{
  href: string;
  label: string;
  icon: typeof Home;
  permission: Permission;
}> = [
  { href: "/", label: "Dashboard", icon: Home, permission: PERMISSIONS.DASHBOARD_COMMERCIAL },
  { href: "/leads", label: "Oportunidades", icon: Target, permission: PERMISSIONS.COMMERCIAL },
  { href: "/clientes", label: "Clientes", icon: Users, permission: PERMISSIONS.COMMERCIAL },
  { href: "/projetos", label: "Projetos", icon: BriefcaseBusiness, permission: PERMISSIONS.PROJECTS },
  { href: "/os", label: "Ordens de Serviço", icon: ClipboardList, permission: PERMISSIONS.SERVICE_ORDERS_INTERNAL },
  { href: "/agenda", label: "Agenda", icon: Calendar, permission: PERMISSIONS.AGENDA },
  { href: "/financeiro", label: "Financeiro", icon: DollarSign, permission: PERMISSIONS.FINANCIAL },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3, permission: PERMISSIONS.REPORTS },
  { href: "/configuracoes", label: "Configurações", icon: Settings, permission: PERMISSIONS.ADMINISTRATION },
  { href: "/configuracoes/usuarios", label: "Usuários", icon: UserCog, permission: PERMISSIONS.ADMINISTRATION },
];

export function MobileNav({ role }: { role: AppRole }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const allowedLinks = links.filter((link) =>
    canAccessModule(role, link.permission)
  );

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-zinc-400 lg:hidden" aria-label="Abrir menu">
        <Menu size={20} />
      </button>
      {open && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <button className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} aria-label="Fechar menu" />
          <aside className="absolute inset-y-0 left-0 w-[min(86vw,320px)] border-r border-white/10 bg-zinc-950 p-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.07] pb-4">
              <CompanyLogo collapsed={false} />
              <button onClick={() => setOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05] text-zinc-400" aria-label="Fechar menu">
                <X size={19} />
              </button>
            </div>
            <nav className="mt-5 grid gap-1">
              {allowedLinks.map(({ href, label, icon: Icon }) => {
                const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
                return (
                  <Link onClick={() => setOpen(false)} key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold ${active ? "bg-orange-500 text-white" : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"}`}>
                    <Icon size={18} />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
