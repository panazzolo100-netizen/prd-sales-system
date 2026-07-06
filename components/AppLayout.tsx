import Link from "next/link";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const menu = [
    ["Dashboard", "/"],
    ["Leads", "/leads"],
    ["Clientes", "/clientes"],
    ["Propostas", "/propostas"],
    ["Engenharia", "/engenharia"],
    ["Financeiro", "/financeiro"],
    ["Agenda", "/agenda"],
  ];

  return (
    <main className="flex min-h-screen bg-zinc-950 text-white">
      <aside className="w-72 border-r border-zinc-800 bg-zinc-900 p-6">
        <h1 className="text-4xl font-black text-orange-500">PRD</h1>
        <p className="mb-10 text-zinc-400">Sales System</p>

        <nav className="space-y-2">
          {menu.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="block rounded-xl px-4 py-3 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      <section className="flex-1 p-10">{children}</section>
    </main>
  );
}