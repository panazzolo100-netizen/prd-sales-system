"use client";

import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  Plus,
  Search,
  Trash2,
  UserRound,
  UsersRound,
  X,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useMemo, useState } from "react";

type Order = {
  id: string;
  number: string;
  title: string;
  status: string;
  responsible: string | null;
  team: string | null;
  priority: string;
  scheduleType: string;
  scheduledDate: Date | string | null;
  project: {
    title: string;
    client: {
      name: string;
      city: string | null;
      address: string | null;
    };
  };
};

type User = {
  id: string;
  name: string;
};

type Toast = {
  type: "success" | "error";
  message: string;
} | null;

const periods = [
  ["ALL", "Todos"],
  ["TODAY", "Hoje"],
  ["TOMORROW", "Amanhã"],
  ["WEEK", "Esta semana"],
  ["NEXT_WEEK", "Próxima semana"],
  ["MONTH", "Este mês"],
  ["UPCOMING", "Próximos"],
  ["OVERDUE", "Atrasados"],
];

const priorities = [
  ["ALL", "Todas as prioridades"],
  ["CRITICA", "Crítica"],
  ["MUITO_IMPORTANTE", "Muito importante"],
  ["IMPORTANTE", "Importante"],
  ["NORMAL", "Normal"],
  ["BAIXA", "Baixa"],
];

const priorityWeight: Record<string, number> = {
  CRITICA: 0,
  MUITO_IMPORTANTE: 1,
  IMPORTANTE: 2,
  NORMAL: 3,
  BAIXA: 4,
};

export function AgendaPanel({
  orders,
  users,
}: {
  orders: Order[];
  users: User[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [agendaOrders, setAgendaOrders] = useState(orders);
  const [pendingDeletion, setPendingDeletion] =
    useState<Order | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<Toast>(null);

  const period = params.get("periodo") ?? "ALL";
  const search = params.get("busca") ?? "";
  const priority = params.get("prioridade") ?? "ALL";
  const responsible = params.get("responsavel") ?? "ALL";
  const status = params.get("status") ?? "ALL";
  const type = params.get("tipo") ?? "ALL";

  function setFilter(name: string, value: string) {
    const next = new URLSearchParams(params.toString());

    if (!value || value === "ALL") {
      next.delete(name);
    } else {
      next.set(name, value);
    }

    router.replace(`${pathname}?${next}`, {
      scroll: false,
    });
  }

  function showToast(nextToast: Exclude<Toast, null>) {
    setToast(nextToast);

    window.setTimeout(() => {
      setToast(null);
    }, 4000);
  }

  async function confirmDeletion() {
    if (!pendingDeletion) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(
        `/api/agenda?id=${encodeURIComponent(pendingDeletion.id)}`,
        {
          method: "DELETE",
        }
      );
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(
          payload.error ??
            "Não foi possível remover o agendamento."
        );
      }

      setAgendaOrders((current) =>
        current.filter(
          (order) => order.id !== pendingDeletion.id
        )
      );
      setPendingDeletion(null);
      showToast({
        type: "success",
        message: `${pendingDeletion.number} foi removida da agenda. A Ordem de Serviço e seu histórico foram preservados.`,
      });
      router.refresh();
    } catch (error) {
      showToast({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Não foi possível remover o agendamento.",
      });
    } finally {
      setDeleting(false);
    }
  }

  const now = useMemo(() => new Date(), []);
  const today = useMemo(
    () =>
      new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      ),
    [now]
  );

  const filtered = useMemo(
    () =>
      agendaOrders
        .filter((order) => {
          const date = order.scheduledDate
            ? new Date(order.scheduledDate)
            : null;

          if (!date) {
            return false;
          }

          const day = Math.floor(
            (date.getTime() - today.getTime()) / 86400000
          );
          const periodMatch =
            period === "ALL" ||
            (period === "TODAY" && day === 0) ||
            (period === "TOMORROW" && day === 1) ||
            (period === "WEEK" && day >= 0 && day < 7) ||
            (period === "NEXT_WEEK" &&
              day >= 7 &&
              day < 14) ||
            (period === "MONTH" &&
              date.getMonth() === today.getMonth() &&
              date.getFullYear() === today.getFullYear()) ||
            (period === "UPCOMING" && day >= 0) ||
            (period === "OVERDUE" &&
              date < now &&
              !order.status.includes("CONCL"));
          const term =
            search.toLocaleLowerCase("pt-BR");

          return (
            periodMatch &&
            (!term ||
              [
                order.number,
                order.title,
                order.project.title,
                order.project.client.name,
              ].some((value) =>
                value
                  .toLocaleLowerCase("pt-BR")
                  .includes(term)
              )) &&
            (priority === "ALL" ||
              order.priority === priority) &&
            (responsible === "ALL" ||
              order.responsible === responsible) &&
            (status === "ALL" ||
              order.status === status) &&
            (type === "ALL" ||
              order.scheduleType === type)
          );
        })
        .sort((first, second) => {
          const firstDate = new Date(
            first.scheduledDate!
          );
          const secondDate = new Date(
            second.scheduledDate!
          );
          const firstOverdue =
            firstDate < now &&
            !first.status.includes("CONCL")
              ? 0
              : 1;
          const secondOverdue =
            secondDate < now &&
            !second.status.includes("CONCL")
              ? 0
              : 1;

          return (
            firstOverdue -
              secondOverdue ||
            (priorityWeight[first.priority] ?? 3) -
              (priorityWeight[second.priority] ?? 3) ||
            firstDate.getTime() -
              secondDate.getTime()
          );
        }),
    [
      agendaOrders,
      now,
      period,
      priority,
      responsible,
      search,
      status,
      today,
      type,
    ]
  );

  const groups = groupOrders(filtered, today);

  return (
    <main className="space-y-7">
      {toast && (
        <div className="fixed right-6 top-24 z-[100] w-[calc(100%-3rem)] max-w-md">
          <div
            className={`flex items-start gap-3 rounded-2xl border p-4 shadow-2xl ${
              toast.type === "success"
                ? "border-emerald-500/20 bg-emerald-950/95"
                : "border-red-500/20 bg-red-950/95"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-400" />
            ) : (
              <XCircle className="mt-0.5 shrink-0 text-red-400" />
            )}
            <p className="flex-1 text-sm leading-6 text-zinc-200">
              {toast.message}
            </p>
            <button
              type="button"
              onClick={() => setToast(null)}
              aria-label="Fechar mensagem"
              className="text-zinc-500 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-400">
            Operação
          </p>
          <h1 className="mt-2 text-4xl font-black text-white">
            Agenda
          </h1>
          <p className="mt-2 text-zinc-400">
            Compromissos ordenados por atraso, prioridade e
            horário.
          </p>
        </div>
        <Link
          href="/os"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-bold text-white"
        >
          <Plus size={18} />
          Novo agendamento
        </Link>
      </header>

      <section className="space-y-3 rounded-2xl border border-white/[0.07] bg-zinc-900 p-4">
        <div className="flex flex-wrap gap-2">
          {periods.map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() =>
                setFilter("periodo", value)
              }
              className={`rounded-lg px-3 py-2 text-xs font-bold ${
                period === value
                  ? "bg-orange-500 text-white"
                  : "bg-zinc-800 text-zinc-400"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="grid gap-3 lg:grid-cols-[1fr_repeat(4,190px)]">
          <label className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"
              size={17}
            />
            <input
              value={search}
              onChange={(event) =>
                setFilter("busca", event.target.value)
              }
              placeholder="Cliente, projeto ou OS"
              className="h-11 w-full rounded-xl border border-white/[0.08] bg-zinc-950 pl-10 pr-4 text-sm text-white"
            />
          </label>
          <Select
            value={responsible}
            onChange={(value) =>
              setFilter("responsavel", value)
            }
            options={[
              ["ALL", "Responsáveis"],
              ...users.map((user) => [
                user.name,
                user.name,
              ]),
            ]}
          />
          <Select
            value={priority}
            onChange={(value) =>
              setFilter("prioridade", value)
            }
            options={priorities}
          />
          <Select
            value={status}
            onChange={(value) =>
              setFilter("status", value)
            }
            options={[
              ["ALL", "Todos os status"],
              ["AGENDADA", "Agendado"],
              ["EM_ANDAMENTO", "Em andamento"],
              ["CONCLUIDA", "Concluído"],
              ["CANCELADA", "Cancelado"],
            ]}
          />
          <Select
            value={type}
            onChange={(value) =>
              setFilter("tipo", value)
            }
            options={[
              ["ALL", "Todos os tipos"],
              ["VISITA", "Visita"],
              ["INSTALACAO", "Instalação"],
              ["REUNIAO", "Reunião"],
              ["VISTORIA", "Vistoria"],
              ["ENTREGA", "Entrega"],
              ["COBRANCA", "Cobrança"],
              ["COMPROMISSO", "Compromisso"],
              ["OUTRO", "Outro"],
            ]}
          />
        </div>
      </section>

      {groups.map(([label, items]) => (
        <section key={label}>
          <h2 className="mb-3 text-xl font-black text-white">
            {label}
            <span className="ml-2 text-sm text-zinc-600">
              {items.length}
            </span>
          </h2>
          <div className="space-y-3">
            {items.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onDelete={() =>
                  setPendingDeletion(order)
                }
              />
            ))}
          </div>
        </section>
      ))}

      {!filtered.length && (
        <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center">
          <CalendarClock
            className="mx-auto text-zinc-600"
            size={38}
          />
          <h2 className="mt-4 text-xl font-bold text-white">
            Nenhum agendamento encontrado
          </h2>
          <p className="mt-2 text-zinc-500">
            Ajuste os filtros ou crie um agendamento pela
            Ordem de Serviço.
          </p>
          <Link
            href="/os"
            className="mt-5 inline-flex rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white"
          >
            Abrir Ordens de Serviço
          </Link>
        </div>
      )}

      {pendingDeletion && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-agenda-title"
        >
          <div className="w-full max-w-lg rounded-3xl border border-red-500/20 bg-zinc-900 p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
              <Trash2 size={23} />
            </div>
            <h2
              id="delete-agenda-title"
              className="mt-5 text-2xl font-black text-white"
            >
              Remover agendamento?
            </h2>
            <p className="mt-3 leading-6 text-zinc-400">
              Você está removendo{" "}
              <strong className="text-white">
                {pendingDeletion.number} —{" "}
                {pendingDeletion.title}
              </strong>{" "}
              da agenda.
            </p>
            <p className="mt-3 rounded-xl border border-white/[0.07] bg-zinc-950 p-3 text-sm leading-5 text-zinc-500">
              A Ordem de Serviço, o projeto, o cliente e todo o
              histórico operacional serão preservados.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() =>
                  setPendingDeletion(null)
                }
                className="rounded-xl border border-white/10 px-5 py-3 text-sm font-bold text-zinc-300 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDeletion}
                className="rounded-xl bg-red-500 px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                {deleting
                  ? "Removendo..."
                  : "Remover da agenda"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[][];
}) {
  return (
    <select
      value={value}
      onChange={(event) =>
        onChange(event.target.value)
      }
      className="h-11 rounded-xl border border-white/[0.08] bg-zinc-950 px-3 text-sm text-white"
    >
      {options.map(([optionValue, label]) => (
        <option
          key={optionValue}
          value={optionValue}
        >
          {label}
        </option>
      ))}
    </select>
  );
}

function groupOrders(
  orders: Order[],
  today: Date
): [string, Order[]][] {
  const groups: Record<string, Order[]> = {
    Atrasados: [],
    Hoje: [],
    Amanhã: [],
    "Esta semana": [],
    Próximos: [],
  };

  for (const order of orders) {
    const date = new Date(order.scheduledDate!);
    const day = Math.floor(
      (date.getTime() - today.getTime()) / 86400000
    );
    const label =
      date < new Date() &&
      !order.status.includes("CONCL")
        ? "Atrasados"
        : day === 0
          ? "Hoje"
          : day === 1
            ? "Amanhã"
            : day < 7
              ? "Esta semana"
              : "Próximos";

    groups[label].push(order);
  }

  return Object.entries(groups).filter(
    ([, items]) => items.length
  ) as [string, Order[]][];
}

function OrderCard({
  order,
  onDelete,
}: {
  order: Order;
  onDelete: () => void;
}) {
  const date = new Date(order.scheduledDate!);
  const colors: Record<string, string> = {
    CRITICA: "bg-red-500/15 text-red-300",
    MUITO_IMPORTANTE:
      "bg-orange-500/15 text-orange-300",
    IMPORTANTE: "bg-amber-500/15 text-amber-300",
    NORMAL: "bg-blue-500/10 text-blue-300",
    BAIXA: "bg-zinc-700 text-zinc-400",
  };

  return (
    <article className="grid gap-4 rounded-2xl border border-white/[0.07] bg-zinc-900 p-4 lg:grid-cols-[130px_1.4fr_1fr_1fr_auto] lg:items-center">
      <div>
        <p className="text-lg font-black text-white">
          {date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
          })}
        </p>
        <p className="flex items-center gap-1 text-sm text-zinc-400">
          <Clock3 size={14} />
          {date.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold text-orange-400">
          {order.number}
        </p>
        <h3 className="truncate font-bold text-white">
          {order.title}
        </h3>
        <p className="truncate text-sm text-zinc-500">
          {order.project.client.name}
        </p>
      </div>
      <div>
        <p className="text-xs text-zinc-600">
          Projeto / local
        </p>
        <p className="truncate text-sm font-semibold text-zinc-300">
          {order.project.title}
        </p>
        <p className="truncate text-xs text-zinc-600">
          {order.project.client.city ??
            order.project.client.address ??
            "Não informado"}
        </p>
      </div>
      <div className="space-y-1">
        <p className="flex items-center gap-1 text-sm text-zinc-300">
          <UserRound size={13} />
          {order.responsible ?? "Não definido"}
        </p>
        <p className="flex items-center gap-1 text-xs text-zinc-500">
          <UsersRound size={13} />
          {order.team ?? "Sem equipe"}
        </p>
        <span
          className={`inline-flex rounded-full px-2 py-1 text-[10px] font-bold ${
            colors[order.priority] ?? colors.NORMAL
          }`}
        >
          {order.priority.replaceAll("_", " ")}
        </span>
      </div>
      <div className="flex flex-wrap gap-2 lg:justify-end">
        <Link
          href={`/os/${order.id}`}
          className="rounded-lg bg-orange-500 px-3 py-2 text-xs font-bold text-white"
        >
          Abrir
        </Link>
        <Link
          href={`/os/${order.id}`}
          className="rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-zinc-300"
        >
          Editar
        </Link>
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center gap-1 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300 transition hover:bg-red-500/20"
          aria-label={`Remover ${order.number} da agenda`}
        >
          <Trash2 size={14} />
          Excluir
        </button>
      </div>
    </article>
  );
}
