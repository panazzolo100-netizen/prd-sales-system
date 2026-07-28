import { LeadStatus } from "@/lib/generated/prisma/enums";
import { sendEmail } from "@/services/email.service";

const NOTIFIABLE_STAGES = new Set<LeadStatus>([
  LeadStatus.PROPOSTA,
  LeadStatus.GANHO,
  LeadStatus.PERDIDO,
]);

const stageLabels: Record<LeadStatus, string> = {
  [LeadStatus.NOVO]: "Novo",
  [LeadStatus.CONTATO]: "Contato",
  [LeadStatus.VISITA]: "Visita",
  [LeadStatus.PROPOSTA]: "Proposta",
  [LeadStatus.NEGOCIACAO]: "Negociação",
  [LeadStatus.GANHO]: "Ganho",
  [LeadStatus.PERDIDO]: "Perdido",
};

const subjects: Partial<Record<LeadStatus, string>> = {
  [LeadStatus.PROPOSTA]: "Pipeline — nova oportunidade em Proposta",
  [LeadStatus.GANHO]: "Pipeline — oportunidade ganha",
  [LeadStatus.PERDIDO]: "Pipeline — oportunidade perdida",
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatCurrency(value: number | null) {
  if (value === null || !Number.isFinite(value)) return "Valor não informado";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function pipelineUrl() {
  const configuredUrl =
    process.env.APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (!configuredUrl) return null;
  const baseUrl = configuredUrl.startsWith("http")
    ? configuredUrl
    : `https://${configuredUrl}`;
  try {
    return new URL("/pipeline", baseUrl).toString();
  } catch {
    return null;
  }
}

export async function notifyPipelineStageChange(input: {
  previousStatus: LeadStatus;
  newStatus: LeadStatus;
  opportunityName: string;
  companyName: string;
  estimatedValue: number | null;
  proposalAmount: number | null;
  ownerName: string | null;
  movedByName: string;
}) {
  if (
    input.previousStatus === input.newStatus ||
    !NOTIFIABLE_STAGES.has(input.newStatus)
  ) {
    return;
  }

  const recipient = process.env.PIPELINE_NOTIFICATION_EMAIL?.trim();
  if (!recipient) {
    console.warn(
      "Notificação de Pipeline não enviada: PIPELINE_NOTIFICATION_EMAIL não configurada."
    );
    return;
  }

  const movedAt = new Date();
  const link = pipelineUrl();
  const value = input.proposalAmount ?? input.estimatedValue;
  const rows = [
    ["Oportunidade", input.opportunityName],
    ["Cliente", input.companyName],
    [
      "Movimentação",
      `${stageLabels[input.previousStatus]} → ${stageLabels[input.newStatus]}`,
    ],
    ["Valor", formatCurrency(value)],
    ["Responsável", input.ownerName ?? "Não informado"],
    ["Movido por", input.movedByName],
    [
      "Data",
      movedAt.toLocaleString("pt-BR", {
        timeZone: "America/Cuiaba",
        dateStyle: "short",
        timeStyle: "short",
      }),
    ],
  ];
  const html = `
    <div style="font-family:Arial,sans-serif;color:#18181b;line-height:1.5">
      <h2 style="margin-bottom:20px">Atualização do Pipeline</h2>
      <table style="border-collapse:collapse">
        ${rows
          .map(
            ([label, content]) =>
              `<tr><td style="padding:6px 18px 6px 0;color:#71717a">${escapeHtml(label)}</td><td style="padding:6px 0;font-weight:600">${escapeHtml(content)}</td></tr>`
          )
          .join("")}
      </table>
      ${
        link
          ? `<p style="margin-top:24px"><a href="${escapeHtml(link)}" style="color:#ea580c">Acessar o Pipeline</a></p>`
          : ""
      }
    </div>
  `;

  const result = await sendEmail({
    to: recipient,
    subject: subjects[input.newStatus]!,
    html,
  });
  if (!result.sent) {
    console.warn(
      "Notificação de Pipeline não enviada: RESEND_API_KEY ou EMAIL_FROM não configurada."
    );
  }
}
