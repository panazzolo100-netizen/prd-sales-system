"use client";

import Link from "next/link";
import { Command, Loader2, Search, Users, BriefcaseBusiness, ClipboardList } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Results = {
  clients: Array<{ id: string; name: string; phone: string | null; city: string | null }>;
  projects: Array<{ id: string; title: string; status: string; client: { name: string } }>;
  serviceOrders: Array<{ id: string; number: string; title: string; status: string }>;
};

const emptyResults: Results = { clients: [], projects: [], serviceOrders: [] };

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Results>(emptyResults);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function shortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault(); inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) { setResults(emptyResults); setError(""); return; }
    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        setLoading(true); setError("");
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal });
        if (!response.ok) throw new Error();
        setResults(await response.json());
      } catch (requestError) {
        if ((requestError as Error).name !== "AbortError") setError("Não foi possível pesquisar agora.");
      } finally { setLoading(false); }
    }, 250);
    return () => { window.clearTimeout(timeout); controller.abort(); };
  }, [query]);

  const hasResults = results.clients.length + results.projects.length + results.serviceOrders.length > 0;
  const open = query.trim().length >= 2;

  return <div className="relative hidden w-full max-w-md xl:block">
    <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
    <input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Pesquisar clientes, projetos ou OS..." className="h-11 w-full rounded-xl border border-white/[0.07] bg-white/[0.035] pl-11 pr-20 text-sm text-white outline-none transition placeholder:text-zinc-600 hover:border-white/[0.12] focus:border-orange-500/60 focus:bg-white/[0.05] focus:ring-4 focus:ring-orange-500/10" />
    <div className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-md border border-white/[0.07] bg-black/20 px-2 py-1 text-[10px] font-semibold text-zinc-600"><Command size={11} /><span>K</span></div>
    {open && <div className="absolute right-0 top-14 z-50 max-h-[70vh] w-full overflow-y-auto rounded-2xl border border-white/10 bg-zinc-950 p-2 shadow-2xl shadow-black/60">
      {loading ? <SearchState icon={Loader2} text="Pesquisando..." spin /> : error ? <SearchState icon={Search} text={error} /> : !hasResults ? <SearchState icon={Search} text="Nenhum resultado encontrado." /> : <>
        <ResultGroup title="Clientes" icon={Users} items={results.clients.map((item) => ({ id: item.id, href: `/clientes?cliente=${item.id}`, title: item.name, subtitle: [item.city, item.phone].filter(Boolean).join(" • ") || "Cliente" }))} onSelect={() => setQuery("")} />
        <ResultGroup title="Projetos" icon={BriefcaseBusiness} items={results.projects.map((item) => ({ id: item.id, href: `/projetos?projeto=${item.id}`, title: item.title, subtitle: `${item.client.name} • ${item.status.replaceAll("_", " ")}` }))} onSelect={() => setQuery("")} />
        <ResultGroup title="Ordens de serviço" icon={ClipboardList} items={results.serviceOrders.map((item) => ({ id: item.id, href: `/os/${item.id}`, title: `${item.number} — ${item.title}`, subtitle: item.status.replaceAll("_", " ") }))} onSelect={() => setQuery("")} />
      </>}
    </div>}
  </div>;
}

function SearchState({ icon: Icon, text, spin = false }: { icon: typeof Search; text: string; spin?: boolean }) {
  return <div className="flex items-center justify-center gap-2 p-8 text-sm text-zinc-500"><Icon size={18} className={spin ? "animate-spin" : ""} />{text}</div>;
}

function ResultGroup({ title, icon: Icon, items, onSelect }: { title: string; icon: typeof Search; items: Array<{ id: string; href: string; title: string; subtitle: string }>; onSelect: () => void }) {
  if (!items.length) return null;
  return <div className="p-1"><p className="flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-zinc-600"><Icon size={13} />{title}</p>{items.map((item) => <Link onClick={onSelect} key={item.id} href={item.href} className="block rounded-xl px-3 py-2.5 transition hover:bg-orange-500/10"><p className="truncate text-sm font-semibold text-white">{item.title}</p><p className="mt-0.5 truncate text-xs text-zinc-500">{item.subtitle}</p></Link>)}</div>;
}
