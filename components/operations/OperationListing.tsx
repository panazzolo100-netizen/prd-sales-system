import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function OperationPageHeader({
  breadcrumb,
  title,
  description,
  action,
}: {
  breadcrumb: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-500/80">
          {breadcrumb}
        </p>
        <h1 className="mt-1.5 text-3xl font-black tracking-tight text-white lg:text-4xl">
          {title}
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-zinc-400">{description}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}

export function CompactMetricCard({
  icon: Icon,
  label,
  value,
  tone = "neutral",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  tone?: "neutral" | "orange" | "green";
}) {
  const toneClass = {
    neutral: "bg-zinc-800 text-zinc-400",
    orange: "bg-orange-500/12 text-orange-400",
    green: "bg-emerald-500/12 text-emerald-400",
  }[tone];

  return (
    <div className="flex min-h-16 items-center gap-3 rounded-xl border border-white/[0.07] bg-zinc-900/80 px-3.5 py-2.5">
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${toneClass}`}>
        <Icon size={16} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[11px] font-medium text-zinc-500">{label}</p>
        <p className="mt-0.5 text-xl font-black leading-none text-white">{value}</p>
      </div>
    </div>
  );
}

export function OperationCardGrid({ children }: { children: ReactNode }) {
  return <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{children}</section>;
}

export function CardProgress({
  completed,
  total,
  percentage,
}: {
  completed: number;
  total: number;
  percentage: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-500">{completed} de {total} etapas</span>
        <span className={percentage === 100 ? "font-bold text-emerald-400" : "font-bold text-orange-400"}>
          {percentage}%
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${percentage === 100 ? "bg-emerald-500" : "bg-orange-500"}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function OperationEmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-dashed border-white/10 bg-zinc-900/40 px-6 py-10 text-center">
      <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-800 text-zinc-500">
        <Icon size={20} />
      </span>
      <h2 className="mt-4 text-base font-bold text-white">{title}</h2>
      <p className="mt-1 text-sm text-zinc-500">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </section>
  );
}
