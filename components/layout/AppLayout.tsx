import Link from "next/link";
import { Topbar } from "./Topbar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const menu = [
    { nome: "Dashboard", rota: "/" },
    { nome: "Leads", rota: "/leads" },
    { nome: "Clientes", rota: "/clientes" },
    { nome: "Propostas", rota: "/propostas" },
    { nome: "Agenda", rota: "/agenda" },
    { nome: "Financeiro", rota: "/financeiro" },
    { nome: "Engenharia", rota: "/engenharia" },
  ];

  return (
    <main className="flex min-h-screen bg-zinc-950 text-white">
      <aside className="flex w-72 flex-col border-r border-zinc-800 bg-zinc-900 p-6">
        <div className="mb-10">
          <img
            src="/logo-prd.png"
            alt="PRD Soluções em Engenharia"
            className="w-52"
          />
        </div>

        <nav className="space-y-2">
          {menu.map((item) => (
            <Link
              key={item.rota}
              href={item.rota}
              className="block rounded-xl px-4 py-3 transition hover:bg-orange-500 hover:text-white"
            >
              {item.nome}
            </Link>
          ))}
        </nav>

        <div className="mt-auto border-t border-zinc-800 pt-6">
          <img
            src="/icone-prd.png"
            alt="PRD"
            className="mb-3 h-12 w-12"
          />

          <p className="text-sm font-semibold">PRD Engenharia</p>
          <p className="text-xs text-zinc-500">CRM Comercial</p>
        </div>
      </aside>

      <section className="flex-1 p-8">
        <Topbar />
        {children}
      </section>
    </main>
  );
}