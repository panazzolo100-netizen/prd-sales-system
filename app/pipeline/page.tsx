import Link from "next/link";
import {
  AlertTriangle,
  Calendar,
  DollarSign,
} from "lucide-react";

import { AppLayout } from "@/components/layout/AppLayout";
import { LeadStatus } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

const COMPANY_ID = "default-company";

const etapas = [
  {
    status: LeadStatus.NOVO,
    nome: "Novo",
  },
  {
    status: LeadStatus.CONTATO,
    nome: "Contato",
  },
  {
    status: LeadStatus.VISITA,
    nome: "Visita",
  },
  {
    status: LeadStatus.PROPOSTA,
    nome: "Proposta",
  },
  {
    status: LeadStatus.NEGOCIACAO,
    nome: "Negociação",
  },
  {
    status: LeadStatus.GANHO,
    nome: "Ganho",
  },
  {
    status: LeadStatus.PERDIDO,
    nome: "Perdido",
  },
];

function formatCurrency(value: number | null) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

function daysSince(date: Date) {
  const now = new Date();

  const difference =
    now.getTime() - date.getTime();

  const days = Math.floor(
    difference / (1000 * 60 * 60 * 24)
  );

  if (days <= 0) {
    return "Hoje";
  }

  if (days === 1) {
    return "1 dia";
  }

  return `${days} dias`;
}

export default async function PipelinePage() {
  const leads = await prisma.lead.findMany({
    where: {
      companyId: COMPANY_ID,
    },

    include: {
      owner: {
        select: {
          name: true,
        },
      },

      activities: {
        orderBy: {
          createdAt: "desc",
        },

        take: 1,
      },
    },

    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-white">
            Pipeline Comercial
          </h1>

          <p className="mt-2 text-zinc-400">
            Acompanhe as oportunidades reais por etapa de venda.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-7">
          {etapas.map((etapa) => {
            const leadsDaEtapa =
              leads.filter(
                (lead) =>
                  lead.status === etapa.status
              );

            return (
              <div
                key={etapa.status}
                className="min-h-[650px] rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
              >
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-white">
                      {etapa.nome}
                    </h2>

                    <p className="text-sm text-zinc-500">
                      {leadsDaEtapa.length} oportunidade(s)
                    </p>
                  </div>

                  <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs text-zinc-400">
                    {leadsDaEtapa.length}
                  </span>
                </div>

                <div className="space-y-4">
                  {leadsDaEtapa.map((lead) => {
                    const referenceDate =
                      lead.activities[0]
                        ?.createdAt ??
                      lead.updatedAt;

                    const stoppedDays =
                      Math.floor(
                        (Date.now() -
                          referenceDate.getTime()) /
                          (1000 *
                            60 *
                            60 *
                            24)
                      );

                    const hasAlert =
                      stoppedDays >= 5 &&
                      lead.status !==
                        LeadStatus.GANHO &&
                      lead.status !==
                        LeadStatus.PERDIDO;

                    return (
                      <Link
                        key={lead.id}
                        href="/leads"
                        className={`block rounded-xl border p-4 transition hover:border-orange-500 ${
                          hasAlert
                            ? "border-red-500/60 bg-red-950/20"
                            : "border-zinc-800 bg-zinc-900"
                        }`}
                      >
                        <div className="mb-3">
                          <h3 className="font-bold text-white">
                            {lead.companyName}
                          </h3>

                          <p className="mt-1 text-xs text-zinc-500">
                            {lead.contactName}
                          </p>
                        </div>

                        <div className="space-y-3 text-sm text-zinc-300">
                          <div className="flex items-center gap-2">
                            <DollarSign
                              size={15}
                              className="text-orange-500"
                            />

                            {formatCurrency(
                              lead.estimatedValue
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <Calendar
                              size={15}
                              className="text-orange-500"
                            />

                            Atualizado há{" "}
                            {daysSince(
                              referenceDate
                            )}
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-4">
                          <span className="text-xs text-zinc-500">
                            {lead.owner?.name ??
                              "Sem responsável"}
                          </span>

                          {hasAlert && (
                            <span className="flex items-center gap-1 text-xs text-red-400">
                              <AlertTriangle
                                size={14}
                              />

                              Sem retorno
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}

                  {leadsDaEtapa.length === 0 && (
                    <div className="rounded-xl border border-dashed border-zinc-800 p-5 text-center text-sm text-zinc-600">
                      Nenhuma oportunidade
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}