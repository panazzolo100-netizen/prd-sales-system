import {
  CheckCircle2,
  CircleAlert,
  FileCheck2,
  ImageIcon,
  ListChecks,
  ShieldCheck,
} from "lucide-react";
import { notFound } from "next/navigation";

import { getPublicServiceOrderValidationData } from "@/services/service-orders.service";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatDate(
  value: Date | string | null
) {
  if (!value) {
    return "Não informado";
  }

  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: "America/Cuiaba",
    }
  ).format(new Date(value));
}

function formatStatus(
  status: string
) {
  return status
    .replaceAll("_", " ")
    .toLocaleLowerCase("pt-BR")
    .replace(/\b\w/g, (letter) =>
      letter.toLocaleUpperCase("pt-BR")
    );
}

export default async function ValidateServiceOrderPage({
  params,
}: PageProps) {
  const { id } = await params;

  const serviceOrder =
    await getPublicServiceOrderValidationData(
      id
    );

  if (!serviceOrder) {
    notFound();
  }

  const checklistValues = [
    serviceOrder.checklistArt,
    serviceOrder.checklistProjectApproved,
    serviceOrder.checklistMaterialsSeparated,
    serviceOrder.checklistStructureInstalled,
    serviceOrder.checklistModulesInstalled,
    serviceOrder.checklistInverterInstalled,
    serviceOrder.checklistDcCabling,
    serviceOrder.checklistAcCabling,
    serviceOrder.checklistCommissioning,
    serviceOrder.checklistCustomerTraining,
    serviceOrder.checklistDelivered,
  ];

  const completed =
    checklistValues.filter(Boolean).length;

  const total = checklistValues.length;

  const percentage = Math.round(
    (completed / total) * 100
  );

  const isSigned =
    Boolean(
      serviceOrder.customerSignature
    ) ||
    Boolean(
      serviceOrder.technicianSignature
    );

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <header className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl">
          <div className="h-2 bg-orange-600" />

          <div className="p-6 sm:p-8">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
              <div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <ShieldCheck size={21} />

                  <span className="text-sm font-semibold">
                    Documento autêntico
                  </span>
                </div>

                <h1 className="mt-4 text-3xl font-bold tracking-tight text-white">
                  {serviceOrder.number}
                </h1>

                <p className="mt-2 text-lg font-semibold text-zinc-200">
                  {serviceOrder.title}
                </p>

                <p className="mt-2 text-sm text-zinc-400">
                  {serviceOrder.project.title}
                </p>
              </div>

              <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-orange-300">
                  Status atual
                </p>

                <p className="mt-1 font-bold text-orange-400">
                  {formatStatus(
                    serviceOrder.status
                  )}
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={ListChecks}
            label="Progresso"
            value={`${percentage}%`}
          />

          <MetricCard
            icon={FileCheck2}
            label="Checklist"
            value={`${completed}/${total}`}
          />

          <MetricCard
            icon={ImageIcon}
            label="Fotos"
            value={String(
              serviceOrder.photosCount
            )}
          />

          <MetricCard
            icon={
              isSigned
                ? CheckCircle2
                : CircleAlert
            }
            label="Assinatura"
            value={
              isSigned
                ? "Registrada"
                : "Pendente"
            }
          />
        </section>

        <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-lg font-bold text-white">
            Informações da execução
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Information
              label="Cliente"
              value={
                serviceOrder.project.client
                  .name
              }
            />

            <Information
              label="Responsável"
              value={
                serviceOrder.responsible ||
                "Não informado"
              }
            />

            <Information
              label="Data agendada"
              value={formatDate(
                serviceOrder.scheduledDate
              )}
            />

            <Information
              label="Data de conclusão"
              value={formatDate(
                serviceOrder.completedDate
              )}
            />

            <Information
              label="Assinada em"
              value={formatDate(
                serviceOrder.signedAt
              )}
            />

            <Information
              label="Código de validação"
              value={serviceOrder.id}
            />
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-lg font-bold text-white">
            Serviços registrados
          </h2>

          <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
            {serviceOrder.services ||
              "Nenhum serviço informado."}
          </p>
        </section>

        <footer className="py-8 text-center text-xs text-zinc-600">
          PRD Soluções em Engenharia • Validação digital de Ordem de Serviço
        </footer>
      </div>
    </main>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ShieldCheck;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <Icon
        size={20}
        className="text-orange-500"
      />

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold text-white">
        {value}
      </p>
    </div>
  );
}

function Information({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-medium text-zinc-200">
        {value}
      </p>
    </div>
  );
}