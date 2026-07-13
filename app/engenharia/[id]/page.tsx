import { DocumentUpload } from "@/components/projects/DocumentUpload";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { AppLayout } from "@/components/layout/AppLayout";
import { prisma } from "@/lib/prisma";

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

  await prisma.project.update({
    where: {
      id: projectId,
    },

    data: {
      status,
      description:
        description || null,
    },
  });

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

  const project =
    await prisma.project.findUnique({
      where: {
        id: projectId,
      },

      include: {
        client: true,
        serviceOrder: true,
        documents: {
  orderBy: {
    createdAt: "desc",
  },
},
      },
    });

  if (!project) {
    throw new Error(
      "Projeto não encontrado."
    );
  }

  if (project.serviceOrder) {
    redirect("/os");
  }

  await prisma.serviceOrder.create({
    data: {
      number: `OS-${Date.now()}`,

      title:
        `Execução - ${project.title}`,

      status: "ABERTA",

      services:
        project.description ??
        "Serviços relacionados ao projeto.",

      companyId:
        project.companyId,

      projectId:
        project.id,
    },
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

  const projeto =
  await prisma.project.findUnique({
    where: {
      id,
    },

    include: {
      client: {
        include: {
          lead: {
            include: {
              engineering: true,
              proposal: true,
            },
          },
        },
      },

      financial: true,

      serviceOrder: true,

      documents: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!projeto) {
    notFound();
  }

  const engineering =
    projeto.client.lead?.engineering;

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

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="mb-5 text-2xl font-bold text-white">
            Dados Técnicos
          </h2>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <Card
              title="Potência instalada"
              value={`${
                engineering
                  ?.installedPower ?? "-"
              } kWp`}
            />

            <Card
              title="Quantidade de módulos"
              value={String(
                engineering?.modules ?? "-"
              )}
            />

            <Card
              title="Potência do módulo"
              value={`${
                engineering?.modulePower ??
                "-"
              } W`}
            />

            <Card
              title="Marca dos módulos"
              value={
                engineering?.moduleBrand ??
                "-"
              }
            />

            <Card
              title="Inversor"
              value={
                engineering?.inverter ?? "-"
              }
            />

            <Card
              title="Tipo de sistema"
              value={
                engineering?.systemType ??
                "-"
              }
            />

            <Card
              title="Distribuidora"
              value={
                engineering?.distributor ??
                "-"
              }
            />

            <Card
              title="Unidade consumidora"
              value={
                engineering
                  ?.consumerUnit ?? "-"
              }
            />

            <Card
              title="Tensão"
              value={
                engineering?.voltage ?? "-"
              }
            />

            <Card
              title="Fase"
              value={
                engineering?.phase ?? "-"
              }
            />

            <Card
              title="Tipo de telhado"
              value={
                engineering?.roofType ?? "-"
              }
            />

            <Card
              title="Área do telhado"
              value={`${
                engineering?.roofArea ?? "-"
              } m²`}
            />
          </div>

          {engineering?.notes && (
            <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950 p-5">
              <p className="text-sm text-zinc-500">
                Observações técnicas
              </p>

              <p className="mt-2 whitespace-pre-wrap text-zinc-200">
                {engineering.notes}
              </p>
            </div>
          )}
        </section>

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
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
  <h2 className="text-2xl font-bold text-white">
    Documentos do Projeto
  </h2>

  <p className="mt-2 text-zinc-400">
    Contrato, ART, Projeto, Memorial, NF, Garantias e Manuais.
  </p>

  <div className="mt-6 grid gap-5 xl:grid-cols-4">
    <DocumentUpload
      projectId={projeto.id}
      type="CONTRATO"
      title="Contrato"
    />

    <DocumentUpload
      projectId={projeto.id}
      type="ART"
      title="ART"
    />

    <DocumentUpload
      projectId={projeto.id}
      type="PROJETO"
      title="Projeto"
    />

    <DocumentUpload
      projectId={projeto.id}
      type="MEMORIAL"
      title="Memorial"
    />

    <DocumentUpload
      projectId={projeto.id}
      type="NOTA_FISCAL"
      title="Nota Fiscal"
    />

    <DocumentUpload
      projectId={projeto.id}
      type="GARANTIA"
      title="Garantia"
    />

    <DocumentUpload
      projectId={projeto.id}
      type="MANUAL"
      title="Manual"
    />

    <DocumentUpload
      projectId={projeto.id}
      type="OUTRO"
      title="Outros"
    />
  </div>

  {projeto.documents.length > 0 && (
    <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {projeto.documents.map((doc) => (
        <a
          key={doc.id}
          href={doc.url}
          target="_blank"
          rel="noreferrer"
          className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 transition hover:border-orange-500"
        >
          <p className="font-semibold text-white">
            {doc.name}
          </p>

          <p className="mt-2 text-sm text-orange-500">
            {doc.type.replaceAll("_", " ")}
          </p>

          <p className="mt-2 text-xs text-zinc-500">
            {new Intl.DateTimeFormat("pt-BR").format(
              doc.createdAt
            )}
          </p>
        </a>
      ))}
    </div>
  )}
</section>
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