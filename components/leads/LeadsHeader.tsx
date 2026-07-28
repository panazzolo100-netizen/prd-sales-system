import { Plus } from "lucide-react";

type LeadsHeaderProps = {
  totalLeads: number;
  onNewLead(): void;
};

export function LeadsHeader({
  totalLeads,
  onNewLead,
}: LeadsHeaderProps) {
  return (
    <header className="flex flex-col gap-5 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 text-[var(--foreground)] shadow-sm md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-500">
          Comercial
        </p>

        <h1 className="mt-2 text-4xl font-black tracking-tight text-[var(--foreground)]">
          Oportunidades
        </h1>

        <p className="mt-2 text-[var(--muted)]">
          {totalLeads} oportunidade(s) cadastrada(s) no funil comercial.
        </p>
      </div>

      <button
        type="button"
        onClick={onNewLead}
        className="flex h-12 items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 font-bold text-white shadow-lg shadow-orange-500/15 transition hover:bg-orange-600"
      >
        <Plus size={19} />

        Nova oportunidade
      </button>
    </header>
  );
}