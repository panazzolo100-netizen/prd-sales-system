"use client";

import {
  FileText,
  Printer,
} from "lucide-react";

import type { ProposalListItem } from "@/types/proposal";

type Props = {
  proposal: ProposalListItem;
};

function formatCurrency(
  value: number | null
) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value ?? 0);
}

function formatDate(
  value: Date | string | null
) {
  if (!value) {
    return "Não informada";
  }

  return new Intl.DateTimeFormat(
    "pt-BR"
  ).format(new Date(value));
}

function escapeHtml(
  value: string | null | undefined
) {
  return (value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatMultilineText(
  value: string | null
) {
  if (!value?.trim()) {
    return "Não informado.";
  }

  return escapeHtml(value).replaceAll(
    "\n",
    "<br />"
  );
}

export function ProposalPdfTab({
  proposal,
}: Props) {
  function generatePdf() {
    const pdfWindow = window.open(
      "",
      "_blank",
      "width=1100,height=800"
    );

    if (!pdfWindow) {
      alert(
        "Permita pop-ups no navegador para gerar o PDF."
      );

      return;
    }

    const companyName =
      proposal.lead?.companyName ??
      "Cliente não informado";

    const contactName =
      proposal.lead?.contactName ?? "-";

    const phone =
      proposal.lead?.phone ?? "-";

    const location = [
      proposal.lead?.city,
      proposal.lead?.state,
    ]
      .filter(Boolean)
      .join(" - ");

    const validity =
      formatDate(
        proposal.validUntil
      );

    const executionDeadline =
      proposal.executionDeadline?.trim() ||
      "Não informado.";

    const paymentTerms =
      formatMultilineText(
        proposal.paymentTerms
      );

    const commercialNotes =
      formatMultilineText(
        proposal.commercialNotes
      );

    pdfWindow.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8" />

          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />

          <title>
            ${escapeHtml(proposal.title)}
          </title>

          <style>
            * {
              box-sizing: border-box;
            }

            html,
            body {
              margin: 0;
              padding: 0;
              background: #ffffff;
              color: #18181b;
              font-family:
                Arial,
                Helvetica,
                sans-serif;
            }

            body {
              padding: 36px;
            }

            .page {
              width: 100%;
              max-width: 980px;
              margin: 0 auto;
            }

            .header {
              display: flex;
              align-items: flex-start;
              justify-content: space-between;
              gap: 32px;
              padding-bottom: 24px;
              border-bottom: 4px solid #f97316;
            }

            .brand {
              font-size: 34px;
              font-weight: 900;
              letter-spacing: -1px;
            }

            .brand span {
              color: #f97316;
            }

            .brand-subtitle {
              margin-top: 7px;
              color: #71717a;
              font-size: 14px;
            }

            .document-info {
              text-align: right;
              color: #52525b;
              font-size: 13px;
              line-height: 1.7;
            }

            .hero {
              margin-top: 34px;
              padding: 28px;
              border-radius: 18px;
              background: #18181b;
              color: #ffffff;
            }

            .hero-label {
              color: #fb923c;
              font-size: 12px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 2px;
            }

            .hero h1 {
              margin: 10px 0 0;
              font-size: 30px;
              line-height: 1.2;
            }

            .hero p {
              margin: 10px 0 0;
              color: #d4d4d8;
              font-size: 15px;
            }

            .section {
              margin-top: 30px;
            }

            .section-title {
              margin-bottom: 14px;
              color: #f97316;
              font-size: 17px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }

            .grid {
              display: grid;
              grid-template-columns:
                repeat(2, minmax(0, 1fr));
              gap: 14px;
            }

            .card {
              padding: 18px;
              border: 1px solid #e4e4e7;
              border-radius: 12px;
              background: #ffffff;
            }

            .label {
              color: #71717a;
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.7px;
            }

            .value {
              margin-top: 7px;
              color: #18181b;
              font-size: 17px;
              font-weight: 800;
              overflow-wrap: anywhere;
            }

            .investment {
              margin-top: 30px;
              padding: 28px;
              border-radius: 18px;
              background: #18181b;
              text-align: center;
              color: #ffffff;
            }

            .investment-label {
              color: #d4d4d8;
              font-size: 13px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }

            .investment-value {
              margin-top: 10px;
              color: #f97316;
              font-size: 40px;
              font-weight: 900;
            }

            .commercial-grid {
              display: grid;
              grid-template-columns:
                repeat(2, minmax(0, 1fr));
              gap: 14px;
            }

            .commercial-card {
              padding: 18px;
              border: 1px solid #e4e4e7;
              border-radius: 12px;
              background: #fafafa;
              break-inside: avoid;
            }

            .commercial-card.full {
              grid-column: 1 / -1;
            }

            .commercial-content {
              margin-top: 8px;
              color: #3f3f46;
              font-size: 14px;
              line-height: 1.7;
              white-space: normal;
              overflow-wrap: anywhere;
            }

            .signatures {
              display: grid;
              grid-template-columns:
                repeat(2, minmax(0, 1fr));
              gap: 60px;
              margin-top: 70px;
            }

            .signature {
              padding-top: 10px;
              border-top: 1px solid #71717a;
              text-align: center;
              color: #52525b;
              font-size: 13px;
            }

            .footer {
              margin-top: 46px;
              padding-top: 18px;
              border-top: 1px solid #e4e4e7;
              text-align: center;
              color: #71717a;
              font-size: 11px;
              line-height: 1.6;
            }

            @page {
              size: A4;
              margin: 14mm;
            }

            @media print {
              body {
                padding: 0;
              }

              .page {
                max-width: none;
              }

              .card,
              .hero,
              .investment,
              .commercial-card {
                break-inside: avoid;
              }
            }
          </style>
        </head>

        <body>
          <main class="page">
            <header class="header">
              <div>
                <div class="brand">
                  PRD <span>Engenharia</span>
                </div>

                <div class="brand-subtitle">
                  Soluções em Engenharia e Energia
                </div>
              </div>

              <div class="document-info">
                <strong>
                  ${escapeHtml(proposal.title)}
                </strong>

                <br />

                Emissão:
                ${new Date().toLocaleDateString(
                  "pt-BR"
                )}

                <br />

                Validade:
                ${escapeHtml(validity)}
              </div>
            </header>

            <section class="hero">
              <div class="hero-label">
                Proposta comercial
              </div>

              <h1>
                ${escapeHtml(companyName)}
              </h1>

              <p>
                Solução técnica e comercial
                desenvolvida pela PRD Engenharia.
              </p>
            </section>

            <section class="section">
              <div class="section-title">
                Dados do cliente
              </div>

              <div class="grid">
                <div class="card">
                  <div class="label">
                    Empresa
                  </div>

                  <div class="value">
                    ${escapeHtml(companyName)}
                  </div>
                </div>

                <div class="card">
                  <div class="label">
                    Contato
                  </div>

                  <div class="value">
                    ${escapeHtml(contactName)}
                  </div>
                </div>

                <div class="card">
                  <div class="label">
                    Telefone
                  </div>

                  <div class="value">
                    ${escapeHtml(phone)}
                  </div>
                </div>

                <div class="card">
                  <div class="label">
                    Localização
                  </div>

                  <div class="value">
                    ${escapeHtml(
                      location || "-"
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section class="section">
              <div class="section-title">
                Indicadores do projeto
              </div>

              <div class="grid">
                <div class="card">
                  <div class="label">
                    Potência instalada
                  </div>

                  <div class="value">
                    ${
                      proposal.systemPower ??
                      "-"
                    } kWp
                  </div>
                </div>

                <div class="card">
                  <div class="label">
                    Economia mensal estimada
                  </div>

                  <div class="value">
                    ${formatCurrency(
                      proposal.monthlySaving
                    )}
                  </div>
                </div>

                <div class="card">
                  <div class="label">
                    Economia anual estimada
                  </div>

                  <div class="value">
                    ${formatCurrency(
                      proposal.annualSaving
                    )}
                  </div>
                </div>

                <div class="card">
                  <div class="label">
                    Retorno estimado
                  </div>

                  <div class="value">
                    ${
                      proposal.payback ?? "-"
                    } anos
                  </div>
                </div>
              </div>
            </section>

            <section class="investment">
              <div class="investment-label">
                Investimento total
              </div>

              <div class="investment-value">
                ${formatCurrency(
                  proposal.amount
                )}
              </div>
            </section>

            <section class="section">
              <div class="section-title">
                Condições comerciais
              </div>

              <div class="commercial-grid">
                <div class="commercial-card">
                  <div class="label">
                    Validade da proposta
                  </div>

                  <div class="commercial-content">
                    ${escapeHtml(validity)}
                  </div>
                </div>

                <div class="commercial-card">
                  <div class="label">
                    Prazo de execução
                  </div>

                  <div class="commercial-content">
                    ${escapeHtml(
                      executionDeadline
                    )}
                  </div>
                </div>

                <div class="commercial-card full">
                  <div class="label">
                    Condições de pagamento
                  </div>

                  <div class="commercial-content">
                    ${paymentTerms}
                  </div>
                </div>

                <div class="commercial-card full">
                  <div class="label">
                    Observações comerciais
                  </div>

                  <div class="commercial-content">
                    ${commercialNotes}
                  </div>
                </div>
              </div>
            </section>

            <section class="signatures">
              <div class="signature">
                PRD Soluções em Engenharia
              </div>

              <div class="signature">
                ${escapeHtml(companyName)}
              </div>
            </section>

            <footer class="footer">
              PRD Soluções em Engenharia —
              Documento emitido pelo sistema
              interno de gestão comercial.
              <br />
              Proposta sujeita à validação
              técnica, comercial e disponibilidade
              dos equipamentos.
            </footer>
          </main>

          <script>
            window.onload = function () {
              window.print();
            };
          </script>
        </body>
      </html>
    `);

    pdfWindow.document.close();
  }

  return (
    <div className="rounded-3xl border border-white/[0.07] bg-zinc-900/60 p-8">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400">
        <FileText size={25} />
      </div>

      <h2 className="mt-5 text-2xl font-black text-white">
        Documento da proposta
      </h2>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
        O PDF utilizará os dados técnicos e as condições comerciais salvas na proposta.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <PreviewItem
          label="Validade"
          value={formatDate(
            proposal.validUntil
          )}
        />

        <PreviewItem
          label="Prazo de execução"
          value={
            proposal.executionDeadline ??
            "Não informado"
          }
        />

        <PreviewItem
          label="Pagamento"
          value={
            proposal.paymentTerms ??
            "Não informado"
          }
        />

        <PreviewItem
          label="Observações"
          value={
            proposal.commercialNotes ??
            "Não informado"
          }
        />
      </div>

      <button
        type="button"
        onClick={generatePdf}
        className="mt-6 flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-400"
      >
        <Printer size={17} />

        Imprimir / Salvar PDF
      </button>
    </div>
  );
}

type PreviewItemProps = {
  label: string;
  value: string;
};

function PreviewItem({
  label,
  value,
}: PreviewItemProps) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-zinc-950 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </p>

      <p className="mt-2 line-clamp-3 text-sm leading-6 text-white">
        {value}
      </p>
    </div>
  );
}