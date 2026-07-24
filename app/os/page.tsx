import { revalidatePath } from "next/cache";
import { AppLayout } from "@/components/layout/AppLayout";
import { ServiceOrdersKanban } from "@/components/os/ServiceOrdersKanban";
import { getCurrentCompanyId } from "@/lib/auth/current-user";
import { createServiceOrderData, listAvailableProjectsForServiceOrder, listServiceOrders } from "@/services/service-orders.service";

async function createOrder(formData: FormData) {
  "use server";
  const companyId = await getCurrentCompanyId();
  const scheduled = String(formData.get("scheduledDate") ?? "");
  await createServiceOrderData({
    companyId,
    projectId: String(formData.get("projectId") ?? ""),
    title: String(formData.get("title") ?? ""),
    responsible: String(formData.get("responsible") ?? ""),
    scheduledDate: scheduled ? new Date(`${scheduled}T12:00:00`) : null,
    services: String(formData.get("services") ?? ""),
  });
  revalidatePath("/os");
}

export default async function ServiceOrdersPage() {
  const companyId = await getCurrentCompanyId();
  const [orders, projects] = await Promise.all([listServiceOrders(companyId), listAvailableProjectsForServiceOrder(companyId)]);
  const action = <details className="group relative">
    <summary className="cursor-pointer list-none rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600">Nova OS</summary>
    <form action={createOrder} className="fixed inset-x-4 top-24 z-40 space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-2xl sm:absolute sm:inset-auto sm:right-0 sm:top-auto sm:mt-3 sm:w-[430px]">
      <h2 className="text-lg font-bold text-white">Criar ordem de serviço</h2>
      <select name="projectId" required defaultValue="" className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-white"><option value="" disabled>Selecione o projeto</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.title} — {project.client.name}</option>)}</select>
      <input name="title" required placeholder="Título da OS" className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-white" />
      <input name="responsible" placeholder="Responsável" className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-white" />
      <input name="scheduledDate" type="date" className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-white" />
      <textarea name="services" rows={3} placeholder="Serviços" className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-white" />
      <button className="w-full rounded-xl bg-orange-500 p-3 font-bold text-white">Criar OS</button>
    </form>
  </details>;
  return <AppLayout><ServiceOrdersKanban orders={orders} action={action} /></AppLayout>;
}
