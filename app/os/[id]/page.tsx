import { SignaturePad } from "@/components/os/SignaturePad";
import { updateServiceOrderSignaturesData } from "@/services/service-orders.service";
import {
  updateServiceOrderData,
  updateServiceOrderChecklistData,
} from "@/services/service-orders.service";
import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";

import { AppLayout } from "@/components/layout/AppLayout";
import { ChecklistItem } from "@/components/os/ChecklistItem";
import { ChecklistSaveStatus } from "@/components/os/ChecklistSaveStatus";
import { PhotoUpload } from "@/components/os/PhotoUpload";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

function formatDate(date: Date | null) {
  if (!date) return "-";

  return new Intl.DateTimeFormat("pt-BR").format(date);
}

function statusLabel(status: string) {
  switch (status) {
    case "ABERTA":
      return "Aberta";

    case "AGENDADA":
      return "Agendada";

    case "EM_ANDAMENTO":
      return "Em andamento";

    case "CONCLUIDA":
      return "Concluída";

    case "CANCELADA":
      return "Cancelada";

    default:
      return status;
  }
}

function statusClass(status: string) {
  switch (status) {
    case "CONCLUIDA":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";

    case "EM_ANDAMENTO":
      return "border-sky-500/30 bg-sky-500/10 text-sky-400";

    case "CANCELADA":
      return "border-red-500/30 bg-red-500/10 text-red-400";

    default:
      return "border-orange-500/30 bg-orange-500/10 text-orange-400";
  }
}

async function updateServiceOrder(formData: FormData) {
  "use server";

  const id = String(formData.get("id") ?? "").trim();
  const status = String(
    formData.get("status") ?? "ABERTA"
  );
  const responsible = String(
    formData.get("responsible") ?? ""
  ).trim();
  const team = String(
    formData.get("team") ?? ""
  ).trim();
  const scheduledDate = String(
    formData.get("scheduledDate") ?? ""
  ).trim();
  const services = String(
    formData.get("services") ?? ""
  ).trim();
  const materials = String(
    formData.get("materials") ?? ""
  ).trim();
  const notes = String(
    formData.get("notes") ?? ""
  ).trim();

  if (!id) {
    throw new Error("OS não identificada.");
  }

  await updateServiceOrderData({
  id,
  status,
  responsible,
  team,
  scheduledDate: scheduledDate
    ? new Date(`${scheduledDate}T12:00:00`)
    : null,
  services,
  materials,
  notes,
});

  revalidatePath("/os");
  revalidatePath(`/os/${id}`);
  revalidatePath("/engenharia");
}

async function updateChecklist(formData: FormData) {
  "use server";

  const id = String(
    formData.get("id") ?? ""
  ).trim();

  if (!id) {
    throw new Error("OS não identificada.");
  }

  const checklist = {
    checklistArt:
      formData.get("checklistArt") === "on",

    checklistProjectApproved:
      formData.get(
        "checklistProjectApproved"
      ) === "on",

    checklistMaterialsSeparated:
      formData.get(
        "checklistMaterialsSeparated"
      ) === "on",

    checklistStructureInstalled:
      formData.get(
        "checklistStructureInstalled"
      ) === "on",

    checklistModulesInstalled:
      formData.get(
        "checklistModulesInstalled"
      ) === "on",

    checklistInverterInstalled:
      formData.get(
        "checklistInverterInstalled"
      ) === "on",

    checklistDcCabling:
      formData.get("checklistDcCabling") ===
      "on",

    checklistAcCabling:
      formData.get("checklistAcCabling") ===
      "on",

    checklistCommissioning:
      formData.get(
        "checklistCommissioning"
      ) === "on",

    checklistCustomerTraining:
      formData.get(
        "checklistCustomerTraining"
      ) === "on",

    checklistDelivered:
      formData.get("checklistDelivered") ===
      "on",
  };

 await updateServiceOrderChecklistData(
  id,
  checklist
);

  revalidatePath("/os");
  revalidatePath(`/os/${id}`);
  revalidatePath("/engenharia");
}

export default async function ServiceOrderPage({
  params,
}: Props) {
  const { id } = await params;

  const ordem =
    await prisma.serviceOrder.findUnique({
      where: {
        id,
      },

      include: {
  project: {
    include: {
      client: true,
    },
  },

  photos: {
    orderBy: {
      createdAt: "desc",
    },
  },

  timeline: {
    orderBy: {
      createdAt: "desc",
    },
  },
},
    });

  if (!ordem) {
    notFound();
  }

  const checklistItems = [
    ordem.checklistArt,
    ordem.checklistProjectApproved,
    ordem.checklistMaterialsSeparated,
    ordem.checklistStructureInstalled,
    ordem.checklistModulesInstalled,
    ordem.checklistInverterInstalled,
    ordem.checklistDcCabling,
    ordem.checklistAcCabling,
    ordem.checklistCommissioning,
    ordem.checklistCustomerTraining,
    ordem.checklistDelivered,
  ];

  const completedItems =
    checklistItems.filter(Boolean).length;

  const progress = Math.round(
    (completedItems /
      checklistItems.length) *
      100
  );

  const photosBefore = ordem.photos.filter(
    (photo) => photo.category === "ANTES"
  );

  const photosDuring = ordem.photos.filter(
    (photo) => photo.category === "DURANTE"
  );

  const photosAfter = ordem.photos.filter(
    (photo) => photo.category === "DEPOIS"
  );

  return (
    <AppLayout>
      <main className="space-y-8">
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="font-semibold text-orange-500">
                  {ordem.number}
                </p>

                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(
                    ordem.status
                  )}`}
                >
                  {statusLabel(ordem.status)}
                </span>
              </div>

              <h1 className="mt-3 text-4xl font-bold text-white">
                {ordem.title}
              </h1>

              <p className="mt-2 text-zinc-400">
                {ordem.project.client.name}
              </p>
            </div>

            <Link
              href="/os"
              className="w-fit rounded-xl border border-zinc-700 px-5 py-3 font-semibold text-zinc-300 transition hover:border-orange-500 hover:text-white"
            >
              Voltar
            </Link>
          </div>

          <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <HeaderInfo
              label="Projeto"
              value={ordem.project.title}
            />

            <HeaderInfo
              label="Responsável"
              value={
                ordem.responsible ?? "-"
              }
            />

            <HeaderInfo
              label="Equipe"
              value={ordem.team ?? "-"}
            />

            <HeaderInfo
              label="Data agendada"
              value={formatDate(
                ordem.scheduledDate
              )}
            />

            <HeaderInfo
              label="Início"
              value={formatDate(
                ordem.startedDate
              )}
            />

            <HeaderInfo
              label="Conclusão"
              value={formatDate(
                ordem.completedDate
              )}
            />

            <HeaderInfo
              label="Telefone"
              value={
                ordem.project.client.phone ??
                "-"
              }
            />

            <HeaderInfo
              label="Local"
              value={
                ordem.project.client.city
                  ? `${ordem.project.client.city}${
                      ordem.project.client
                        .state
                        ? ` - ${ordem.project.client.state}`
                        : ""
                    }`
                  : "-"
              }
            />
          </div>

          <div className="mt-7">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">
                  Progresso da execução
                </p>

                <p className="mt-1 text-sm text-zinc-500">
                  {completedItems} de{" "}
                  {checklistItems.length} etapas
                  concluídas
                </p>
              </div>

              <span className="text-2xl font-bold text-orange-500">
                {progress}%
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-orange-500 transition-all"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
          </div>
        </section>

        <form
          action={updateServiceOrder}
          className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
        >
          <input
            type="hidden"
            name="id"
            value={ordem.id}
          />

          <div>
            <h2 className="text-2xl font-bold text-white">
              Dados da Ordem de Serviço
            </h2>

            <p className="mt-2 text-zinc-400">
              Informações da execução, equipe e
              programação.
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <Field label="Status">
              <select
                name="status"
                defaultValue={ordem.status}
                className={inputClass}
              >
                <option value="ABERTA">
                  Aberta
                </option>

                <option value="AGENDADA">
                  Agendada
                </option>

                <option value="EM_ANDAMENTO">
                  Em andamento
                </option>

                <option value="CONCLUIDA">
                  Concluída
                </option>

                <option value="CANCELADA">
                  Cancelada
                </option>
              </select>
            </Field>

            <Field label="Data agendada">
              <input
                name="scheduledDate"
                type="date"
                defaultValue={
                  ordem.scheduledDate
                    ? ordem.scheduledDate
                        .toISOString()
                        .slice(0, 10)
                    : ""
                }
                className={inputClass}
              />
            </Field>

            <Field label="Responsável">
              <input
                name="responsible"
                defaultValue={
                  ordem.responsible ?? ""
                }
                placeholder="Responsável pela execução"
                className={inputClass}
              />
            </Field>

            <Field label="Equipe">
              <input
                name="team"
                defaultValue={ordem.team ?? ""}
                placeholder="Nomes da equipe"
                className={inputClass}
              />
            </Field>
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-3">
            <Field label="Serviços">
              <textarea
                name="services"
                defaultValue={
                  ordem.services ?? ""
                }
                rows={6}
                className={textareaClass}
              />
            </Field>

            <Field label="Materiais">
              <textarea
                name="materials"
                defaultValue={
                  ordem.materials ?? ""
                }
                rows={6}
                className={textareaClass}
              />
            </Field>

            <Field label="Observações">
              <textarea
                name="notes"
                defaultValue={
                  ordem.notes ?? ""
                }
                rows={6}
                className={textareaClass}
              />
            </Field>
          </div>

          <button
            type="submit"
            className="mt-6 rounded-xl bg-orange-500 px-6 py-3 font-bold text-white transition hover:bg-orange-600"
          >
            Salvar Ordem de Serviço
          </button>
        </form>

        <form
          action={updateChecklist}
          className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
        >
          <input
            type="hidden"
            name="id"
            value={ordem.id}
          />

          <h2 className="text-2xl font-bold text-white">
            Checklist Técnico
          </h2>

          <p className="mt-2 text-zinc-400">
            Ao concluir todas as etapas, a OS e o
            projeto serão finalizados
            automaticamente.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <ChecklistItem
              name="checklistArt"
              label="ART emitida"
              checked={ordem.checklistArt}
            />

            <ChecklistItem
              name="checklistProjectApproved"
              label="Projeto aprovado"
              checked={
                ordem.checklistProjectApproved
              }
            />

            <ChecklistItem
              name="checklistMaterialsSeparated"
              label="Materiais separados"
              checked={
                ordem.checklistMaterialsSeparated
              }
            />

            <ChecklistItem
              name="checklistStructureInstalled"
              label="Estrutura instalada"
              checked={
                ordem.checklistStructureInstalled
              }
            />

            <ChecklistItem
              name="checklistModulesInstalled"
              label="Módulos instalados"
              checked={
                ordem.checklistModulesInstalled
              }
            />

            <ChecklistItem
              name="checklistInverterInstalled"
              label="Inversor instalado"
              checked={
                ordem.checklistInverterInstalled
              }
            />

            <ChecklistItem
              name="checklistDcCabling"
              label="Cabeamento CC concluído"
              checked={
                ordem.checklistDcCabling
              }
            />

            <ChecklistItem
              name="checklistAcCabling"
              label="Cabeamento CA concluído"
              checked={
                ordem.checklistAcCabling
              }
            />

            <ChecklistItem
              name="checklistCommissioning"
              label="Comissionamento concluído"
              checked={
                ordem.checklistCommissioning
              }
            />

            <ChecklistItem
              name="checklistCustomerTraining"
              label="Cliente treinado"
              checked={
                ordem.checklistCustomerTraining
              }
            />

            <ChecklistItem
              name="checklistDelivered"
              label="Entrega realizada"
              checked={
                ordem.checklistDelivered
              }
            />
          </div>

          <ChecklistSaveStatus />
        </form>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Fotos da Ordem de Serviço
            </h2>

            <p className="mt-2 text-zinc-400">
              Registre as condições antes, durante e
              depois da execução.
            </p>
          </div>

          <div className="mt-6 grid gap-5 xl:grid-cols-3">
            <PhotoUpload
              serviceOrderId={ordem.id}
              category="ANTES"
              title="Antes"
            />

            <PhotoUpload
              serviceOrderId={ordem.id}
              category="DURANTE"
              title="Durante"
            />

            <PhotoUpload
              serviceOrderId={ordem.id}
              category="DEPOIS"
              title="Depois"
            />
          </div>

          <div className="mt-8 space-y-8">
            <PhotoGallery
              title="Antes"
              photos={photosBefore}
            />

            <PhotoGallery
              title="Durante"
              photos={photosDuring}
            />

            <PhotoGallery
              title="Depois"
              photos={photosAfter}
            />
          </div>
        </section>
        <form
  action={async (formData) => {
    "use server";

    const id = String(formData.get("id"));

    await updateServiceOrderSignaturesData({
      id,
      customerName: String(formData.get("customerName") ?? ""),
      customerDocument: String(formData.get("customerDocument") ?? ""),
      customerSignature: String(formData.get("customerSignature") ?? ""),
      technicianName: String(formData.get("technicianName") ?? ""),
      technicianSignature: String(formData.get("technicianSignature") ?? ""),
    });

    revalidatePath(`/os/${id}`);
  }}
  className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
>
  <input
    type="hidden"
    name="id"
    value={ordem.id}
  />

  <h2 className="text-2xl font-bold text-white">
    Assinaturas
  </h2>

  <div className="mt-6 grid gap-5 md:grid-cols-2">
    <input
      name="customerName"
      defaultValue={ordem.customerName ?? ""}
      placeholder="Nome do cliente"
      className={inputClass}
    />

    <input
      name="customerDocument"
      defaultValue={ordem.customerDocument ?? ""}
      placeholder="CPF / CNPJ"
      className={inputClass}
    />

    <input
      name="technicianName"
      defaultValue={ordem.technicianName ?? ""}
      placeholder="Nome do técnico"
      className={inputClass}
    />
  </div>

  <div className="mt-6 grid gap-6 lg:grid-cols-2">
    <SignaturePad
      title="Assinatura do Cliente"
      name="customerSignature"
      defaultValue={ordem.customerSignature}
    />

    <SignaturePad
      title="Assinatura do Técnico"
      name="technicianSignature"
      defaultValue={ordem.technicianSignature}
    />
  </div>

  <button
    type="submit"
    className="mt-6 rounded-xl bg-orange-500 px-6 py-3 font-bold text-white hover:bg-orange-600"
  >
    Salvar Assinaturas
  </button>
</form>
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
  <div>
    <h2 className="text-2xl font-bold text-white">
      Timeline da Ordem de Serviço
    </h2>

    <p className="mt-2 text-zinc-400">
      Histórico automático das atividades realizadas.
    </p>
  </div>

  {ordem.timeline.length > 0 ? (
    <div className="mt-6 space-y-4">
      {ordem.timeline.map((event) => (
        <div
          key={event.id}
          className="relative border-l border-zinc-700 pl-6"
        >
          <span className="absolute -left-2 top-1 h-4 w-4 rounded-full border-4 border-zinc-900 bg-orange-500" />

          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="font-semibold text-white">
                {event.title}
              </h3>

              <span className="text-xs text-zinc-500">
                {new Intl.DateTimeFormat("pt-BR", {
                  dateStyle: "short",
                  timeStyle: "short",
                }).format(event.createdAt)}
              </span>
            </div>

            {event.description && (
              <p className="mt-2 text-sm text-zinc-400">
                {event.description}
              </p>
            )}

            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-orange-500">
              {event.type.replaceAll("_", " ")}
            </p>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <div className="mt-6 rounded-xl border border-dashed border-zinc-800 bg-zinc-950/50 p-8 text-center">
      <p className="text-zinc-500">
        Nenhum evento registrado nesta OS.
      </p>
    </div>
  )}
</section>
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
  <h2 className="text-2xl font-bold text-white">
    Timeline
  </h2>

  <div className="mt-6 space-y-4">
    {ordem.timeline.map((item) => (
      <div
        key={item.id}
        className="rounded-xl border border-zinc-800 bg-zinc-950 p-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white">
            {item.title}
          </h3>

          <span className="text-xs text-zinc-500">
            {new Intl.DateTimeFormat("pt-BR", {
              dateStyle: "short",
              timeStyle: "short",
            }).format(item.createdAt)}
          </span>
        </div>

        {item.description && (
          <p className="mt-2 text-zinc-400">
            {item.description}
          </p>
        )}

        <p className="mt-3 text-xs font-semibold uppercase text-orange-500">
          {item.type.replaceAll("_", " ")}
        </p>
      </div>
    ))}
  </div>
</section>
      </main>
    </AppLayout>
  );
}

const inputClass =
  "w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-orange-500";

const textareaClass =
  "w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-white outline-none focus:border-orange-500";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-zinc-400">
        {label}
      </label>

      {children}
    </div>
  );
}

function HeaderInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
      <p className="text-xs uppercase tracking-wide text-zinc-500">
        {label}
      </p>

      <p className="mt-2 break-words font-semibold text-zinc-200">
        {value}
      </p>
    </div>
  );
}

type PhotoGalleryPhoto = {
  id: string;
  name: string;
  url: string;
  notes: string | null;
  createdAt: Date;
};

function PhotoGallery({
  title,
  photos,
}: {
  title: string;
  photos: PhotoGalleryPhoto[];
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">
          {title}
        </h3>

        <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-semibold text-zinc-300">
          {photos.length}{" "}
          {photos.length === 1
            ? "foto"
            : "fotos"}
        </span>
      </div>

      {photos.length > 0 ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {photos.map((photo) => (
            <article
              key={photo.id}
              className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950"
            >
              <a
                href={photo.url}
                target="_blank"
                rel="noreferrer"
                className="block"
              >
                <img
                  src={photo.url}
                  alt={photo.name}
                  className="h-52 w-full object-cover transition hover:scale-105"
                />
              </a>

              <div className="p-4">
                <p className="truncate font-semibold text-white">
                  {photo.name}
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  {new Intl.DateTimeFormat(
                    "pt-BR",
                    {
                      dateStyle: "short",
                      timeStyle: "short",
                    }
                  ).format(photo.createdAt)}
                </p>

                {photo.notes && (
                  <p className="mt-3 whitespace-pre-wrap text-sm text-zinc-400">
                    {photo.notes}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-zinc-800 bg-zinc-950/50 p-8 text-center">
          <p className="text-zinc-500">
            Nenhuma foto adicionada nesta etapa.
          </p>
        </div>
      )}
    </div>
  );
}