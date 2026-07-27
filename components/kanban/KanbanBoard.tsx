"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, GripVertical, LoaderCircle, MoreVertical, RotateCcw, Search, XCircle } from "lucide-react";

export type KanbanColumn = {
  id: string;
  label: string;
  statuses: string[];
  moveStatus?: string;
  tone?: "orange" | "sky" | "amber" | "green" | "red";
};

export type KanbanItem = {
  id: string;
  status: string;
  title: string;
  subtitle?: string | null;
  meta?: string | null;
  detail?: string | null;
  progress?: { completed: number; total: number; percentage: number };
  href?: string;
  updatedAt?: Date | string;
  overdue?: boolean;
  archived?: boolean;
  movable?: boolean;
};

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  items: KanbanItem[];
  columns: KanbanColumn[];
  statusEndpoint: (id: string) => string;
  onOpen?: (id: string) => void;
  action?: React.ReactNode;
  metric?: (items: KanbanItem[]) => { label: string; value: string | number }[];
  confirmStatuses?: string[];
  onStatusChanged?: (id: string, status: string) => void;
  extraMoves?: { label: string; status: string }[];
};

const tone = {
  orange: "bg-orange-500",
  sky: "bg-sky-500",
  amber: "bg-amber-500",
  green: "bg-emerald-500",
  red: "bg-red-500",
};

export function KanbanBoard({ eyebrow, title, description, items: initialItems, columns, statusEndpoint, onOpen, action, metric, confirmStatuses = [], onStatusChanged, extraMoves = [] }: Props) {
  const [items, setItems] = useState(initialItems);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("TODOS");
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [dragged, setDragged] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [menu, setMenu] = useState<string | null>(null);
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null);
  const didDrag = useRef(false);
  const touchDrag = useRef<{ id: string; columnId: string | null } | null>(null);

  const visible = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("pt-BR");
    return items.filter((item) => {
      const matchesText = !query || [item.title, item.subtitle, item.meta, item.detail].some((value) => value?.toLocaleLowerCase("pt-BR").includes(query));
      const matchesStatus = status === "TODOS" || item.status === status;
      return !item.archived && matchesText && matchesStatus && (!overdueOnly || item.overdue);
    });
  }, [items, overdueOnly, search, status]);

  const metrics = metric?.(items) ?? [
    { label: "Total", value: items.length },
    { label: "Em exibição", value: visible.length },
    { label: "Atrasados", value: items.filter((item) => item.overdue).length },
    { label: "Concluídos", value: items.filter((item) => ["CONCLUIDO", "CONCLUIDA", "APROVADA"].includes(item.status)).length },
  ];

  function notify(ok: boolean, text: string) {
    setToast({ ok, text });
    window.setTimeout(() => setToast(null), 3500);
  }

  async function moveItem(id: string, nextStatus?: string) {
    if (!nextStatus) return;
    const current = items.find((item) => item.id === id);
    if (!current || current.status === nextStatus || saving) return;
    if (confirmStatuses.includes(nextStatus) && !window.confirm(`Confirma a mudança para ${nextStatus.replaceAll("_", " ").toLocaleLowerCase("pt-BR")}?`)) return;
    const previous = items;
    setSaving(id);
    setItems((all) => all.map((item) => item.id === id ? { ...item, status: nextStatus, updatedAt: new Date().toISOString() } : item));
    setMenu(null);
    try {
      const response = await fetch(statusEndpoint(id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, expectedUpdatedAt: current.updatedAt }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || "Não foi possível mover o card.");
      setItems((all) => all.map((item) => item.id === id
        ? { ...item, status: nextStatus, updatedAt: body.updatedAt ?? item.updatedAt }
        : item));
      onStatusChanged?.(id, nextStatus);
      notify(true, "Status atualizado com sucesso.");
    } catch (error) {
      setItems(previous);
      notify(false, error instanceof Error ? error.message : "Não foi possível mover o card.");
    } finally {
      setSaving(null);
      setDragged(null);
      setDragOver(null);
    }
  }

  function open(item: KanbanItem) {
    if (didDrag.current) {
      didDrag.current = false;
      return;
    }
    onOpen?.(item.id);
  }

  return (
    <div className="relative space-y-5" onClick={() => setMenu(null)}>
      {toast && (
        <div role="status" aria-live="polite" className={`fixed right-5 top-20 z-[100] flex max-w-sm items-center gap-3 rounded-2xl border p-4 shadow-2xl ${toast.ok ? "border-emerald-500/20 bg-emerald-950 text-emerald-100" : "border-red-500/20 bg-red-950 text-red-100"}`}>
          {toast.ok ? <CheckCircle2 size={18} /> : <XCircle size={18} />}<span className="text-sm font-semibold">{toast.text}</span>
        </div>
      )}

      <header className="flex flex-col gap-5 rounded-3xl border border-white/[0.07] bg-zinc-900 p-5 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-[.18em] text-orange-500">{eyebrow}</p><h1 className="mt-2 text-3xl font-black text-white">{title}</h1><p className="mt-1 text-sm text-zinc-400">{description}</p></div>
        {action}
      </header>

      <section className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {metrics.map((item) => <div key={item.label} className="rounded-2xl border border-white/[0.07] bg-zinc-950 px-4 py-3"><p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">{item.label}</p><p className="mt-1 truncate text-xl font-black text-white">{item.value}</p></div>)}
      </section>

      <section className="rounded-2xl border border-white/[0.07] bg-zinc-900/60 p-2.5">
        <div className="grid gap-2 md:grid-cols-[minmax(240px,1fr)_190px_150px_auto]">
          <label className="relative"><Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..." className="h-10 w-full rounded-xl border border-white/[0.07] bg-zinc-950 pl-10 pr-3 text-sm text-white outline-none focus:border-orange-500/40" /></label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 rounded-xl border border-white/[0.07] bg-zinc-950 px-3 text-sm text-white"><option value="TODOS">Todos os status</option>{Array.from(new Set(columns.flatMap((column) => column.statuses))).map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}</select>
          <label className="flex h-10 items-center gap-2 rounded-xl border border-white/[0.07] bg-zinc-950 px-3 text-xs font-semibold text-zinc-300"><input type="checkbox" checked={overdueOnly} onChange={(e) => setOverdueOnly(e.target.checked)} className="accent-orange-500" /> Atrasados</label>
          <button type="button" onClick={() => { setSearch(""); setStatus("TODOS"); setOverdueOnly(false); }} className="flex h-10 items-center justify-center gap-2 rounded-xl px-3 text-xs font-semibold text-zinc-500 hover:bg-white/5 hover:text-white"><RotateCcw size={15} />Limpar filtros</button>
        </div>
      </section>

      <div className="max-w-full overflow-x-auto overscroll-x-contain pb-3 [scroll-snap-type:x_proximity]">
        <div className="grid min-w-max grid-flow-col auto-cols-[minmax(280px,320px)] gap-4">
          {columns.map((column) => {
            const cards = visible.filter((item) => column.statuses.includes(item.status));
            const active = dragOver === column.id;
            return <section key={column.id} data-kanban-column={column.id} onDragOver={(e) => { if (column.moveStatus) { e.preventDefault(); setDragOver(column.id); } }} onDrop={(e) => { e.preventDefault(); void moveItem(e.dataTransfer.getData("text/plain"), column.moveStatus); }} className={`min-h-[360px] scroll-ml-3 snap-start rounded-2xl border p-3 transition ${active ? "border-orange-500/50 bg-orange-500/[.05]" : "border-white/[.07] bg-zinc-950/70"}`}>
              <div className="sticky top-0 z-10 mb-3 flex items-center justify-between rounded-xl border border-white/[.06] bg-zinc-900/95 p-3 backdrop-blur"><div className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${tone[column.tone ?? "orange"]}`} /><h2 className="text-sm font-bold text-white">{column.label}</h2></div><span className="rounded-full bg-white/[.06] px-2 py-0.5 text-xs font-bold text-zinc-400">{cards.length}</span></div>
              <div className="space-y-3">
                {cards.map((item) => {
                  const card = <article draggable={!saving && item.movable !== false} onDragStart={(e) => { didDrag.current = true; e.dataTransfer.setData("text/plain", item.id); setDragged(item.id); }} onDragEnd={() => { setDragged(null); setDragOver(null); window.setTimeout(() => { didDrag.current = false; }, 100); }}
                    onPointerDown={(e) => { if (e.pointerType === "touch" && !saving && item.movable !== false) touchDrag.current = { id: item.id, columnId: null }; }}
                    onPointerMove={(e) => { if (e.pointerType !== "touch" || !touchDrag.current) return; const target = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>("[data-kanban-column]"); const columnId = target?.dataset.kanbanColumn ?? null; touchDrag.current.columnId = columnId; didDrag.current = true; setDragged(item.id); setDragOver(columnId); }}
                    onPointerUp={() => { const touch = touchDrag.current; touchDrag.current = null; if (touch?.columnId) { const target = columns.find((column) => column.id === touch.columnId); void moveItem(touch.id, target?.moveStatus); } setDragged(null); setDragOver(null); window.setTimeout(() => { didDrag.current = false; }, 100); }}
                    onPointerCancel={() => { touchDrag.current = null; setDragged(null); setDragOver(null); }}
                    onClick={() => open(item)} onKeyDown={(e) => { if (e.key === "Enter") open(item); }} tabIndex={0} className={`group relative touch-none cursor-pointer rounded-2xl border bg-zinc-900 p-4 outline-none transition focus-visible:ring-2 focus-visible:ring-orange-500 ${item.overdue ? "border-red-500/35" : "border-zinc-800 hover:border-orange-500/35"} ${dragged === item.id ? "scale-95 opacity-40" : "hover:-translate-y-0.5"} ${saving === item.id ? "pointer-events-none opacity-60" : ""}`}>
                    <div className="flex items-start justify-between gap-2"><div className="min-w-0"><h3 className="truncate font-bold text-white">{item.title}</h3>{item.subtitle && <p className="mt-1 truncate text-xs text-zinc-400">{item.subtitle}</p>}</div><div className="relative" onClick={(e) => e.stopPropagation()}>{saving === item.id ? <LoaderCircle size={17} className="animate-spin text-orange-400" /> : <button type="button" aria-label="Ações e mover card" onClick={() => setMenu(menu === item.id ? null : item.id)} className="rounded-lg p-1.5 text-zinc-500 hover:bg-white/5 hover:text-white"><MoreVertical size={17} /></button>}{menu === item.id && <div className="absolute right-0 top-8 z-30 w-52 rounded-xl border border-white/[.08] bg-zinc-950 p-1.5 shadow-2xl"><p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-zinc-600">Mover para</p>{columns.filter((target) => target.moveStatus).map((target) => <button key={target.id} type="button" disabled={target.statuses.includes(item.status)} onClick={() => void moveItem(item.id, target.moveStatus)} className="block w-full rounded-lg px-2 py-2 text-left text-xs text-zinc-300 hover:bg-orange-500/10 hover:text-orange-300 disabled:opacity-35">{target.label}</button>)}{extraMoves.map((target) => <button key={target.status} type="button" disabled={item.status === target.status} onClick={() => void moveItem(item.id, target.status)} className="block w-full rounded-lg px-2 py-2 text-left text-xs text-zinc-300 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-35">{target.label}</button>)}</div>}</div></div>
                    {item.meta && <p className="mt-3 text-sm text-zinc-300">{item.meta}</p>}{item.detail && <p className="mt-2 line-clamp-2 text-xs leading-5 text-zinc-500">{item.detail}</p>}
                    {item.progress && <div className="mt-4"><div className="mb-1.5 flex justify-between text-[11px] text-zinc-500"><span>{item.progress.completed}/{item.progress.total} etapas</span><span>{item.progress.percentage}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-zinc-800"><div className="h-full rounded-full bg-orange-500" style={{ width: `${item.progress.percentage}%` }} /></div></div>}
                    <div className="mt-4 flex items-center justify-between border-t border-white/[.06] pt-3 text-[11px] text-zinc-500"><span className="flex items-center gap-1"><GripVertical size={13} /> Arraste ou use o menu</span>{item.overdue && <span className="flex items-center gap-1 font-semibold text-red-400"><AlertTriangle size={13} />Atrasado</span>}</div>
                  </article>;
                  return item.href && !onOpen ? <Link key={item.id} href={item.href} className="block">{card}</Link> : <div key={item.id}>{card}</div>;
                })}
                {cards.length === 0 && <div className={`rounded-xl border border-dashed p-7 text-center text-xs ${active ? "border-orange-500/40 text-orange-300" : "border-zinc-800 text-zinc-600"}`}>{active ? "Solte o card aqui" : "Nenhum card nesta etapa"}</div>}
              </div>
            </section>;
          })}
        </div>
      </div>
    </div>
  );
}
