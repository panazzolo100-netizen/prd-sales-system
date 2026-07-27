import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { EngineeringKanban } from "@/components/engineering/EngineeringKanban";
import { createEngineeringProject, getEngineeringOverview } from "@/services/engineering.service";
import { ENGINEERING_SERVICE_TYPES } from "@/lib/engineering-service-types";

async function createProject(formData: FormData) {
  "use server";
  const project = await createEngineeringProject({
    title: String(formData.get("title") ?? ""),
    clientId: String(formData.get("clientId") ?? ""),
    serviceType: String(formData.get("serviceType") ?? "USINA_SOLAR"),
    description: String(formData.get("description") ?? ""),
  });
  revalidatePath("/engenharia");
  redirect(`/engenharia/${project.id}`);
}

export default async function Engenharia() {
  const [projects, clients] = await getEngineeringOverview();
  const action = <details className="group relative">
    <summary className="cursor-pointer list-none rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600">Novo projeto</summary>
    <form action={createProject} className="fixed inset-x-4 top-24 z-40 space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-2xl sm:absolute sm:inset-auto sm:right-0 sm:top-auto sm:mt-3 sm:w-[430px]">
      <h2 className="text-lg font-bold text-white">Criar projeto de engenharia</h2>
      <select name="serviceType" className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-white">{ENGINEERING_SERVICE_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
      <input name="title" required placeholder="Título do projeto" className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-white" />
      <select name="clientId" required defaultValue="" className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-white"><option value="" disabled>Selecione o cliente</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select>
      <textarea name="description" rows={3} placeholder="Descrição" className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-white" />
      <button className="w-full rounded-xl bg-orange-500 p-3 font-bold text-white">Criar projeto</button>
    </form>
  </details>;
  return <AppLayout><EngineeringKanban projects={projects} action={action} /></AppLayout>;
}
