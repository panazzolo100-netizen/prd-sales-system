import { EngineeringProjectDocuments } from "@/components/engineering/EngineeringProjectDocuments";
import { EngineeringTechnicalDetails } from "@/components/engineering/EngineeringTechnicalDetails";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { AppLayout } from "@/components/layout/AppLayout";
import { getEngineeringProjectDetails } from "@/services/engineering.service";
import { updateCompanyProject } from "@/services/projects.service";
import { createServiceOrderData } from "@/services/service-orders.service";
import { getCurrentCompanyId } from "@/lib/auth/current-user";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(value: Date | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR").format(
    value
  );
}

async function updateProject(
  formData: FormData
) {
  "use server";

  const projectId = String(
    formData.get("projectId") ?? ""
  );

  const status = String(
    formData.get("status") ?? "NOVO"
  );

  const description = String(
    formData.get("description") ?? ""
  ).trim();

  if (!projectId) {
    throw new Error(
      "Projeto não identificado."
    );
  }

  await updateCompanyProject(projectId, { status, description: description || null });

  revalidatePath("/engenharia");
  revalidatePath(
    `/engenharia/${projectId}`
  );

  redirect(
    `/engenharia/${projectId}`
  );
}

async function createServiceOrder(
  formData: FormData
) {
  "use server";

  const projectId = String(
    formData.get("projectId") ?? ""
  );

  if (!projectId) {
    throw new Error(
      "Projeto não identificado."
    );
  }

  const project = await getEngineeringProjectDetails(projectId);

  if (!project) {
    throw new Error(
      "Projeto não encontrado."
    );
  }

  if (project.serviceOrder) {
    redirect("/os");
  }

  await createServiceOrderData({
    projectId: project.id,
    companyId: await getCurrentCompanyId(),
    title: `Execução - ${project.title}`,
    services: project.description ?? "Serviços relacionados ao projeto.",
  });

  revalidatePath("/os");
  revalidatePath("/engenharia");
  revalidatePath(
    `/engenharia/${projectId}`
  );

  redirect("/os");
}

export default async function ProjetoPage({
  params,
}: Props) {
  const { id } = await params;

  const projeto = await getEngineeringProjectDetails(id);

  if (!projeto) {
    notFound();
  }

  const proposal =
    projeto.client.lead?.proposal;

  const serviceOrder =
    projeto.serviceOrder;

  const saleValue =
    projeto.financial?.saleValue ??
    proposal?.amount ??
    0;

  const receivedValue =
    projeto.financial?.receivedValue ??
    0;

  return (
    <AppLayout>
      <main className="space-y-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-white">
              {projeto.title}
            </h1>

            <p className="mt-2 text-zinc-400">
              {projeto.client.name}
            </p>
          </div>

          <Link
            href="/engenharia"
            className="rounded-xl border border-zinc-700 px-5 py-3 font-semibold text-zinc-300 transition hover:border-orange-500 hover:text-white"
          >
            Voltar
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <Card
            title="Status"
            value={statusLabel(
              projeto.status
            )}
          />

          <Card
            title="Cidade"
            value={
              projeto.client.city
                ? `${projeto.client.city}${
                    projeto.client.state
                      ? ` - ${projeto.client.state}`
                      : ""
                  }`
                : "-"
            }
          />

          <Card
            title="Telefone"
            value={
              projeto.client.phone ?? "-"
            }
          />

          <Card
            title="Venda"
            value={formatCurrency(
              saleValue
            )}
          />
        </div>

        <form
          action={updateProject}
          className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
        >
          <input
            type="hidden"
            name="projectId"
            value={projeto.id}
          />

          <h2 className="text-2xl font-bold text-white">
            Controle do Projeto
          </h2>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-400">
                Status
              </label>

              <select
                name="status"
                defaultValue={projeto.status}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-orange-500"
              >
                <option value="NOVO">
                  Novo
                </option>

                <option value="EM_ANDAMENTO">
                  Em andamento
                </option>

                <option value="AGUARDANDO">
                  Aguardando
                </option>

                <option value="CONCLUIDO">
                  Concluído
                </option>

                <option value="CANCELADO">
                  Cancelado
                </option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-xl bg-orange-500 px-6 py-3 font-bold text-white transition hover:bg-orange-600"
              >
                Salvar Projeto
              </button>
            </div>
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm font-semibold text-zinc-400">
              Descrição e observações
            </label>

            <textarea
              name="description"
              defaultValue={
                projeto.description ?? ""
              }
              rows={5}
              placeholder="Descreva o andamento, pendências e observações do projeto."
              className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-white outline-none focus:border-orange-500"
            />
          </div>
        </form>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-5 text-2xl font-bold text-white">
            Dados do Cliente
          </h2>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <Card
              title="Cliente"
              value={projeto.client.name}
            />

            <Card
              title="E-mail"
              value={
                projeto.client.email ?? "-"
              }
            />

            <Card
              title="Telefone"
              value={
                projeto.client.phone ?? "-"
              }
            />

            <Card
              title="Documento"
              value={
                projeto.client.document ??
                "-"
              }
            />
          </div>
        </section>

        <EngineeringTechnicalDetails
          serviceType={projeto.resolvedServiceType}
          details={projeto.serviceDetails}
        />

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-5 text-2xl font-bold text-white">
            Financeiro
          </h2>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <Card
              title="Valor da venda"
              value={formatCurrency(
                saleValue
              )}
            />

            <Card
              title="Valor recebido"
              value={formatCurrency(
                receivedValue
              )}
            />

            <Card
              title="Valor pendente"
              value={formatCurrency(
                saleValue - receivedValue
              )}
            />

            <Card
              title="Custos"
              value={formatCurrency(
                projeto.financial
                  ?.costValue ?? 0
              )}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Ordem de Serviço
              </h2>

              <p className="mt-2 text-zinc-400">
                Instalação, equipe e execução dos serviços.
              </p>
            </div>

            {serviceOrder && (
              <span className="rounded-full bg-orange-500/15 px-4 py-2 text-sm font-semibold text-orange-500">
                {serviceOrderStatusLabel(
                  serviceOrder.status
                )}
              </span>
            )}
          </div>

          {serviceOrder ? (
            <>
              <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                <Card
                  title="Número"
                  value={
                    serviceOrder.number
                  }
                />

                <Card
                  title="Responsável"
                  value={
                    serviceOrder.responsible ??
                    "-"
                  }
                />

                <Card
                  title="Data agendada"
                  value={formatDate(
                    serviceOrder.scheduledDate
                  )}
                />

                <Card
                  title="Equipe"
                  value={
                    serviceOrder.team ?? "-"
                  }
                />
              </div>

              {serviceOrder.services && (
                <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950 p-5">
                  <p className="text-sm text-zinc-500">
                    Serviços
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-zinc-200">
                    {serviceOrder.services}
                  </p>
                </div>
              )}

              <Link
  href={`/os/${serviceOrder.id}`}
                className="mt-6 inline-flex rounded-xl bg-orange-500 px-6 py-3 font-bold text-white transition hover:bg-orange-600"
              >
                Abrir Ordem de Serviço
              </Link>
            </>
          ) : (
            <div className="mt-6 rounded-xl border border-dashed border-zinc-700 bg-zinc-950 p-8 text-center">
              <h3 className="text-lg font-bold text-white">
                Nenhuma Ordem de Serviço criada
              </h3>

              <p className="mt-2 text-zinc-500">
                Crie a OS para iniciar o controle da execução.
              </p>

              <form
                action={createServiceOrder}
                className="mt-5"
              >
                <input
                  type="hidden"
                  name="projectId"
                  value={projeto.id}
                />

                <button
                  type="submit"
                  className="rounded-xl bg-orange-500 px-6 py-3 font-bold text-white transition hover:bg-orange-600"
                >
                  Criar Ordem de Serviço
                </button>
              </form>
            </div>
          )}
        </section>
        <EngineeringProjectDocuments
          projectId={projeto.id}
          initialDocuments={projeto.documents}
        />
      </main>
    </AppLayout>
  );
}

function statusLabel(
  status: string
) {
  switch (status) {
    case "NOVO":
      return "Novo";

    case "EM_ANDAMENTO":
      return "Em andamento";

    case "AGUARDANDO":
      return "Aguardando";

    case "CONCLUIDO":
      return "Concluído";

    case "CANCELADO":
      return "Cancelado";

    default:
      return status;
  }
}

function serviceOrderStatusLabel(
  status: string
) {
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

function Card({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
      <p className="text-sm text-zinc-500">
        {title}
      </p>

      <h3 className="mt-2 break-words text-xl font-bold text-white">
        {value}
      </h3>
    </div>
  );
}
