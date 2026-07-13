import { AppLayout } from "@/components/layout/AppLayout";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

function formatDate(value: Date | null) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("pt-BR").format(
    value
  );
}

export default async function AgendaPage() {
  const ordens =
    await prisma.serviceOrder.findMany({
      where: {
        scheduledDate: {
          not: null,
        },
      },

      include: {
        project: {
          include: {
            client: true,
          },
        },
      },

      orderBy: {
        scheduledDate: "asc",
      },
    });

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white">
          Agenda
        </h1>

        <p className="mt-2 text-zinc-400">
          Instalações, visitas e execuções agendadas.
        </p>
      </div>

      <div className="space-y-5">
        {ordens.map((os) => (
          <div
            key={os.id}
            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-orange-500">
                  {os.number}
                </p>

                <h2 className="mt-1 text-2xl font-bold text-white">
                  {os.title}
                </h2>

                <p className="mt-2 text-zinc-400">
                  {os.project.client.name}
                </p>
              </div>

              <span className="rounded-full bg-orange-500/10 px-4 py-2 text-sm font-semibold text-orange-500">
                {formatDate(os.scheduledDate)}
              </span>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-4">
              <Info
                label="Projeto"
                value={os.project.title}
              />

              <Info
                label="Responsável"
                value={
                  os.responsible ?? "-"
                }
              />

              <Info
                label="Equipe"
                value={os.team ?? "-"}
              />

              <Info
                label="Status"
                value={os.status}
              />
            </div>

            <Link
              href={`/os/${os.id}`}
              className="mt-6 inline-flex rounded-xl bg-orange-500 px-5 py-3 font-bold text-white hover:bg-orange-600"
            >
              Abrir Ordem de Serviço
            </Link>
          </div>
        ))}

        {ordens.length === 0 && (
          <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900 p-12 text-center">
            <h2 className="text-xl font-bold text-white">
              Nenhuma atividade agendada
            </h2>

            <p className="mt-2 text-zinc-500">
              As Ordens de Serviço agendadas aparecerão aqui.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-sm text-zinc-500">
        {label}
      </p>

      <p className="mt-1 font-semibold text-white">
        {value}
      </p>
    </div>
  );
}