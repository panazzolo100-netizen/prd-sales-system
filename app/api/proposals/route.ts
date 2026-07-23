import { NextResponse } from "next/server";

import {
  deleteCompanyProposal,
  getProposal,
  saveProposal,
} from "@/services/proposals.service";

export async function DELETE(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get("id")?.trim();

    if (!id) {
      return NextResponse.json(
        { error: "Proposta obrigatória." },
        { status: 400 }
      );
    }

    await deleteCompanyProposal(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro ao excluir proposta.";
    return NextResponse.json(
      { error: message },
      {
        status: message.includes("não encontrada")
          ? 404
          : message.includes("não pode") ||
              message.includes("mudou")
            ? 409
            : 500,
      }
    );
  }
}

function hasField(
  body: Record<string, unknown>,
  field: string
) {
  return Object.prototype.hasOwnProperty.call(
    body,
    field
  );
}

function nullableString(
  value: unknown
) {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const text = String(value).trim();

  return text.length > 0
    ? text
    : null;
}

function nullableNumber(
  value: unknown
) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
}

function nullableDate(
  value: unknown
) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const date = new Date(
    String(value)
  );

  if (
    Number.isNaN(date.getTime())
  ) {
    throw new Error(
      "Data de validade inválida."
    );
  }

  return date;
}

export async function GET(
  request: Request
) {
  try {
    const { searchParams } =
      new URL(request.url);

    const leadId =
      searchParams.get("leadId");

    if (!leadId) {
      return NextResponse.json(
        {
          error: "Lead obrigatório.",
        },
        {
          status: 400,
        }
      );
    }

    const proposal =
      await getProposal(leadId);

    return NextResponse.json(
      proposal
    );
  } catch (error) {
    console.error(
      "ERRO AO BUSCAR PROPOSTA:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Erro ao buscar proposta.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: Request
) {
  try {
    const body =
      (await request.json()) as Record<
        string,
        unknown
      >;

    const leadId =
      typeof body.leadId === "string"
        ? body.leadId
        : "";

    if (!leadId) {
      return NextResponse.json(
        {
          error: "Lead obrigatório.",
        },
        {
          status: 400,
        }
      );
    }

    const proposal =
      await saveProposal(
        leadId,
        {
          ...(hasField(body, "title")
            ? {
                title:
                  nullableString(
                    body.title
                  ) ??
                  "Proposta Solar",
              }
            : {}),

          ...(hasField(body, "amount")
            ? {
                amount:
                  nullableNumber(
                    body.amount
                  ) ?? 0,
              }
            : {}),

          ...(hasField(body, "status")
            ? {
                status:
                  nullableString(
                    body.status
                  ) ??
                  "RASCUNHO",
              }
            : {}),

          ...(hasField(
            body,
            "validUntil"
          )
            ? {
                validUntil:
                  nullableDate(
                    body.validUntil
                  ),
              }
            : {}),

          ...(hasField(
            body,
            "paymentTerms"
          )
            ? {
                paymentTerms:
                  nullableString(
                    body.paymentTerms
                  ),
              }
            : {}),

          ...(hasField(
            body,
            "executionDeadline"
          )
            ? {
                executionDeadline:
                  nullableString(
                    body.executionDeadline
                  ),
              }
            : {}),

          ...(hasField(
            body,
            "commercialNotes"
          )
            ? {
                commercialNotes:
                  nullableString(
                    body.commercialNotes
                  ),
              }
            : {}),

          ...(hasField(
            body,
            "systemPower"
          )
            ? {
                systemPower:
                  nullableNumber(
                    body.systemPower
                  ),
              }
            : {}),

          ...(hasField(
            body,
            "monthlySaving"
          )
            ? {
                monthlySaving:
                  nullableNumber(
                    body.monthlySaving
                  ),
              }
            : {}),

          ...(hasField(
            body,
            "annualSaving"
          )
            ? {
                annualSaving:
                  nullableNumber(
                    body.annualSaving
                  ),
              }
            : {}),

          ...(hasField(body, "payback")
            ? {
                payback:
                  nullableNumber(
                    body.payback
                  ),
              }
            : {}),
        }
      );

    return NextResponse.json(
      proposal,
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "ERRO AO SALVAR PROPOSTA:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Erro ao salvar proposta.";

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 500,
      }
    );
  }
}
