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
      <aside className="w-72 border-r border-zinc-800 bg-zinc-900 p-6">
        <h1 className="text-4xl font-black text-orange-500">PRD</h1>
        <p className="mb-10 text-zinc-500">Sales System</p>

        <nav className="space-y-2">
          {menu.map((item) => (
            <Link
              key={item.rota}
              href={item.rota}
              className="block rounded-xl px-4 py-3 transition hover:bg-zinc-800"
            >
              {item.nome}
            </Link>
          ))}
        </nav>
      </aside>

      <section className="flex-1 p-8">
        <Topbar />
        {children}
      </section>
    </main>
  );
}