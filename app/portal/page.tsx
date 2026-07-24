import Link from "next/link";
import { CalendarDays, CheckCircle2, ClipboardList, FileSignature } from "lucide-react";

import { PortalLayout } from "@/components/portal/PortalLayout";
import { listMyServiceOrders } from "@/services/client-portal.service";
import { getCurrentUserAccess } from "@/services/auth.service";

function formatDate(date: Date | null) {
  return date ? new Intl.DateTimeFormat("pt-BR").format(date) : "Não agendada";
}

export default async function ClientPortalPage() {
  const [orders, user] = await Promise.all([
    listMyServiceOrders(),
    getCurrentUserAccess(),
  ]);

  return (
    <PortalLayout clientName={user.name}>
      <section>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-500">Portal do cliente</p>
        <h1 className="mt-2 text-3xl font-black">Minhas Ordens de Serviço</h1>
        <p className="mt-2 text-zinc-400">Acompanhe a execução e assine suas próprias ordens de serviço.</p>
      </section>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {orders.map((order) => (
          <article key={order.id} className="rounded-2xl border border-white/[0.08] bg-zinc-900 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-orange-400">{order.number}</p>
                <h2 className="mt-1 text-xl font-bold">{order.title}</h2>
                <p className="mt-1 text-sm text-zinc-500">{order.project.title}</p>
              </div>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300">{order.status.replaceAll("_", " ")}</span>
            </div>
            <div className="mt-5 flex flex-wrap gap-4 text-sm text-zinc-400">
              <span className="inline-flex items-center gap-2"><CalendarDays size={16} />{formatDate(order.scheduledDate)}</span>
              <span className="inline-flex items-center gap-2">
                {order.customerSignature ? <CheckCircle2 size={16} className="text-emerald-400" /> : <FileSignature size={16} />}
                {order.customerSignature ? "Assinada" : "Assinatura pendente"}
              </span>
            </div>
            <Link href={`/portal/os/${order.id}`} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold hover:bg-orange-600">
              <ClipboardList size={17} /> Abrir ordem
            </Link>
          </article>
        ))}
      </div>
      {orders.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-white/10 p-10 text-center text-zinc-500">
          Nenhuma Ordem de Serviço vinculada ao seu cliente.
        </div>
      )}
    </PortalLayout>
  );
}
