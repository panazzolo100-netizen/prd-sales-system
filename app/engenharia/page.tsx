import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AppLayout } from "@/components/layout/AppLayout";

const COMPANY_ID = "default-company";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

function statusLabel(status: string) {
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

async function createProject(formData: FormData) {
  "use server";

  const title = String(
    formData.get("title") ?? ""
  ).trim();

  const clientId = String(
    formData.get("clientId") ?? ""
  ).trim();

  const description = String(
    formData.get("description") ?? ""
  ).trim();

  if (!title) {
    throw new Error(
      "Informe o título do projeto."
    );
  }

  if (!clientId) {
    throw new Error(
      "Selecione um cliente."
    );
  }

  const client =
    await prisma.client.findFirst({
      where: {
        id: clientId,
        companyId: COMPANY_ID,
      },
    });

  if (!client) {
    throw new Error(
      "Cliente não encontrado."
    );
  }

  const project =
    await prisma.project.create({
      data: {
        title,
        status: "NOVO",
        description:
          description || null,
        companyId: COMPANY_ID,
        clientId,
      },
    });

  await prisma.financial.create({
    data: {
      saleValue: 0,
      costValue: 0,
      receivedValue: 0,
      status: "PENDENTE",
      companyId: COMPANY_ID,
      projectId: project.id,
    },
  });

  revalidatePath("/engenharia");
  revalidatePath("/financeiro");

  redirect(
    `/engenharia/${project.id}`
  );
}

export default async function Engenharia() {
  const [projetos, clientes] =
    await Promise.all([
      prisma.project.findMany({
        where: {
          companyId: COMPANY_ID,
        },

        include: {
          client: {
            select: {
              id: true,
              name: true,
              phone: true,
              city: true,
              state: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.client.findMany({
        where: {
          companyId: COMPANY_ID,
        },

        orderBy: {
          name: "asc",
        },

        select: {
          id: true,
          name: true,
        },
      }),
    ]);

  return (
    <AppLayout>
      <main className="space-y-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-white">
              Engenharia
            </h1>

            <p className="mt-2 text-zinc-400">
              Projetos, homologações, ARTs e documentos técnicos.
            </p>
          </div>

          <details className="group relative">
            <summary className="cursor-pointer list-none rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600">
              Novo Projeto
            </summary>

            <div className="absolute right-0 z-20 mt-3 w-[430px] rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
              <h2 className="text-xl font-bold text-white">
                Criar projeto
              </h2>

              <form
                action={createProject}
                className="mt-5 space-y-4"
              >
                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-400">
                    Título
                  </label>

                  <input
                    name="title"
                    required
                    placeholder="Ex.: Projeto Solar - Cliente"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-400">
                    Cliente
                  </label>

                  <select
                    name="clientId"
                    required
                    defaultValue=""
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-orange-500"
                  >
                    <option
                      value=""
                      disabled
                    >
                      Selecione um cliente
                    </option>

                    {clientes.map(
                      (cliente) => (
                        <option
                          key={cliente.id}
                          value={cliente.id}
                        >
                          {cliente.name}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-zinc-400">
                    Descrição
                  </label>

                  <textarea
                    name="description"
                    rows={4}
                    placeholder="Descrição inicial do projeto"
                    className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-white outline-none focus:border-orange-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={
                    clientes.length === 0
                  }
                  className="w-full rounded-xl bg-orange-500 px-5 py-3 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Criar Projeto
                </button>

                {clientes.length === 0 && (
                  <p className="text-sm text-red-400">
                    Cadastre um cliente antes de criar o projeto.
                  </p>
                )}
              </form>
            </div>
          </details>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projetos.map((projeto) => (
            <div
              key={projeto.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-orange-500"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {projeto.title}
                  </h2>

                  <p className="mt-1 text-zinc-400">
                    {projeto.client.name}
                  </p>
                </div>

                <span className="rounded-full bg-orange-500/15 px-3 py-1 text-xs font-semibold text-orange-500">
                  {statusLabel(
                    projeto.status
                  )}
                </span>
              </div>

              {projeto.description && (
                <p className="mt-5 line-clamp-3 text-sm leading-6 text-zinc-300">
                  {projeto.description}
                </p>
              )}

              <div className="mt-6 space-y-3 border-t border-zinc-800 pt-5 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-zinc-500">
                    Local
                  </span>

                  <span className="text-right text-zinc-200">
                    {projeto.client.city
                      ? `${projeto.client.city}${
                          projeto.client.state
                            ? ` - ${projeto.client.state}`
                            : ""
                        }`
                      : "-"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-zinc-500">
                    Telefone
                  </span>

                  <span className="text-zinc-200">
                    {projeto.client.phone ??
                      "-"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-zinc-500">
                    Criado em
                  </span>

                  <span className="text-zinc-200">
                    {formatDate(
                      projeto.createdAt
                    )}
                  </span>
                </div>
              </div>

              <Link
                href={`/engenharia/${projeto.id}`}
                className="mt-6 block w-full rounded-xl bg-zinc-800 px-4 py-3 text-center font-semibold text-white transition hover:bg-orange-500"
              >
                Abrir Projeto
              </Link>
            </div>
          ))}
        </div>

        {projetos.length === 0 && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-10 text-center">
            <h2 className="text-lg font-semibold text-white">
              Nenhum projeto cadastrado
            </h2>

            <p className="mt-2 text-zinc-500">
              Clique em Novo Projeto para cadastrar.
            </p>
          </div>
        )}
      </main>
    </AppLayout>
  );
}