import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";

import { SignaturePad } from "@/components/os/SignaturePad";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { getMyServiceOrder } from "@/services/client-portal.service";
import { saveServiceOrderSignatures } from "@/services/service-order-signatures.service";
import { getCurrentUserAccess } from "@/services/auth.service";

type Props = { params: Promise<{ id: string }> };

function formatDate(date: Date | null) {
  return date ? new Intl.DateTimeFormat("pt-BR").format(date) : "-";
}

export default async function ClientServiceOrderPage({ params }: Props) {
  const { id } = await params;
  const [order, user] = await Promise.all([
    getMyServiceOrder(id),
    getCurrentUserAccess(),
  ]);
  if (!order) notFound();

  async function sign(formData: FormData) {
    "use server";
    const orderId = String(formData.get("id") ?? "");
    await saveServiceOrderSignatures({
      id: orderId,
      customerName: String(formData.get("customerName") ?? ""),
      customerDocument: String(formData.get("customerDocument") ?? ""),
      customerSignature:
        formData.get("customerSignatureAction") === "unchanged"
          ? undefined
          : formData.get("customerSignatureAction") === "clear"
            ? null
            : String(formData.get("customerSignature") ?? ""),
    });
    revalidatePath("/portal");
    revalidatePath(`/portal/os/${orderId}`);
  }

  const checklist = [
    order.checklistArt, order.checklistProjectApproved,
    order.checklistMaterialsSeparated, order.checklistStructureInstalled,
    order.checklistModulesInstalled, order.checklistInverterInstalled,
    order.checklistDcCabling, order.checklistAcCabling,
    order.checklistCommissioning, order.checklistCustomerTraining,
    order.checklistDelivered,
  ];
  const completed = checklist.filter(Boolean).length;

  return (
    <PortalLayout clientName={user.name}>
      <section className="rounded-2xl border border-white/[0.08] bg-zinc-900 p-6">
        <p className="font-bold text-orange-400">{order.number}</p>
        <h1 className="mt-2 text-3xl font-black">{order.title}</h1>
        <p className="mt-2 text-zinc-400">{order.project.title}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Info label="Status" value={order.status.replaceAll("_", " ")} />
          <Info label="Data agendada" value={formatDate(order.scheduledDate)} />
          <Info label="Checklist" value={`${completed}/${checklist.length}`} />
        </div>
        {order.services && (
          <div className="mt-6 rounded-xl bg-black/20 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">Serviços previstos</p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-300">{order.services}</p>
          </div>
        )}
      </section>

      <form action={sign} className="mt-6 rounded-2xl border border-white/[0.08] bg-zinc-900 p-6">
        <input type="hidden" name="id" value={order.id} />
        <h2 className="text-2xl font-bold">Assinatura do cliente</h2>
        <p className="mt-2 text-sm text-zinc-400">A assinatura é permitida apenas para esta ordem vinculada ao seu cadastro.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <input name="customerName" defaultValue={order.customerName ?? user.name} placeholder="Nome completo" className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3" required />
          <input name="customerDocument" defaultValue={order.customerDocument ?? ""} placeholder="CPF / CNPJ" className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3" />
        </div>
        <div className="mt-5">
          <SignaturePad title="Assine abaixo" name="customerSignature" defaultValue={order.customerSignature ? `/api/portal/os/signature?id=${encodeURIComponent(order.id)}` : null} />
        </div>
        <button disabled={order.status === "CANCELADA"} className="mt-5 rounded-xl bg-orange-500 px-5 py-3 font-bold hover:bg-orange-600 disabled:opacity-50">
          Salvar assinatura
        </button>
      </form>
    </PortalLayout>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-white/[0.07] bg-black/20 p-4"><p className="text-xs uppercase text-zinc-500">{label}</p><p className="mt-2 font-bold">{value}</p></div>;
}
